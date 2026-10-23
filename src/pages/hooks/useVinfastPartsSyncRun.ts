import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { fetchEventSource } from "@microsoft/fetch-event-source";
import { useAuthStore } from "@/modules/auth/domain/authStore";
import api, { API_BASE_URL } from "@/core/api/axiosInstance";
import { useVinfastPartsSyncProgressStore } from "@/shared/stores/useVinfastPartsSyncProgressStore";
import {
  deriveSyncPanelStatus,
  reconcileSyncStatus,
} from "./vinfastSyncStatus";
import { useVinfastPartsSyncStatus } from "./useVinfastPartsSyncStatus";
import { formatSyncLogMessage } from "@/v2/shared/components/molecules/v2-sync-progress";
import type {
  SyncProgressEvent,
  StartVinfastSyncParams,
} from "./useVinfastPartsSyncRun.type";

export type { StartVinfastSyncParams } from "./useVinfastPartsSyncRun.type";

/** Điều khiển một lượt đồng bộ phụ tùng: khởi chạy, theo dõi SSE, đối chiếu trạng thái API. */
export function useVinfastPartsSyncRun(open: boolean) {
  const { t } = useTranslation("vinfastParts");
  const {
    isSyncing,
    progress,
    logs,
    sseConnected,
    currentItem,
    setSyncing,
    setProgress,
    setCurrentItem,
    addLog,
    clearLogs,
    setSseConnected,
  } = useVinfastPartsSyncProgressStore();

  const token = useAuthStore((s) => s.accessToken);
  const controllerRef = useRef<AbortController | null>(null);

  // Trạng thái lấy định kỳ từ API: không phụ thuộc SSE (luồng sự kiện có thể bị proxy giữ lại)
  const statusQuery = useVinfastPartsSyncStatus(open);
  const lastEntry = logs[logs.length - 1];
  const lastLog = lastEntry?.message;
  useEffect(() => {
    const status = statusQuery.data;
    if (!status) return;
    const update = reconcileSyncStatus(status, isSyncing, lastLog);
    if (update.isSyncing !== isSyncing) setSyncing(update.isSyncing);
    if (update.progress !== undefined) setProgress(update.progress);
    if (update.currentItem !== undefined) setCurrentItem(update.currentItem);
    if (update.logMessage) {
      const level = update.isSyncing
        ? undefined
        : status.lastError
          ? "error"
          : "success";
      addLog(update.logMessage, level);
    }
    // Chỉ phản ứng khi có dữ liệu trạng thái mới từ API
  }, [statusQuery.data]);

  useEffect(() => {
    if (isSyncing && open && !sseConnected && token) {
      controllerRef.current = new AbortController();
      const sseUrl = `${API_BASE_URL}/api/v1/vinfast-parts/sync/progress`;

      const connect = async () => {
        try {
          await fetchEventSource(sseUrl, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            signal: controllerRef.current?.signal,
            onopen(res) {
              if (res.ok && res.status === 200) {
                setSseConnected(true);
                return Promise.resolve();
              }
              setSseConnected(false);
              return Promise.reject(
                new Error(`Failed to open SSE: ${res.status}`),
              );
            },
            onmessage(event) {
              if (!event.data) return;
              try {
                const data = JSON.parse(event.data) as SyncProgressEvent;
                if (
                  data.message &&
                  data.message !== "Connected" &&
                  data.message !== "Ping"
                ) {
                  addLog(formatSyncLogMessage(data.message, data.currentItem));
                }
                if (data.total > 0) {
                  setProgress(Math.round((data.current / data.total) * 100));
                }
                if (data.currentItem !== undefined || data.completed) {
                  setCurrentItem(data.completed ? undefined : data.currentItem);
                }
                if (data.completed) {
                  setSyncing(false);
                  setSseConnected(false);
                  if (controllerRef.current) {
                    controllerRef.current.abort();
                  }
                  setProgress(100);
                }
              } catch (err) {
                console.error("SSE parse error", err);
              }
            },
            onerror(err) {
              console.error("SSE error", err);
              setSseConnected(false);
              throw err;
            },
          });
        } catch (err) {
          console.error("fetchEventSource error", err);
          setSseConnected(false);
        }
      };

      void connect();
    }

    return () => {
      if (controllerRef.current) {
        controllerRef.current.abort();
      }
      setSseConnected(false);
    };
  }, [open, isSyncing, token]); // removed sseConnected to prevent infinite loop

  const startSync = async ({
    syncRange,
    dateFrom,
    dateTo,
    clearDb,
  }: StartVinfastSyncParams) => {
    if (isSyncing) return;

    setSyncing(true);
    clearLogs();
    addLog(t("SYNC_PROGRESS_STARTING"));

    const fromStr = syncRange === "custom" ? dateFrom : undefined;
    const toStr = syncRange === "custom" ? dateTo : undefined;

    try {
      // Trigger Sync API
      await api.post("/api/v1/vinfast-parts/sync-ledger", {
        dateFrom: fromStr,
        dateTo: toStr,
        clearDb: clearDb,
      });
    } catch (err: any) {
      if (err?.response?.status === 409) {
        // Đã có lượt đồng bộ đang chạy: theo dõi tiến trình của lượt đó
        setSyncing(true);
        addLog(t("SYNC_PROGRESS_JOINED"));
        return;
      }
      setSyncing(false);
      addLog(`Lỗi: ${err.message || "Không thể khởi tạo đồng bộ"}`, "error");
    }
  };

  const status = deriveSyncPanelStatus(isSyncing, progress, lastEntry?.level);

  return { isSyncing, progress, currentItem, logs, status, startSync };
}
