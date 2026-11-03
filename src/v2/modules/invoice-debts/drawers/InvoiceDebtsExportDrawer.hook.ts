import { useEffect, useMemo, useState } from "react";
import type { V2ColumnSelectorGroup } from "@/v2/shared/components/molecules/v2-column-selector";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { useV2ToastStore } from "@/v2/shared/stores/useV2ToastStore";
import { isDateRangeInvalid } from "@/v2/shared/utils/exportPeriod";
import { invoiceDebtsExportApi } from "../api/invoiceDebtsExportApi";
import type {
  InvoiceDebtsExportQuery,
  InvoicePartnerType,
} from "../api/dtos/invoiceDebtsExport.dto";
import {
  INVOICE_DEBTS_EXPORT_COLUMN_GROUPS,
  INVOICE_DEBTS_EXPORT_DEFAULT_COLUMNS,
} from "./InvoiceDebtsExportDrawer.columns.config";
import {
  buildExportPayload,
  buildFilterSummary,
} from "./InvoiceDebtsExportDrawer.helper";
import { useInvoiceDebtsExportHistory } from "./InvoiceDebtsExportDrawer.history.hook";
import { useInvoiceDebtsExportPeriod } from "./InvoiceDebtsExportDrawer.period.hook";
import { useInvoiceDebtsExportDownload } from "./useInvoiceDebtsExportDownload";

interface UseInvoiceDebtsExportDrawerOptions {
  open: boolean;
  initialPartnerType?: InvoicePartnerType;
  buildBaseQuery?: () => Partial<InvoiceDebtsExportQuery>;
}

export function useInvoiceDebtsExportDrawer({
  open,
  initialPartnerType,
  buildBaseQuery,
}: UseInvoiceDebtsExportDrawerOptions) {
  const { t } = useV2Translation();
  const period = useInvoiceDebtsExportPeriod();

  const [partnerType, setPartnerType] = useState<
    InvoicePartnerType | undefined
  >(initialPartnerType);
  const [selectedColumns, setSelectedColumns] = useState<string[]>(
    INVOICE_DEBTS_EXPORT_DEFAULT_COLUMNS,
  );
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [starting, setStarting] = useState(false);
  const [trackedJobId, setTrackedJobId] = useState<string | null>(null);

  useEffect(() => {
    if (open) setPartnerType(initialPartnerType);
  }, [initialPartnerType, open]);

  const notify = (variant: "success" | "destructive", title: string) =>
    useV2ToastStore.getState().showToast({ title, variant });

  const { downloadingJobId, handleDownload } = useInvoiceDebtsExportDownload({
    downloadToastText: t(
      "v2.exportExcel.history.download",
      "Đang tải file XLSX.",
    ),
    failedToastText: t(
      "v2.exportExcel.form.downloadFailed",
      "Không thể tải lại file XLSX.",
    ),
  });

  const {
    historyQuery,
    historyItems,
    historyTotal,
    historyLoading,
    refreshHistory,
  } = useInvoiceDebtsExportHistory({
    open,
    page,
    pageSize,
    trackedJobId,
    onAutoDownload: handleDownload,
  });

  const columnGroups = useMemo<V2ColumnSelectorGroup[]>(
    () =>
      INVOICE_DEBTS_EXPORT_COLUMN_GROUPS.map((group) => ({
        key: group.key,
        label: t(group.labelKey, group.key),
        columns: group.columns.map((c) => ({
          key: c.key,
          label: t(c.labelKey, c.key),
        })),
      })),
    [t],
  );

  const baseQuery = useMemo(
    () => (buildBaseQuery ? buildBaseQuery() : {}),
    [buildBaseQuery],
  );

  const filterSummary = useMemo(
    () =>
      buildFilterSummary(baseQuery, partnerType, {
        partnerAll: t("v2.invoiceDebts.export.partnerAll", "Tất cả"),
        partnerCustomer: t("v2.invoiceDebts.export.customer", "Khách hàng"),
        partnerSupplier: t("v2.invoiceDebts.export.supplier", "Nhà cung cấp"),
        keywordLabel: t("v2.invoiceDebts.export.filter.keyword", "Từ khóa"),
        noKeyword: t("v2.invoiceDebts.export.filter.noKeyword", "Không có"),
        partnerTypeLabel: t(
          "v2.invoiceDebts.export.filter.partnerType",
          "Đối tượng",
        ),
      }),
    [baseQuery, partnerType, t],
  );

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
      const payload = buildExportPayload({
        exportMode: period.exportMode,
        baseQuery,
        partnerType,
        dateFrom: period.dateFrom,
        dateTo: period.dateTo,
        selectedColumns,
      });

      const result = await invoiceDebtsExportApi.startBackgroundExport(payload);
      setTrackedJobId(result.jobId);

      const fallback = result.reused
        ? t(
            "v2.exportExcel.form.reused",
            "Đã tìm thấy file cũ. Bạn có thể tải lại ngay.",
          )
        : t("v2.exportExcel.form.started", "Đã bắt đầu tiến trình xuất Excel.");
      notify("success", result.message || fallback);

      if (result.reused) void handleDownload(result.jobId);
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
    partnerType,
    setPartnerType,
    columnGroups,
    selectedColumns,
    setSelectedColumns,
    page,
    setPage,
    pageSize,
    setPageSize,
    starting,
    downloadingJobId,
    historyItems,
    historyTotal,
    historyLoading,
    refreshHistory,
    filterSummary,
    handleStartExport,
    handleDownload,
  };
}
