import { useEffect, useRef } from "react";
import { fetchEventSource } from "@microsoft/fetch-event-source";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

import { API_BASE_URL } from "@/core/api/axiosInstance";
import { useAuthStore } from "@/modules/auth/domain/authStore";
import {
  vinfastPartsStockExportApi,
  type VinfastPartsStockExportProgressEvent,
} from "@/pages/api/vinfastPartsStockExportApi";
import { useVinfastPartsStockExportProgressStore } from "@/shared/stores/useVinfastPartsStockExportProgressStore";

export function useVinfastPartsStockExportProgress() {
  const { t } = useTranslation("erpInvoices");
  const token = useAuthStore((s) => s.accessToken);
  const updateProgress = useVinfastPartsStockExportProgressStore(
    (s) => s.updateProgress,
  );
  const setSseConnected = useVinfastPartsStockExportProgressStore(
    (s) => s.setSseConnected,
  );
  const store = useVinfastPartsStockExportProgressStore();
  const isConnecting = useRef(false);
  const controller = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!token) {
      setSseConnected(false);
      return;
    }
    if (isConnecting.current) return;

    isConnecting.current = true;
    controller.current = new AbortController();

    const url = `${API_BASE_URL}/api/v1/vinfast-parts/stock/export/excel/progress/stream`;

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
              setSseConnected(true);
              return Promise.resolve();
            }
            setSseConnected(false);
            return Promise.reject(
              new Error(
                `Failed to open vinfast parts stock export SSE: ${res.status}`,
              ),
            );
          },
          onmessage(ev) {
            if (!ev.data) return;

            try {
              const data = JSON.parse(
                ev.data,
              ) as VinfastPartsStockExportProgressEvent;
              if (data.processId === "ping") {
                setSseConnected(true);
                updateProgress({ lastEventAt: Date.now() });
                return;
              }

              if (data.processId === "vinfast-parts-stock-xlsx-export") {
                updateProgress({
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

                if (data.failed) {
                  toast.error(
                    data.message ||
                      t(
                        "erpInvoices:exportProgress.failed",
                        "Tạo file thất bại.",
                      ),
                  );
                } else if (data.ready) {
                  toast.success(
                    t(
                      "erpInvoices:exportProgress.ready",
                      "File đã sẵn sàng. Có thể tải xuống.",
                    ),
                  );
                }
              }
            } catch (err) {
              console.error(
                "Failed to parse vinfast parts stock export SSE",
                err,
              );
            }
          },
          onerror(err) {
            setSseConnected(false);
            console.error("Vinfast parts stock export SSE error", err);
            throw err;
          },
        });
      } catch (err) {
        setSseConnected(false);
        console.error(
          "fetchEventSource error for vinfast parts stock export",
          err,
        );
      }
    };

    void connect();

    return () => {
      if (controller.current) {
        controller.current.abort();
      }
      setSseConnected(false);
      isConnecting.current = false;
    };
  }, [token, updateProgress, setSseConnected, t]);

  const downloadReadyFile = async (
    jobIdToDownload?: string,
    customFileName?: string,
  ) => {
    const targetJobId = jobIdToDownload || store.jobId;
    if (!targetJobId) {
      throw new Error(
        t(
          "erpInvoices:exportProgress.noJob",
          "Không có file nào đang sẵn sàng.",
        ),
      );
    }

    const response =
      await vinfastPartsStockExportApi.downloadBackgroundFile(targetJobId);

    const url = window.URL.createObjectURL(response);
    const link = document.createElement("a");
    link.href = url;

    link.setAttribute(
      "download",
      customFileName || store.fileName || "vinfast-parts-stock.xlsx",
    );
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  };

  return { downloadReadyFile };
}
