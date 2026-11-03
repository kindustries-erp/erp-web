import { useEffect, useMemo, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { invoiceDebtsExportApi } from "../api/invoiceDebtsExportApi";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { toHistoryViewItem } from "./InvoiceDebtsExportDrawer.helper";
import type { V2ExportHistoryItem } from "@/v2/shared/components/molecules/v2-export-history-list";

interface UseInvoiceDebtsExportHistoryOptions {
  open: boolean;
  page: number;
  pageSize: number;
  trackedJobId?: string | null;
  onAutoDownload?: (jobId: string, fileName?: string) => void;
}

/**
 * Hook nạp lịch sử các file xuất Excel công nợ nền.
 * Tự động polling mỗi 5 giây khi có job đang chạy, tự động tải file khi job vừa hoàn thành.
 */
export function useInvoiceDebtsExportHistory({
  open,
  page,
  pageSize,
  trackedJobId,
  onAutoDownload,
}: UseInvoiceDebtsExportHistoryOptions) {
  const { t } = useV2Translation();
  const autoDownloadedRef = useRef<Set<string>>(new Set());

  const historyQuery = useQuery({
    queryKey: ["invoice-debts-export-history", page, pageSize],
    queryFn: () => invoiceDebtsExportApi.listBackgroundHistory(page, pageSize),
    enabled: open,
    staleTime: 30_000,
    refetchOnWindowFocus: false,
    refetchInterval: (query) => {
      if (!open) return false;
      const data = query.state.data as
        | { items?: Array<{ status: string }> }
        | undefined;
      const hasRunning = Boolean(
        data?.items?.some((item) => item.status === "RUNNING"),
      );
      return hasRunning ? 5000 : false;
    },
  });

  // Tự động tải file khi job đang theo dõi hoàn thành
  useEffect(() => {
    if (!open || !trackedJobId) return;

    if (!autoDownloadedRef.current.has(trackedJobId)) {
      const targetItem = historyQuery.data?.items?.find(
        (it) => it.jobId === trackedJobId && it.status === "COMPLETED",
      );
      if (targetItem && targetItem.canDownload) {
        autoDownloadedRef.current.add(trackedJobId);
        onAutoDownload?.(trackedJobId, targetItem.fileName);
      }
    }
  }, [open, trackedJobId, historyQuery.data?.items, onAutoDownload]);

  const historyItems = useMemo<V2ExportHistoryItem[]>(() => {
    const rawItems = historyQuery.data?.items ?? [];
    const labels = {
      allRange: t("v2.exportExcel.history.allRange", "Tất cả"),
      statusReady: t("v2.exportExcel.history.statusReady", "Sẵn sàng tải"),
      statusFailed: t("v2.exportExcel.history.statusFailed", "Thất bại"),
      statusRunning: (percent: number) =>
        t("v2.exportExcel.history.statusRunning", {
          defaultValue: "Đang tạo {{percent}}%",
          percent,
        }),
    };

    return rawItems.map((row) => toHistoryViewItem(row, labels));
  }, [historyQuery.data?.items, t]);

  const historyTotal = historyQuery.data?.total ?? 0;
  const historyLoading = historyQuery.isLoading || historyQuery.isFetching;

  const refreshHistory = () => {
    void historyQuery.refetch();
  };

  return {
    historyQuery,
    historyItems,
    historyTotal,
    historyLoading,
    refreshHistory,
  };
}
