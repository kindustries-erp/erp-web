import { useEffect, useRef } from "react";
import { useBankStatementExportProgressStore } from "@/shared/stores/useBankStatementExportProgressStore";
import type { BankStatementExportHistoryResult } from "@/modules/bank-statements/api/bankStatementApi";

export interface UseBankStatementExportSyncProps {
  open: boolean;
  trackedJobId: string | null;
  historyData?: BankStatementExportHistoryResult;
  refetchHistory: () => Promise<any>;
  onDownload: (jobId: string, fileName?: string) => Promise<void>;
  downloadedJobIdsRef?: React.MutableRefObject<Set<string>>;
  onJobFinished?: (jobId: string) => void;
}

export function useBankStatementExportSync({
  open,
  trackedJobId,
  historyData,
  refetchHistory,
  onDownload,
  downloadedJobIdsRef: externalDownloadedJobIdsRef,
  onJobFinished,
}: UseBankStatementExportSyncProps) {
  const terminalRefreshGuardRef = useRef<string | null>(null);
  const internalDownloadedJobIdsRef = useRef<Set<string>>(new Set());
  const downloadedJobIdsRef =
    externalDownloadedJobIdsRef || internalDownloadedJobIdsRef;

  const progress = useBankStatementExportProgressStore();

  useEffect(() => {
    if (!open) return;

    // 1. Check SSE progress for completed / ready state
    const activeJobId = progress.jobId;
    if (
      activeJobId &&
      (progress.ready || progress.completed) &&
      !downloadedJobIdsRef.current.has(activeJobId)
    ) {
      downloadedJobIdsRef.current.add(activeJobId);
      void onDownload(activeJobId, progress.fileName);
      onJobFinished?.(activeJobId);
    }

    // 2. Check historyData items for trackedJobId (fallback if SSE missed event)
    if (trackedJobId && !downloadedJobIdsRef.current.has(trackedJobId)) {
      const historyItem = historyData?.items?.find(
        (it) => it.jobId === trackedJobId && it.status === "COMPLETED",
      );
      if (historyItem) {
        downloadedJobIdsRef.current.add(trackedJobId);
        // Sync to progress store so badges & percentage update immediately
        progress.setProgress({
          jobId: trackedJobId,
          fileName: historyItem.fileName,
          current: 100,
          total: 100,
          isRunning: false,
          completed: true,
          ready: true,
          failed: false,
          message: historyItem.message,
        });
        void onDownload(trackedJobId, historyItem.fileName);
        onJobFinished?.(trackedJobId);
      }

      // Handle FAILED state from history
      const failedItem = historyData?.items?.find(
        (it) => it.jobId === trackedJobId && it.status === "FAILED",
      );
      if (failedItem) {
        progress.setProgress({
          jobId: trackedJobId,
          isRunning: false,
          completed: false,
          ready: false,
          failed: true,
          message: failedItem.message,
        });
        onJobFinished?.(trackedJobId);
      }
    }

    // 3. Refresh history table when terminal state reached
    if (
      activeJobId &&
      (progress.ready || progress.failed || progress.completed)
    ) {
      if (terminalRefreshGuardRef.current !== activeJobId) {
        terminalRefreshGuardRef.current = activeJobId;
        void refetchHistory();
      }
    }
  }, [
    open,
    progress.jobId,
    progress.ready,
    progress.completed,
    progress.failed,
    progress.fileName,
    trackedJobId,
    historyData?.items,
    onDownload,
    onJobFinished,
    refetchHistory,
    downloadedJobIdsRef,
  ]);

  useEffect(() => {
    if (!progress.isRunning) {
      terminalRefreshGuardRef.current = null;
    }
  }, [progress.isRunning]);

  return {
    progress,
    downloadedJobIdsRef,
  };
}
