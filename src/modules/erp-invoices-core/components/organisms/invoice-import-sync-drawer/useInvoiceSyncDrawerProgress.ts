import { useEffect } from "react";
import { useInvoiceSyncProgressStore } from "@/modules/erp-invoices-core/hooks/useInvoiceSyncProgressStore";

/** Nối drawer đồng bộ với store tiến trình: hiện panel khi drawer mở và đọc trạng thái hiển thị */
export function useInvoiceSyncDrawerProgress(open: boolean) {
  const startSyncLog = useInvoiceSyncProgressStore((s) => s.start);
  const addSyncLog = useInvoiceSyncProgressStore((s) => s.addLog);
  const failSync = useInvoiceSyncProgressStore((s) => s.fail);
  const setPanelVisible = useInvoiceSyncProgressStore((s) => s.setPanelVisible);
  const progressStatus = useInvoiceSyncProgressStore((s) => s.status);
  const progressValue = useInvoiceSyncProgressStore((s) => s.progress);
  const progressLogs = useInvoiceSyncProgressStore((s) => s.logs);
  const progressItem = useInvoiceSyncProgressStore((s) => s.currentItem);

  useEffect(() => {
    setPanelVisible(open);
    return () => setPanelVisible(false);
  }, [open, setPanelVisible]);

  return {
    startSyncLog,
    addSyncLog,
    failSync,
    progress: {
      status: progressStatus,
      progress: progressValue,
      logs: progressLogs,
      currentItem: progressItem,
    },
  };
}
