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
import type { ErpInvoiceListParams } from "@/modules/erp-invoices-core/api/erpInvoicesCoreApi";
import type { InvoiceExportMode } from "./components/InvoiceExportModeSelector";
import {
  generateQuarterOptions,
  initQuarter,
  quarterFirstDay,
  quarterFromExactRange,
  quarterLastDay,
  DEFAULT_EXPORT_COLUMN_KEYS,
  INVOICE_EXPORT_COLUMNS_STORAGE_KEY,
} from "./InvoiceExportDrawer.helper";

export type InvoiceExportPeriodType = "month" | "quarter" | "custom";

export interface UseInvoiceExportScopeOptions {
  direction: "IN" | "OUT";
  buildBaseQuery: () => Partial<ErpInvoiceListParams>;
  initialMode?: InvoiceExportMode;
}

/** State + payload builder cho phần "Điều kiện xuất" dùng chung (Excel / PDF-ZIP). */
export function useInvoiceExportScope({
  direction,
  buildBaseQuery,
  initialMode = "by-period",
}: UseInvoiceExportScopeOptions) {
  const { t } = useTranslation("erpInvoices");
  const [exportMode, setExportMode] = useState<InvoiceExportMode>(initialMode);
  const [periodType, setPeriodType] =
    useState<InvoiceExportPeriodType>("month");
  const [period, setPeriod] = useState(initPeriod());
  const [quarter, setQuarter] = useState(initQuarter());
  const [dateFrom, setDateFrom] = useState(periodFirstDay(period));
  const [dateTo, setDateTo] = useState(periodLastDay(period));

  const [selectedColumns, setSelectedColumns] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(INVOICE_EXPORT_COLUMNS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    return DEFAULT_EXPORT_COLUMN_KEYS;
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

  const quarterOptions = useMemo(() => generateQuarterOptions(3), []);

  const handlePeriodTypeChange = (nextType: InvoiceExportPeriodType) => {
    setPeriodType(nextType);
    if (nextType === "month") {
      const activePeriod = period || initPeriod();
      setPeriod(activePeriod);
      setDateFrom(periodFirstDay(activePeriod));
      setDateTo(periodLastDay(activePeriod));
    } else if (nextType === "quarter") {
      const activeQuarter = quarter || initQuarter();
      setQuarter(activeQuarter);
      setDateFrom(quarterFirstDay(activeQuarter));
      setDateTo(quarterLastDay(activeQuarter));
    }
  };

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

  const handleQuarterChange = (next?: string) => {
    const value = next || "";
    setQuarter(value);
    if (value) {
      setDateFrom(quarterFirstDay(value));
      setDateTo(quarterLastDay(value));
    }
  };

  const handleColumnsChange = (cols: string[]) => {
    setSelectedColumns(cols);
    try {
      localStorage.setItem(
        INVOICE_EXPORT_COLUMNS_STORAGE_KEY,
        JSON.stringify(cols),
      );
    } catch {
      // ignore
    }
  };

  const handleResetDefaultColumns = () => {
    handleColumnsChange(DEFAULT_EXPORT_COLUMN_KEYS);
  };

  useEffect(() => {
    if (periodType === "month") {
      const nextPeriod = periodFromExactRange(dateFrom, dateTo);
      setPeriod((prev) => (prev === nextPeriod ? prev : nextPeriod));
    } else if (periodType === "quarter") {
      const nextQuarter = quarterFromExactRange(dateFrom, dateTo);
      setQuarter((prev) => (prev === nextQuarter ? prev : nextQuarter));
    }
  }, [dateFrom, dateTo, periodType]);

  /** Trả về query theo chế độ đang chọn, hoặc null (đã toast) nếu thiếu ngày. */
  const buildScopeQuery = (): ErpInvoiceListParams | null => {
    if (exportMode === "by-period" && (!dateFrom || !dateTo)) {
      toast.error(
        t(
          "erpInvoices:exportDrawer.error.missingDateRange",
          "Vui lòng chọn đầy đủ ngày bắt đầu và ngày kết thúc.",
        ),
      );
      return null;
    }

    if (selectedColumns.length === 0) {
      toast.error(
        t(
          "erpInvoices:exportDrawer.error.noColumnsSelected",
          "Vui lòng chọn ít nhất 1 cột để xuất báo cáo.",
        ),
      );
      return null;
    }

    const baseQuery = buildBaseQuery();
    return exportMode === "by-period"
      ? {
          ...baseQuery,
          direction,
          date_from: `${dateFrom}T00:00:00`,
          date_to: `${dateTo}T23:59:59`,
          selected_columns: selectedColumns,
        }
      : {
          ...baseQuery,
          direction,
          selected_columns: selectedColumns,
        };
  };

  return {
    exportMode,
    setExportMode,
    periodType,
    setPeriodType,
    handlePeriodTypeChange,
    period,
    handlePeriodChange,
    periodOptions,
    quarter,
    handleQuarterChange,
    quarterOptions,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    selectedColumns,
    setSelectedColumns,
    handleColumnsChange,
    handleResetDefaultColumns,
    buildScopeQuery,
  };
}
