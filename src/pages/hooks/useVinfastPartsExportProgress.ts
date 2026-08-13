import { useEffect, useRef } from "react";
import { fetchEventSource } from "@microsoft/fetch-event-source";

import axiosInstance, { API_BASE_URL } from "@/core/api/axiosInstance";
import { useAuthStore } from "@/modules/auth/domain/authStore";
import {
  vinfastPartsExportApi,
  type VinfastPartsExportProgressEvent,
} from "@/pages/api/vinfastPartsExportApi";
import { useVinfastPartsExportProgressStore } from "@/shared/stores/useVinfastPartsExportProgressStore";

export function useVinfastPartsExportProgress() {
  const token = useAuthStore((s) => s.accessToken);
  const setProgress = useVinfastPartsExportProgressStore((s) => s.setProgress);
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

    const url = `${API_BASE_URL}/api/v1/reports/vinfast-parts/export/excel/progress/stream`;

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
              new Error(`Failed to open vinfast export SSE: ${res.status}`),
            );
          },
          onmessage(ev) {
            if (!ev.data) return;

            try {
              const data = JSON.parse(
                ev.data,
              ) as VinfastPartsExportProgressEvent;
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
              console.error("Failed to parse vinfast export SSE", err);
            }
          },
          onerror(err) {
            setProgress({ sseConnected: false });
            console.error("Vinfast export SSE error", err);
            throw err;
          },
        });
      } catch (err) {
        setProgress({ sseConnected: false });
        console.error("fetchEventSource error for vinfast export", err);
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

  const downloadReadyFile = async (
    jobId: string,
    fileName?: string,
    onProgress?: (loaded: number, total?: number) => void,
  ) => {
    if (!token) {
      throw new Error("Phien dang nhap da het han. Vui long dang nhap lai.");
    }

    const response = await axiosInstance.get<Blob>(
      `/api/v1/reports/vinfast-parts/export/excel/background/${encodeURIComponent(jobId)}/download`,
      {
        responseType: "blob",
        timeout: 300000,
        onDownloadProgress: (event) => {
          if (!onProgress) return;
          onProgress(event.loaded, event.total);
        },
      },
    );

    const resolvedFileName = vinfastPartsExportApi.extractDownloadFileName(
      response.headers as Record<string, string>,
      fileName,
    );

    const blobUrl = window.URL.createObjectURL(response.data);
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = resolvedFileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => window.URL.revokeObjectURL(blobUrl), 1000);
  };

  return { downloadReadyFile };
}
