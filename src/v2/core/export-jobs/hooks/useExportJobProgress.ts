import { useEffect, useRef } from "react";
import { fetchEventSource } from "@microsoft/fetch-event-source";
import { useAuthStore } from "@/modules/auth/domain/authStore";
import { V2_API_BASE_URL } from "@/v2/shared/api/v2HttpClient";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { useV2ToastStore } from "@/v2/shared/stores/useV2ToastStore";
import type { ExportProgressStore } from "../stores/createExportProgressStore";
import type { ExportProgressEvent } from "../types/exportJobs.types";
import { saveBlob } from "../helpers/saveBlob";

interface I18nText {
  key: string;
  fallback: string;
}

export interface ExportJobProgressConfig {
  /** Đường dẫn SSE (không gồm base URL) */
  streamPath: string;
  /** `processId` của luồng; sự kiện khác bị bỏ qua */
  processId: string;
  useStore: ExportProgressStore;
  downloadFile: (jobId: string) => Promise<Blob>;
  defaultFileName: string;
  /** Nhãn dùng trong log/lỗi kết nối, ví dụ "xuất sao kê" */
  logLabel: string;
  text: {
    failed: I18nText;
    noJob: I18nText;
    /** Có thì hiện toast thành công khi file sẵn sàng */
    ready?: I18nText;
  };
}

/**
 * Nghe tiến độ job xuất nền qua SSE và cung cấp tải file đã sẵn sàng.
 * Chỉ mount một lần cho mỗi drawer; khi token đổi thì kết nối lại.
 */
export function useExportJobProgress(config: ExportJobProgressConfig) {
  const { streamPath, processId, useStore, logLabel, text } = config;
  const { t } = useV2Translation();
  const token = useAuthStore((s) => s.accessToken);
  const updateProgress = useStore((s) => s.updateProgress);
  const setSseConnected = useStore((s) => s.setSseConnected);
  const store = useStore();
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
        await fetchEventSource(`${V2_API_BASE_URL}${streamPath}`, {
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
              new Error(`SSE ${logLabel} mở thất bại: ${res.status}`),
            );
          },
          onmessage(ev) {
            if (!ev.data) return;
            try {
              const data = JSON.parse(ev.data) as ExportProgressEvent;
              if (data.processId === "ping") {
                setSseConnected(true);
                updateProgress({ lastEventAt: Date.now() });
                return;
              }
              if (data.processId !== processId) return;

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
                    data.message || t(text.failed.key, text.failed.fallback),
                  variant: "destructive",
                });
              } else if (data.ready && text.ready) {
                showToast({
                  title: t(text.ready.key, text.ready.fallback),
                  variant: "success",
                });
              }
            } catch (err) {
              console.error(`Không đọc được tiến độ ${logLabel}`, err);
            }
          },
          onerror(err) {
            setSseConnected(false);
            throw err;
          },
        });
      } catch (err) {
        setSseConnected(false);
        console.error(`SSE ${logLabel} dừng`, err);
      }
    };

    void connect();

    return () => {
      controller.current?.abort();
      setSseConnected(false);
      isConnecting.current = false;
    };
  }, [
    token,
    updateProgress,
    setSseConnected,
    t,
    streamPath,
    processId,
    logLabel,
    text,
  ]);

  /** Tải file của job; mặc định là job đang theo dõi trong store */
  const downloadReadyFile = async (
    jobIdToDownload?: string,
    customFileName?: string,
  ) => {
    const targetJobId = jobIdToDownload || store.jobId;
    if (!targetJobId) {
      throw new Error(t(text.noJob.key, text.noJob.fallback));
    }

    const blob = await config.downloadFile(targetJobId);
    saveBlob(blob, customFileName || store.fileName || config.defaultFileName);
  };

  return { downloadReadyFile };
}
