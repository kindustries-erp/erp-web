import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { vinfastPartsStockExportApi } from "@/pages/api/vinfastPartsStockExportApi";
import { useVinfastPartsStockExportProgressStore } from "@/shared/stores/useVinfastPartsStockExportProgressStore";

interface UseVinfastPartsStockExportHistoryOptions {
  open: boolean;
  page: number;
  pageSize: number;
}

/**
 * Lịch sử file xuất. Khi có job đang chạy và SSE không còn hoạt động thì poll 10s;
 * khi job kết thúc thì refetch đúng một lần cho mỗi job.
 */
export function useVinfastPartsStockExportHistory({
  open,
  page,
  pageSize,
}: UseVinfastPartsStockExportHistoryOptions) {
  const progress = useVinfastPartsStockExportProgressStore();
  const terminalRefreshGuardRef = useRef<string | null>(null);

  const historyQuery = useQuery({
    queryKey: ["vinfast-parts-stock-export-history", page, pageSize],
    queryFn: () =>
      vinfastPartsStockExportApi.listBackgroundHistory(page, pageSize),
    enabled: open,
    staleTime: 30_000,
    refetchOnWindowFocus: false,
    refetchInterval: (query) => {
      if (!open) return false;

      const data = query.state.data as
        | { items?: Array<{ status: string }> }
        | undefined;
      const hasRunningFromHistory = Boolean(
        data?.items?.some((item) => item.status === "RUNNING"),
      );
      const hasRunning = hasRunningFromHistory || Boolean(progress.isRunning);
      if (!hasRunning) return false;

      const eventAgeMs = progress.lastEventAt
        ? Date.now() - progress.lastEventAt
        : Infinity;
      const sseHealthy = progress.sseConnected && eventAgeMs < 20_000;

      return sseHealthy ? false : 10_000;
    },
  });

  useEffect(() => {
    if (!open || !progress.jobId) return;

    const isTerminalState =
      progress.ready || progress.failed || progress.completed;
    if (!isTerminalState) return;

    if (terminalRefreshGuardRef.current === progress.jobId) return;
    terminalRefreshGuardRef.current = progress.jobId;
    void historyQuery.refetch();
  }, [
    historyQuery,
    open,
    progress.completed,
    progress.failed,
    progress.jobId,
    progress.ready,
  ]);

  useEffect(() => {
    if (!progress.isRunning) {
      terminalRefreshGuardRef.current = null;
    }
  }, [progress.isRunning]);

  return { historyQuery, progress };
}
