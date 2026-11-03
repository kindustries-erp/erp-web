import { useEffect, useRef } from "react";
import { fetchEventSource } from "@microsoft/fetch-event-source";
import { useAuthStore } from "@/modules/auth/domain/authStore";
import { V2_API_BASE_URL } from "@/v2/shared/api/v2HttpClient";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { useV2ToastStore } from "@/v2/shared/stores/useV2ToastStore";
import { bankStatementExportApi } from "../api/bankStatementExportApi";
import type { BankStatementExportProgressEvent } from "../api/dtos/bankStatementExport.dto";
import { useBankStatementExportProgressStore } from "../stores/useBankStatementExportProgressStore";

const STREAM_PATH =
  "/api/v1/bank-transactions-core/export/excel/progress/stream";
const EXPORT_PROCESS_ID = "bank-statement-xlsx-export";

/**
 * Nghe tiến độ xuất sao kê qua SSE và cung cấp tải file đã sẵn sàng.
 * Khi token đổi thì kết nối lại.
 */
export function useBankStatementExportProgress() {
  const { t } = useV2Translation();
  const token = useAuthStore((s) => s.accessToken);
  const updateProgress = useBankStatementExportProgressStore(
    (s) => s.updateProgress,
  );
  const setSseConnected = useBankStatementExportProgressStore(
    (s) => s.setSseConnected,
  );
  const store = useBankStatementExportProgressStore();
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

    const connect = async () => {
      try {
        await fetchEventSource(`${V2_API_BASE_URL}${STREAM_PATH}`, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.current?.signal,
          onopen(res) {
            if (res.ok && res.status === 200) {
              setSseConnected(true);
              return Promise.resolve();
            }
            setSseConnected(false);
            return Promise.reject(
              new Error(`SSE xuất sao kê mở thất bại: ${res.status}`),
            );
          },
          onmessage(ev) {
            if (!ev.data) return;
            try {
              const data = JSON.parse(
                ev.data,
              ) as BankStatementExportProgressEvent;
              if (data.processId === "ping") {
                setSseConnected(true);
                updateProgress({ lastEventAt: Date.now() });
                return;
              }
              if (data.processId !== EXPORT_PROCESS_ID) return;

              updateProgress({
                jobId: data.jobId ?? null,
                fileName: data.fileName ?? null,
                current: data.current ?? 0,
                total: data.total ?? 100,
                isRunning: data.isRunning ?? false,
                completed: data.completed ?? false,
                ready: data.ready ?? false,
                failed: data.failed ?? false,
                message: data.message ?? null,
                sseConnected: true,
              });

              const { showToast } = useV2ToastStore.getState();
              if (data.failed) {
                showToast({
                  title:
                    data.message ||
                    t(
                      "v2.bankStatements.export.progress.failed",
                      "Tạo file thất bại.",
                    ),
                  variant: "destructive",
                });
              }
            } catch (err) {
              console.error("Không đọc được tiến độ xuất sao kê", err);
            }
          },
          onerror(err) {
            setSseConnected(false);
            throw err;
          },
        });
      } catch (err) {
        setSseConnected(false);
        console.error("SSE xuất sao kê dừng", err);
      }
    };

    void connect();

    return () => {
      controller.current?.abort();
      setSseConnected(false);
      isConnecting.current = false;
    };
  }, [token, updateProgress, setSseConnected, t]);

  /** Tải file của job; mặc định là job đang theo dõi trong store */
  const downloadReadyFile = async (
    jobIdToDownload?: string,
    customFileName?: string,
  ) => {
    const targetJobId = jobIdToDownload || store.jobId;
    if (!targetJobId) {
      throw new Error(
        t(
          "v2.bankStatements.export.progress.noJob",
          "Không có file nào đang sẵn sàng.",
        ),
      );
    }

    const blob =
      await bankStatementExportApi.downloadBackgroundFile(targetJobId);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      customFileName || store.fileName || "sao_ke.xlsx",
    );
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  };

  return { downloadReadyFile };
}
