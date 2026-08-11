import React, { useState, useEffect } from "react";

import { format } from "date-fns";
import api, { API_BASE_URL } from "@/core/api/axiosInstance";
import { StandardFormDrawer } from "@/shared/components/StandardFormDrawer";
import { DrawerSection, DrawerField } from "@/shared/components/DrawerModal";
import { DatePicker } from "@/shared/components/DatePicker";
import { Button } from "@/shared/components/ui/Button";
import { RefreshCw, CheckCircle2 } from "lucide-react";
import { useVinfastPartsSyncProgressStore } from "@/shared/stores/useVinfastPartsSyncProgressStore";

interface SyncProgressEvent {
  message: string;
  processId: string;
  current: number;
  total: number;
  completed: boolean;
}

interface VinfastPartsSyncDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function VinfastPartsSyncDrawer({
  open,
  onClose,
}: VinfastPartsSyncDrawerProps) {
  // Default to current month
  const [dateFrom, setDateFrom] = useState<string | undefined>(
    format(
      new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      "yyyy-MM-dd",
    ),
  );
  const [dateTo, setDateTo] = useState<string | undefined>(
    format(new Date(), "yyyy-MM-dd"),
  );

  const {
    isSyncing,
    progress,
    logs,
    sseConnected,
    setSyncing,
    setProgress,
    addLog,
    clearLogs,
    setSseConnected,
  } = useVinfastPartsSyncProgressStore();

  useEffect(() => {
    // If it's syncing, we just need to make sure we are listening to SSE
    // If it's already syncing when drawer opens, the eventSource might be disconnected since it was local.
    // Wait, if it was local to the component, it was destroyed. We need to mount SSE listener independently, or just re-listen when opening if syncing.
    // Let's create a reconnect logic.
    let eventSource: EventSource | null = null;

    if (isSyncing && open && !sseConnected) {
      const sseUrl = `${API_BASE_URL}/api/v1/vinfast-parts/sync/progress`;
      eventSource = new EventSource(sseUrl);
      setSseConnected(true);

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data) as SyncProgressEvent;
          if (
            data.message &&
            data.message !== "Connected" &&
            data.message !== "Ping"
          ) {
            addLog(data.message);
          }
          if (data.total > 0) {
            setProgress(Math.round((data.current / data.total) * 100));
          }
          if (data.completed) {
            setSyncing(false);
            setSseConnected(false);
            eventSource?.close();
            setProgress(100);
          }
        } catch (err) {
          console.error("SSE parse error", err);
        }
      };

      eventSource.onerror = (err) => {
        console.error("SSE error", err);
        eventSource?.close();
        setSseConnected(false);
      };
    }

    return () => {
      if (eventSource) {
        eventSource.close();
        setSseConnected(false);
      }
    };
  }, [open, isSyncing, sseConnected]);

  const startSync = async () => {
    if (isSyncing) return;

    setSyncing(true);
    clearLogs();
    addLog("Đang khởi tạo tiến trình đồng bộ...");

    const fromStr = dateFrom;
    const toStr = dateTo;

    try {
      // Trigger Sync API
      await api.post("/api/v1/vinfast-parts/sync-ledger", {
        dateFrom: fromStr,
        dateTo: toStr,
      });
    } catch (err: any) {
      setSyncing(false);
      addLog(`Lỗi: ${err.message || "Không thể khởi tạo đồng bộ"}`);
    }
  };

  return (
    <StandardFormDrawer
      open={open}
      onClose={onClose}
      title="Đồng bộ Sổ cái & Danh mục VinFast"
      subtitle="Quét hóa đơn nội bộ trong ERP để cập nhật tồn kho và giá vốn FIFO"
      layout="1-column"
      size="sm"
      mode="create"
      leftPanel={
        <div className="space-y-6">
          <DrawerSection title="Cấu hình đồng bộ">
            <div className="space-y-4 pt-2">
              <DrawerField
                label="Từ ngày (Mặc định lấy tháng hiện tại)"
                required
              >
                <DatePicker
                  value={dateFrom || ""}
                  onChange={(v) => setDateFrom(v)}
                />
              </DrawerField>
              <DrawerField label="Đến ngày" required>
                <DatePicker
                  value={dateTo || ""}
                  onChange={(v) => setDateTo(v)}
                />
              </DrawerField>

              <div className="pt-4 flex justify-end">
                <Button
                  onClick={startSync}
                  disabled={isSyncing}
                  className="w-full sm:w-auto"
                >
                  {isSyncing ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Bắt đầu đồng bộ
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DrawerSection>

          <DrawerSection title="Tiến trình">
            <div className="space-y-4 pt-2">
              <div className="w-full bg-slate-100 rounded-full h-2.5 dark:bg-slate-800">
                <div
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <div className="text-sm font-medium text-slate-500">
                {progress}% Hoàn tất
              </div>

              <div className="bg-slate-900 text-slate-50 font-mono text-xs p-4 rounded-md h-64 overflow-y-auto space-y-1">
                {logs.length === 0 ? (
                  <span className="text-slate-500">
                    Chưa có tiến trình nào...
                  </span>
                ) : (
                  logs.map((log, idx) => (
                    <div key={idx} className="flex gap-2">
                      <span className="text-slate-400">
                        [{format(new Date(), "HH:mm:ss")}]
                      </span>
                      <span>{log}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </DrawerSection>
        </div>
      }
    />
  );
}
