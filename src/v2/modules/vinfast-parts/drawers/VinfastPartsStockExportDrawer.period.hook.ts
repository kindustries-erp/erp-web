import { useEffect, useMemo, useState } from "react";
import {
  initPeriod,
  periodFirstDay,
  periodFromExactRange,
  periodLastDay,
} from "@/modules/finance/utils/financeHelpers";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { buildPeriodOptions } from "./VinfastPartsStockExportDrawer.helper";

/** Kỳ (tháng / tất cả / tùy chỉnh) và khoảng ngày đồng bộ hai chiều */
export function useVinfastPartsStockExportPeriod() {
  const { t } = useV2Translation();
  const [period, setPeriod] = useState(initPeriod());
  const [dateFrom, setDateFrom] = useState(periodFirstDay(period));
  const [dateTo, setDateTo] = useState(periodLastDay(period));

  const periodOptions = useMemo(
    () =>
      buildPeriodOptions({
        allRange: t("v2.exportExcel.form.allRange", "Tất cả thời gian"),
        customRange: t(
          "v2.exportExcel.form.customRange",
          "Tùy chỉnh từ ngày/đến ngày",
        ),
      }),
    [t],
  );

  const handlePeriodChange = (next?: string) => {
    const value = next || "";
    if (!value || value === "custom") {
      setPeriod("custom");
      return;
    }

    setPeriod(value);
    if (value === "all") {
      setDateFrom("");
      setDateTo("");
      return;
    }
    setDateFrom(periodFirstDay(value));
    setDateTo(periodLastDay(value));
  };

  useEffect(() => {
    if (!dateFrom && !dateTo) {
      setPeriod((prev) => (prev === "all" ? prev : "all"));
      return;
    }
    const nextPeriod = periodFromExactRange(dateFrom, dateTo) || "custom";
    setPeriod((prev) => (prev === nextPeriod ? prev : nextPeriod));
  }, [dateFrom, dateTo]);

  return {
    period,
    periodOptions,
    handlePeriodChange,
    dateFrom,
    dateTo,
    setDateFrom,
    setDateTo,
  };
}
