import { useCallback, useEffect, useRef } from "react";
import { fetchEventSource } from "@microsoft/fetch-event-source";

import axiosInstance, { API_BASE_URL } from "@/core/api/axiosInstance";
import { useAuthStore } from "@/modules/auth/domain/authStore";
import { type InvoiceExportProgressEvent } from "../api/erpInvoicesCoreApi";
import { useInvoiceExportProgressStore } from "@/shared/stores/useInvoiceExportProgressStore";

export function useInvoiceExportProgress() {
  const token = useAuthStore((s) => s.accessToken);
  const setProgress = useInvoiceExportProgressStore((s) => s.setProgress);
  const isConnecting = useRef(false);
  const controller = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!token) {
      setProgress({ sseConnected: false });
      return;
    }
    if (isConnecting.current) return;

    isConnecting.current = true;
    controller.current = new AbortController();

    const url = `${API_BASE_URL}/api/v1/erp-invoices/export/excel/progress/stream`;

    const connect = async () => {
      try {
        await fetchEventSource(url, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          signal: controller.current?.signal,
          onopen(res) {
            if (res.ok && res.status === 200) {
              setProgress({ sseConnected: true, lastEventAt: Date.now() });
              return Promise.resolve();
            }
            setProgress({ sseConnected: false });
            return Promise.reject(
              new Error(`Failed to open invoice export SSE: ${res.status}`),
            );
          },
          onmessage(ev) {
            if (!ev.data) return;

            try {
              const data = JSON.parse(ev.data) as InvoiceExportProgressEvent;
              if (data.processId === "ping") {
                setProgress({ sseConnected: true, lastEventAt: Date.now() });
                return;
              }

              setProgress({
                jobId: data.jobId,
                fileName: data.fileName,
                current: data.current ?? 0,
                total: data.total ?? 100,
                isRunning: data.isRunning ?? false,
                completed: data.completed ?? false,
                ready: data.ready ?? false,
                failed: data.failed ?? false,
                message: data.message,
                sseConnected: true,
                lastEventAt: Date.now(),
              });
            } catch (err) {
              console.error("Failed to parse invoice export SSE", err);
            }
          },
          onerror(err) {
            setProgress({ sseConnected: false });
            console.error("Invoice export SSE error", err);
            throw err;
          },
        });
      } catch (err) {
        setProgress({ sseConnected: false });
        console.error("fetchEventSource error for invoice export", err);
      }
    };

    void connect();

    return () => {
      if (controller.current) {
        controller.current.abort();
      }
      setProgress({ sseConnected: false });
      isConnecting.current = false;
    };
  }, [token, setProgress]);

  const downloadReadyFile = useCallback(
    async (
      jobId: string,
      fileName?: string,
      onProgress?: (loaded: number, total?: number) => void,
    ) => {
      if (!token) {
        throw new Error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
      }

      const url = `/api/v1/erp-invoices/export/excel/background/${encodeURIComponent(jobId)}/download`;

      const response = await axiosInstance.get<Blob>(url, {
        responseType: "blob",
        timeout: 300000,
        onDownloadProgress: (event) => {
          if (!onProgress) return;
          onProgress(event.loaded, event.total);
        },
      });

      const contentDisposition =
        response.headers?.["content-disposition"] ||
        response.headers?.["Content-Disposition"];

      const quotedFileName = contentDisposition
        ?.match(/filename\*?=(?:UTF-8''|")?([^";]+)/i)?.[1]
        ?.trim();

      const rawFileName = (
        quotedFileName ||
        fileName ||
        "invoices.xlsx"
      ).replace(/"/g, "");
      const resolvedFileName = (() => {
        try {
          return decodeURIComponent(rawFileName);
        } catch {
          return rawFileName;
        }
      })();

      const blob =
        response.data instanceof Blob
          ? response.data
          : new Blob([response.data], {
              type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            });
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = blobUrl;
      a.download = resolvedFileName;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        if (document.body.contains(a)) {
          document.body.removeChild(a);
        }
        window.URL.revokeObjectURL(blobUrl);
      }, 2000);
    },
    [token],
  );

  return { downloadReadyFile };
}
