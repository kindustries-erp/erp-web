import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import {
  PERIOD_OPTS,
  periodFirstDay,
  periodLastDay,
  periodFromExactRange,
  initPeriod,
} from "@/modules/finance/utils/financeHelpers";
import {
  erpInvoicesCoreApi,
  type ErpInvoiceListParams,
} from "@/modules/erp-invoices-core/api/erpInvoicesCoreApi";
import type { InvoiceExportMode } from "./components/InvoiceExportModeSelector";
import { useInvoiceExportSync } from "./InvoiceExportDrawer.sync.hook";

export interface UseInvoiceExportDrawerOptions {
  open: boolean;
  direction: "IN" | "OUT";
  buildBaseQuery: () => Partial<ErpInvoiceListParams>;
}

export function useInvoiceExportDrawer({
  open,
  direction,
  buildBaseQuery,
}: UseInvoiceExportDrawerOptions) {
  const { t } = useTranslation("erpInvoices");
  const [exportMode, setExportMode] = useState<InvoiceExportMode>("by-period");
  const [period, setPeriod] = useState(initPeriod());
  const [dateFrom, setDateFrom] = useState(periodFirstDay(period));
  const [dateTo, setDateTo] = useState(periodLastDay(period));
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [starting, setStarting] = useState(false);
  const [trackedJobId, setTrackedJobId] = useState<string | null>(null);

  const { downloadingJobId, progress, historyQuery, handleDownload } =
    useInvoiceExportSync({
      open,
      page,
      pageSize,
      direction,
      trackedJobId,
    });

  const periodOptions = useMemo(
    () => [
      ...PERIOD_OPTS,
      {
        value: "custom",
        label: t(
          "erpInvoices:exportDrawer.customRange",
          "Tùy chỉnh từ ngày/đến ngày",
        ),
      },
    ],
    [t],
  );

  const handlePeriodChange = (next?: string) => {
    const value = next || "";
    if (!value || value === "custom") {
      setPeriod("");
      return;
    }
    setPeriod(value);
    setDateFrom(periodFirstDay(value));
    setDateTo(periodLastDay(value));
  };

  useEffect(() => {
    const nextPeriod = periodFromExactRange(dateFrom, dateTo);
    setPeriod((prev) => (prev === nextPeriod ? prev : nextPeriod));
  }, [dateFrom, dateTo]);

  const handleStartExport = async () => {
    if (exportMode === "by-period" && (!dateFrom || !dateTo)) {
      toast.error(
        t(
          "erpInvoices:exportDrawer.error.missingDateRange",
          "Vui lòng chọn đầy đủ ngày bắt đầu và ngày kết thúc.",
        ),
      );
      return;
    }

    try {
      setStarting(true);
      const baseQuery = buildBaseQuery();
      const payload: ErpInvoiceListParams =
        exportMode === "by-period"
          ? {
              ...baseQuery,
              direction,
              date_from: `${dateFrom}T00:00:00`,
              date_to: `${dateTo}T23:59:59`,
            }
          : {
              ...baseQuery,
              direction,
            };
      const result =
        await erpInvoicesCoreApi.startExportExcelBackground(payload);
      setTrackedJobId(result.jobId);
      if (result.reused) {
        toast.success(
          result.message ||
            t(
              "erpInvoices:exportDrawer.toast.reused",
              "Đã tìm thấy file cũ. Đang tự động tải xuống.",
            ),
        );
        void handleDownload(result.jobId);
      } else {
        toast.success(
          result.message ||
            t(
              "erpInvoices:exportDrawer.toast.started",
              "Đã bắt đầu tiến trình xuất Excel.",
            ),
        );
      }
      await historyQuery.refetch();
    } catch (error: any) {
      toast.error(
        error?.message ||
          t(
            "erpInvoices:exportDrawer.error.startFailed",
            "Không thể bắt đầu xuất Excel.",
          ),
      );
    } finally {
      setStarting(false);
    }
  };

  return {
    exportMode,
    setExportMode,
    period,
    handlePeriodChange,
    periodOptions,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
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
