import { useEffect, useRef } from "react";
import type { VinfastPartsStockExportHistoryItem } from "../api/dtos/vinfastStockExport.dto";
import { useVinfastStockExportProgressStore } from "../stores/useVinfastStockExportProgressStore";

export interface UseVinfastPartsStockExportAutoDownloadOptions {
  open: boolean;
  trackedJobId: string | null;
  historyItems?: VinfastPartsStockExportHistoryItem[];
  /** Tải file của job */
  download: (jobId: string, fileName?: string) => Promise<void> | void;
  /** Bỏ theo dõi job khi đã tải hoặc thất bại */
  onTrackedDone: () => void;
}

/**
 * Tự động tải file khi job đang theo dõi hoàn tất:
 * SSE báo sẵn sàng trước (ready/completed), lịch sử là phương án dự phòng.
 * Mỗi job chỉ tự động tải đúng một lần.
 */
export function useVinfastPartsStockExportAutoDownload({
  open,
  trackedJobId,
  historyItems,
  download,
  onTrackedDone,
}: UseVinfastPartsStockExportAutoDownloadOptions) {
  const progress = useVinfastStockExportProgressStore();
  const downloadedJobIdsRef = useRef<Set<string>>(new Set());

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
