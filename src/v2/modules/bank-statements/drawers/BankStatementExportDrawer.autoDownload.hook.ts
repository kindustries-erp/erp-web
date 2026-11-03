import { useEffect, useRef } from "react";
import type { BankStatementExportHistoryItem } from "../api/dtos/bankStatementExport.dto";
import { useBankStatementExportProgressStore } from "../stores/useBankStatementExportProgressStore";

export interface UseBankStatementExportAutoDownloadOptions {
  open: boolean;
  trackedJobId: string | null;
  historyItems?: BankStatementExportHistoryItem[];
  /** Tải file của job; không đợi kết quả */
  download: (jobId: string, fileName?: string) => Promise<void> | void;
  /** Bỏ theo dõi job khi đã tải hoặc thất bại */
  onTrackedDone: () => void;
}

/**
 * Tự tải file khi job đang theo dõi xong: SSE báo sẵn sàng trước,
 * lịch sử là dự phòng khi SSE bỏ lỡ sự kiện. Mỗi job chỉ tải một lần.
 */
export function useBankStatementExportAutoDownload({
  open,
  trackedJobId,
  historyItems,
  download,
  onTrackedDone,
}: UseBankStatementExportAutoDownloadOptions) {
  const progress = useBankStatementExportProgressStore();
  const downloadedJobIdsRef = useRef<Set<string>>(new Set());

  // Ref để effect không phụ thuộc vào hàm đổi mỗi lần render
  const downloadRef = useRef(download);
  downloadRef.current = download;
  const doneRef = useRef(onTrackedDone);
  doneRef.current = onTrackedDone;

  useEffect(() => {
    if (!open || !trackedJobId) return;
    if (downloadedJobIdsRef.current.has(trackedJobId)) return;

    const sseReady =
      progress.jobId === trackedJobId && (progress.ready || progress.completed);
    const historyRow = historyItems?.find(
      (item) => item.jobId === trackedJobId,
    );

    if (sseReady || historyRow?.status === "COMPLETED") {
      downloadedJobIdsRef.current.add(trackedJobId);
      doneRef.current();
      void downloadRef.current(
        trackedJobId,
        progress.fileName ?? historyRow?.fileName,
      );
      return;
    }
    if (historyRow?.status === "FAILED" || progress.failed) {
      doneRef.current();
    }
  }, [
    open,
    trackedJobId,
    historyItems,
    progress.jobId,
    progress.ready,
    progress.completed,
    progress.failed,
    progress.fileName,
  ]);
}
