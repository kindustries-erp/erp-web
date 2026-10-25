import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  vinfastPartsStockExportApi,
  type VinfastPartsStockExportQuery,
} from "@/pages/api/vinfastPartsStockExportApi";
import { useVinfastPartsStockExportProgress } from "@/pages/hooks/useVinfastPartsStockExportProgress";
import type { V2ColumnSelectorGroup } from "@/v2/shared/components/molecules/v2-column-selector";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import {
  VINFAST_STOCK_EXPORT_COLUMN_GROUPS,
  VINFAST_STOCK_EXPORT_DEFAULT_COLUMNS,
} from "./VinfastPartsStockExportDrawer.columns.config";
import {
  buildExportPayload,
  buildFilterSummary,
} from "./VinfastPartsStockExportDrawer.helper";
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
  const { downloadReadyFile } = useVinfastPartsStockExportProgress();

  const [selectedColumns, setSelectedColumns] = useState<string[]>(
    VINFAST_STOCK_EXPORT_DEFAULT_COLUMNS,
  );
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [starting, setStarting] = useState(false);
  const [downloadingJobId, setDownloadingJobId] = useState<string | null>(null);

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
        columns: group.columns.map((column) => ({
          key: column.key,
          label: t(column.labelKey, column.key),
        })),
      })),
    [t],
  );

  // buildBaseQuery đọc state bảng hiện tại, nên tính lại mỗi lần render
  const filterSummary = buildFilterSummary(buildBaseQuery(), {
    vehicleTypeLabel: t(
      "v2.exportExcel.vinfastParts.filter.vehicleType",
      "Loại xe",
    ),
    vehicleTypeAll: t(
      "v2.exportExcel.vinfastParts.filter.vehicleAll",
      "Tất cả",
    ),
    vehicleTypeCar: t("v2.exportExcel.vinfastParts.filter.vehicleCar", "Ô tô"),
    vehicleTypeMotorbike: t(
      "v2.exportExcel.vinfastParts.filter.vehicleMotorbike",
      "Xe máy",
    ),
    keywordLabel: t("v2.exportExcel.vinfastParts.filter.keyword", "Từ khóa"),
    noKeyword: t("v2.exportExcel.vinfastParts.filter.noKeyword", "Không có"),
  });

  const handleStartExport = async () => {
    if (
      period.exportMode === "by-period" &&
      (!period.dateFrom || !period.dateTo)
    ) {
      toast.error(
        t(
          "v2.exportExcel.form.missingDateRange",
          "Vui lòng chọn đầy đủ ngày bắt đầu và ngày kết thúc.",
        ),
      );
      return;
    }

    try {
      setStarting(true);
      const result = await vinfastPartsStockExportApi.startBackgroundExport(
        buildExportPayload({
          exportMode: period.exportMode,
          baseQuery: buildBaseQuery(),
          dateFrom: period.dateFrom,
          dateTo: period.dateTo,
          selectedColumns,
        }),
      );
      const fallback = result.reused
        ? t(
            "v2.exportExcel.form.reused",
            "Đã tìm thấy file cũ. Bạn có thể tải lại ngay.",
          )
        : t("v2.exportExcel.form.started", "Đã bắt đầu tiến trình xuất Excel.");
      toast.success(result.message || fallback);
      await historyQuery.refetch();
    } catch (error: any) {
      toast.error(
        error?.message ||
          t("v2.exportExcel.form.startFailed", "Không thể bắt đầu xuất Excel."),
      );
    } finally {
      setStarting(false);
    }
  };

  const handleDownload = async (jobId: string) => {
    const row = historyQuery.data?.items.find((item) => item.jobId === jobId);
    if (!row?.canDownload || downloadingJobId) return;

    try {
      setDownloadingJobId(jobId);
      await downloadReadyFile(jobId, row.fileName);
      await historyQuery.refetch();
    } catch (error: any) {
      toast.error(
        error?.message ||
          t(
            "v2.exportExcel.form.downloadFailed",
            "Không thể tải lại file XLSX.",
          ),
      );
    } finally {
      setDownloadingJobId(null);
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
