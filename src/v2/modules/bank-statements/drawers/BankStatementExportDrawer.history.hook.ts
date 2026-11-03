import { useEffect, useMemo, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { bankStatementExportApi } from "../api/bankStatementExportApi";
import { useBankStatementExportProgressStore } from "../stores/useBankStatementExportProgressStore";
import { toHistoryViewItem } from "./BankStatementExportDrawer.helper";

interface UseBankStatementExportHistoryOptions {
  open: boolean;
  page: number;
  pageSize: number;
}

/**
 * Lịch sử file xuất. Khi có job đang chạy và SSE không còn hoạt động thì poll 10s;
 * khi job kết thúc thì refetch đúng một lần cho mỗi job.
 */
export function useBankStatementExportHistory({
  open,
  page,
  pageSize,
}: UseBankStatementExportHistoryOptions) {
  const { t } = useV2Translation();
  const progress = useBankStatementExportProgressStore();
  const terminalRefreshGuardRef = useRef<string | null>(null);

  const historyQuery = useQuery({
    queryKey: ["bank-statement-export-history", page, pageSize],
    queryFn: () => bankStatementExportApi.listBackgroundHistory(page, pageSize),
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

  const historyItems = useMemo(
    () =>
      (historyQuery.data?.items ?? []).map((row) =>
        toHistoryViewItem(
          row,
          {
            jobId: progress.jobId,
            current: progress.current,
            total: progress.total,
          },
          {
            allRange: t("v2.exportExcel.history.allRange", "Tất cả"),
            statusReady: t(
              "v2.exportExcel.history.statusReady",
              "Sẵn sàng tải",
            ),
            statusFailed: t("v2.exportExcel.history.statusFailed", "Thất bại"),
            statusRunning: (percent) =>
              t("v2.exportExcel.history.statusRunning", {
                defaultValue: "Đang tạo {{percent}}%",
                percent,
              }),
          },
        ),
      ),
    [historyQuery.data, progress.current, progress.jobId, progress.total, t],
  );

  return { historyQuery, historyItems };
}
