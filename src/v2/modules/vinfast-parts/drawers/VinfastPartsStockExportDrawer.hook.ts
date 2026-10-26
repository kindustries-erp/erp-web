import { useMemo, useState } from "react";
import type { V2ColumnSelectorGroup } from "@/v2/shared/components/molecules/v2-column-selector";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { useV2ToastStore } from "@/v2/shared/stores/useV2ToastStore";
import { isDateRangeInvalid } from "@/v2/shared/utils/exportPeriod";
import { vinfastStockExportApi } from "../api/vinfastStockExportApi";
import type { VinfastPartsStockExportQuery } from "../api/dtos/vinfastStockExport.dto";
import { useVinfastStockExportProgress } from "../hooks/useVinfastStockExportProgress";
import {
  VINFAST_STOCK_EXPORT_COLUMN_GROUPS,
  VINFAST_STOCK_EXPORT_DEFAULT_COLUMNS,
} from "./VinfastPartsStockExportDrawer.columns.config";
import {
  buildExportPayload,
  buildFilterSummary,
} from "./VinfastPartsStockExportDrawer.helper";
import { useVinfastPartsStockExportAutoDownload } from "./VinfastPartsStockExportDrawer.autoDownload.hook";
import { useVinfastPartsStockExportHistory } from "./VinfastPartsStockExportDrawer.history.hook";
import { useVinfastPartsStockExportPeriod } from "./VinfastPartsStockExportDrawer.period.hook";

interface UseVinfastPartsStockExportDrawerOptions {
  open: boolean;
  buildBaseQuery: () => Partial<VinfastPartsStockExportQuery>;
}

export function useVinfastPartsStockExportDrawer({
  open,
  buildBaseQuery,
}: UseVinfastPartsStockExportDrawerOptions) {
  const { t } = useV2Translation();
  const period = useVinfastPartsStockExportPeriod();
  const { downloadReadyFile } = useVinfastStockExportProgress();

  const [selectedColumns, setSelectedColumns] = useState<string[]>(
    VINFAST_STOCK_EXPORT_DEFAULT_COLUMNS,
  );
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [starting, setStarting] = useState(false);
  const [downloadingJobId, setDownloadingJobId] = useState<string | null>(null);
  const [trackedJobId, setTrackedJobId] = useState<string | null>(null);

  const { historyQuery, historyItems } = useVinfastPartsStockExportHistory({
    open,
    page,
    pageSize,
  });

  const columnGroups = useMemo<V2ColumnSelectorGroup[]>(
    () =>
      VINFAST_STOCK_EXPORT_COLUMN_GROUPS.map((group) => ({
        key: group.key,
        label: t(group.labelKey, group.key),
        columns: group.columns.map((c) => ({
          key: c.key,
          label: t(c.labelKey, c.key),
        })),
      })),
    [t],
  );

  const filterSummary = buildFilterSummary(buildBaseQuery(), {
    vehicleTypeLabel: t("v2.vinfastParts.export.filter.vehicleType", "Loại xe"),
    vehicleTypeAll: t("v2.vinfastParts.export.filter.vehicleAll", "Tất cả"),
    vehicleTypeCar: t("v2.vinfastParts.export.filter.vehicleCar", "Ô tô"),
    vehicleTypeMotorbike: t(
      "v2.vinfastParts.export.filter.vehicleMotorbike",
      "Xe máy",
    ),
    keywordLabel: t("v2.vinfastParts.export.filter.keyword", "Từ khóa"),
    noKeyword: t("v2.vinfastParts.export.filter.noKeyword", "Không có"),
  });

  const notify = (variant: "success" | "destructive", title: string) =>
    useV2ToastStore.getState().showToast({ title, variant });

  const handleDownload = async (jobId: string, customFileName?: string) => {
    if (downloadingJobId) return;
    const row = historyQuery.data?.items.find((item) => item.jobId === jobId);
    if (row && !row.canDownload) return;

    try {
      setDownloadingJobId(jobId);
      await downloadReadyFile(jobId, customFileName || row?.fileName);
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

  useVinfastPartsStockExportAutoDownload({
    open,
    trackedJobId,
    historyItems: historyQuery.data?.items,
    download: handleDownload,
    onTrackedDone: () => setTrackedJobId(null),
  });

  const handleStartExport = async () => {
    if (period.exportMode === "by-period") {
      if (!period.dateFrom || !period.dateTo) {
        notify(
          "destructive",
          t(
            "v2.exportExcel.form.missingDateRange",
            "Vui lòng chọn đầy đủ ngày bắt đầu và kết thúc.",
          ),
        );
        return;
      }
      if (isDateRangeInvalid(period.dateFrom, period.dateTo)) {
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
      const result = await vinfastStockExportApi.startBackgroundExport(
        buildExportPayload({
          exportMode: period.exportMode,
          baseQuery: buildBaseQuery(),
          dateFrom: period.dateFrom,
          dateTo: period.dateTo,
          selectedColumns,
        }),
      );

      if (result.reused) {
        notify(
          "success",
          result.message ||
            t(
              "v2.vinfastParts.export.progress.reused",
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
    ...period,
    filterSummary,
    columnGroups,
    selectedColumns,
    setSelectedColumns,
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
    handleDownload,
  };
}
