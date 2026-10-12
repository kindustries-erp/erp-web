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
  const [period, setPeriod] = useState(initPeriod());
  const [dateFrom, setDateFrom] = useState(periodFirstDay(period));
  const [dateTo, setDateTo] = useState(periodLastDay(period));

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
    const baseQuery = buildBaseQuery();
    return exportMode === "by-period"
      ? {
          ...baseQuery,
          direction,
          date_from: `${dateFrom}T00:00:00`,
          date_to: `${dateTo}T23:59:59`,
        }
      : { ...baseQuery, direction };
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
    buildScopeQuery,
  };
}
