import { useState } from "react";
import type { V2ExportMode } from "@/v2/shared/components/molecules/v2-export-condition-section";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { useV2ToastStore } from "@/v2/shared/stores/useV2ToastStore";
import { isDateRangeInvalid } from "@/v2/shared/utils/exportPeriod";
import { bankStatementExportApi } from "../api/bankStatementExportApi";
import type {
  BankStatementExportAccount,
  BankStatementFilterSummaryInput,
} from "../api/dtos/bankStatementExport.dto";
import { useBankStatementExportProgress } from "../hooks/useBankStatementExportProgress";
import { useBankStatementExportForm } from "./BankStatementExportDrawer.form.hook";
import { useBankStatementExportHistory } from "./BankStatementExportDrawer.history.hook";
import { useBankStatementExportAutoDownload } from "./BankStatementExportDrawer.autoDownload.hook";
import { buildExportPayload } from "./BankStatementExportDrawer.helper";

export interface UseBankStatementExportDrawerOptions {
  open: boolean;
  type: "bank" | "cash";
  accounts: BankStatementExportAccount[];
  buildBaseQuery: () => Record<string, unknown>;
  currentFilterSummary?: BankStatementFilterSummaryInput;
}

const notify = (variant: "success" | "destructive", title: string) =>
  useV2ToastStore.getState().showToast({ title, variant });

export function useBankStatementExportDrawer({
  open,
  type,
  accounts,
  buildBaseQuery,
  currentFilterSummary,
}: UseBankStatementExportDrawerOptions) {
  const { t } = useV2Translation();
  const form = useBankStatementExportForm(type, accounts, currentFilterSummary);
  const { downloadReadyFile } = useBankStatementExportProgress();

  const [exportMode, setExportMode] = useState<V2ExportMode>("by-period");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [starting, setStarting] = useState(false);
  const [downloadingJobId, setDownloadingJobId] = useState<string | null>(null);
  const [trackedJobId, setTrackedJobId] = useState<string | null>(null);

  const { historyQuery, historyItems } = useBankStatementExportHistory({
    open,
    page,
    pageSize,
  });

  const handleDownload = async (jobId: string, fileName?: string) => {
    if (downloadingJobId) return;
    try {
      setDownloadingJobId(jobId);
      await downloadReadyFile(jobId, fileName);
      notify(
        "success",
        t("v2.bankStatements.export.toastDownloading", "Đang tải file XLSX."),
      );
      await historyQuery.refetch();
    } catch (error: unknown) {
      notify(
        "destructive",
        (error instanceof Error && error.message) ||
          t(
            "v2.exportExcel.form.downloadFailed",
            "Không thể tải lại file XLSX.",
          ),
      );
    } finally {
      setDownloadingJobId(null);
    }
  };

  useBankStatementExportAutoDownload({
    open,
    trackedJobId,
    historyItems: historyQuery.data?.items,
    download: handleDownload,
    onTrackedDone: () => setTrackedJobId(null),
  });

  const handleDownloadRow = (jobId: string) => {
    const row = historyQuery.data?.items.find((item) => item.jobId === jobId);
    if (!row?.canDownload) return;
    void handleDownload(jobId, row.fileName);
  };

  const handleStartExport = async () => {
    if (exportMode === "by-period") {
      if (!form.dateFrom || !form.dateTo) {
        notify(
          "destructive",
          t(
            "v2.exportExcel.form.missingDateRange",
            "Vui lòng chọn đầy đủ ngày bắt đầu và ngày kết thúc.",
          ),
        );
        return;
      }
      if (isDateRangeInvalid(form.dateFrom, form.dateTo)) {
        notify(
          "destructive",
          t(
            "v2.exportExcel.form.invalidDateRange",
            "Từ ngày phải nhỏ hơn hoặc bằng Đến ngày.",
          ),
        );
        return;
      }
    }

    try {
      setStarting(true);
      const result = await bankStatementExportApi.startBackgroundExport(
        buildExportPayload({
          type,
          exportMode,
          baseQuery: buildBaseQuery(),
          dateFrom: form.dateFrom,
          dateTo: form.dateTo,
          accountId: form.accountId,
          transactionType: form.transactionType,
          selectedColumns: form.selectedColumns,
        }),
      );
      if (result.reused) {
        notify(
          "success",
          result.message ||
            t(
              "v2.bankStatements.export.toastReused",
              "Đã tìm thấy file cũ. Đang tự động tải xuống.",
            ),
        );
        void handleDownload(result.jobId);
      } else {
        setTrackedJobId(result.jobId);
        notify(
          "success",
          result.message ||
            t(
              "v2.exportExcel.form.started",
              "Đã bắt đầu tiến trình xuất Excel.",
            ),
        );
      }
      await historyQuery.refetch();
    } catch (error: unknown) {
      notify(
        "destructive",
        (error instanceof Error && error.message) ||
          t("v2.exportExcel.form.startFailed", "Không thể bắt đầu xuất Excel."),
      );
    } finally {
      setStarting(false);
    }
  };

  return {
    ...form,
    exportMode,
    setExportMode,
    page,
    pageSize,
    setPage,
    setPageSize,
    historyItems,
    historyTotal: historyQuery.data?.total ?? 0,
    historyLoading: historyQuery.isLoading || historyQuery.isFetching,
    refreshHistory: () => void historyQuery.refetch(),
    starting,
    downloadingJobId,
    handleStartExport,
    handleDownloadRow,
  };
}
