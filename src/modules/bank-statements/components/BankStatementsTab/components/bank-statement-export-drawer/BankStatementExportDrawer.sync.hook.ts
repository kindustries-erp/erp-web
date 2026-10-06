import { useEffect, useRef } from "react";
import { useBankStatementExportProgressStore } from "@/shared/stores/useBankStatementExportProgressStore";
import type { BankStatementExportHistoryResult } from "@/modules/bank-statements/api/bankStatementApi";

export interface UseBankStatementExportSyncProps {
  open: boolean;
  trackedJobId: string | null;
  historyData?: BankStatementExportHistoryResult;
  refetchHistory: () => Promise<any>;
  onDownload: (jobId: string, fileName?: string) => Promise<void>;
}

export function useBankStatementExportSync({
  open,
  trackedJobId,
  historyData,
  refetchHistory,
  onDownload,
}: UseBankStatementExportSyncProps) {
  const terminalRefreshGuardRef = useRef<string | null>(null);
  const downloadedJobIdsRef = useRef<Set<string>>(new Set());

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
    }

    // 2. Check historyData items for trackedJobId (fallback if SSE missed event)
    if (trackedJobId && !downloadedJobIdsRef.current.has(trackedJobId)) {
      const historyItem = historyData?.items?.find(
        (it) => it.jobId === trackedJobId && it.status === "COMPLETED",
      );
      if (historyItem) {
        downloadedJobIdsRef.current.add(trackedJobId);
        void onDownload(trackedJobId, historyItem.fileName);
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
    refetchHistory,
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
