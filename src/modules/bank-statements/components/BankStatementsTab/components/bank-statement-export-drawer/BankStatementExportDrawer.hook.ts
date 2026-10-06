import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useT } from "@/core/i18n";
import {
  bankStatementApi,
  type BankStatementExportHistoryItem,
} from "@/modules/bank-statements/api/bankStatementApi";
import { useBankStatementExportProgress } from "@/modules/bank-statements/hooks/useBankStatementExportProgress";
import { useBankStatementExportSync } from "./BankStatementExportDrawer.sync.hook";
import { useBankStatementExportForm } from "./BankStatementExportDrawer.form.hook";
import type { BankStatementExportMode } from "./BankStatementExportDrawer.type";

export interface UseBankStatementExportDrawerProps {
  open: boolean;
  type: "bank" | "cash";
  accountsData: any[];
  buildBaseQuery?: () => any;
}

export function useBankStatementExportDrawer({
  open,
  type,
  accountsData,
  buildBaseQuery,
}: UseBankStatementExportDrawerProps) {
  const t = useT();

  const [exportMode, setExportMode] =
    useState<BankStatementExportMode>("by-period");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [starting, setStarting] = useState(false);
  const [downloadingJobId, setDownloadingJobId] = useState<string | null>(null);
  const [trackedJobId, setTrackedJobId] = useState<string | null>(null);

  const formHook = useBankStatementExportForm({ type, accountsData });
  const { downloadReadyFile } = useBankStatementExportProgress();

  const historyQuery = useQuery({
    queryKey: ["bank-statement-export-history", page, pageSize],
    queryFn: () => bankStatementApi.listExportExcelHistory(page, pageSize),
    enabled: open,
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });

  const handleDownload = useCallback(
    async (
      jobIdOrRow: string | BankStatementExportHistoryItem,
      customFileName?: string,
    ) => {
      const jobId =
        typeof jobIdOrRow === "string" ? jobIdOrRow : jobIdOrRow.jobId;
      const fileName =
        typeof jobIdOrRow === "string" ? customFileName : jobIdOrRow.fileName;

      if (downloadingJobId) return;

      try {
        setDownloadingJobId(jobId);
        await downloadReadyFile(jobId, fileName);
        toast.success(
          t("bankStatement.toastDownloading", "Đang tải file XLSX."),
        );
        void historyQuery.refetch();
      } catch (error: any) {
        toast.error(
          error?.message ||
            t("bankStatement.downloadFailed", "Không thể tải file XLSX."),
        );
      } finally {
        setDownloadingJobId(null);
      }
    },
    [downloadingJobId, downloadReadyFile, historyQuery, t],
  );

  const { progress } = useBankStatementExportSync({
    open,
    trackedJobId,
    historyData: historyQuery.data,
    refetchHistory: historyQuery.refetch,
    onDownload: handleDownload,
  });

  const handleStartExport = async () => {
    try {
      setStarting(true);
      let payload: any = {};

      if (exportMode === "by-current-filter") {
        const baseQuery = buildBaseQuery ? buildBaseQuery() : {};
        const restQuery = { ...baseQuery };
        delete restQuery.page;
        delete restQuery.pageSize;
        payload = {
          sourceType: type === "bank" ? "BANK" : "CASH",
          ...restQuery,
        };
      } else {
        if (!formHook.dateFrom || !formHook.dateTo) {
          toast.error(
            t(
              "bankStatement.missingDateRange",
              "Vui lòng chọn đầy đủ ngày bắt đầu và ngày kết thúc.",
            ),
          );
          return;
        }
        payload = {
          sourceType: type === "bank" ? "BANK" : "CASH",
          startDate: `${formHook.dateFrom} 00:00:00`,
          endDate: `${formHook.dateTo} 23:59:59`,
        };
        if (formHook.selectedAccountId) {
          if (type === "bank")
            payload.bankAccountId = formHook.selectedAccountId;
          else payload.cashBookId = formHook.selectedAccountId;
        }
        if (formHook.transactionType)
          payload.transactionType = formHook.transactionType;
      }

      const result = await bankStatementApi.startExportExcelBackground(payload);
      setTrackedJobId(result.jobId);
      if (result.reused) {
        toast.success(
          result.message ||
            t(
              "bankStatement.toastReused",
              "Đã tìm thấy file cũ. Đang tự động tải xuống.",
            ),
        );
        void handleDownload(result.jobId);
      } else {
        toast.success(
          result.message ||
            t(
              "bankStatement.toastStarted",
              "Đã bắt đầu tiến trình xuất Excel.",
            ),
        );
      }
      await historyQuery.refetch();
    } catch (error: any) {
      toast.error(
        error?.message ||
          t("bankStatement.startFailed", "Không thể bắt đầu xuất Excel."),
      );
    } finally {
      setStarting(false);
    }
  };

  return {
    exportMode,
    setExportMode,
    ...formHook,
    page,
    setPage,
    pageSize,
    setPageSize,
    starting,
    downloadingJobId,
    progress,
    historyQuery,
    handleDownload,
    handleStartExport,
  };
}
