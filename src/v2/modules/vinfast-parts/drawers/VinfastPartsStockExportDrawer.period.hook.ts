import { useEffect, useMemo, useState } from "react";
import type { V2ExportMode } from "@/v2/shared/components/molecules/v2-export-condition-section";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import {
  generateMonthOptions,
  generateQuarterOptions,
  initMonth,
  initQuarter,
  monthFirstDay,
  monthFromExactRange,
  monthLastDay,
  quarterFirstDay,
  quarterFromExactRange,
  quarterLastDay,
  type V2ExportPeriodType,
} from "@/v2/shared/utils/exportPeriod";

/**
 * Chế độ xuất, kỳ (tháng / quý / tùy chỉnh) và khoảng ngày.
 * Chọn tháng hoặc quý sẽ cập nhật khoảng ngày; sửa ngày thủ công sẽ suy ra lại kỳ tương ứng.
 */
export function useVinfastPartsStockExportPeriod() {
  const { t } = useV2Translation();
  const [exportMode, setExportMode] = useState<V2ExportMode>("by-period");
  const [periodType, setPeriodType] = useState<V2ExportPeriodType>("month");
  const [period, setPeriod] = useState(initMonth());
  const [quarter, setQuarter] = useState(initQuarter());
  const [dateFrom, setDateFrom] = useState(monthFirstDay(period));
  const [dateTo, setDateTo] = useState(monthLastDay(period));

  const periodOptions = useMemo(
    () =>
      generateMonthOptions(24, new Date(), (month, year) =>
        t("v2.exportExcel.condition.monthLabel", {
          defaultValue: "Tháng {{month}}/{{year}}",
          month,
          year,
        }),
      ),
    [t],
  );

  const quarterOptions = useMemo(
    () =>
      generateQuarterOptions(3, new Date(), (quarterNum, year) =>
        t("v2.exportExcel.condition.quarterLabel", {
          defaultValue: "Quý {{quarter}}/{{year}}",
          quarter: quarterNum,
          year,
        }),
      ),
    [t],
  );

  const handlePeriodTypeChange = (next: V2ExportPeriodType) => {
    setPeriodType(next);
    if (next === "month") {
      const active = period || initMonth();
      setPeriod(active);
      setDateFrom(monthFirstDay(active));
      setDateTo(monthLastDay(active));
    } else if (next === "quarter") {
      const active = quarter || initQuarter();
      setQuarter(active);
      setDateFrom(quarterFirstDay(active));
      setDateTo(quarterLastDay(active));
    }
  };

  const handlePeriodChange = (value: string) => {
    setPeriod(value);
    if (value) {
      setDateFrom(monthFirstDay(value));
      setDateTo(monthLastDay(value));
    }
  };

  const handleQuarterChange = (value: string) => {
    setQuarter(value);
    if (value) {
      setDateFrom(quarterFirstDay(value));
      setDateTo(quarterLastDay(value));
    }
  };

  useEffect(() => {
    if (periodType === "month") {
      const next = monthFromExactRange(dateFrom, dateTo);
      setPeriod((prev) => (prev === next ? prev : next));
    } else if (periodType === "quarter") {
      const next = quarterFromExactRange(dateFrom, dateTo);
      setQuarter((prev) => (prev === next ? prev : next));
    }
  }, [dateFrom, dateTo, periodType]);

  return {
    exportMode,
    setExportMode,
    periodType,
    handlePeriodTypeChange,
    period,
    handlePeriodChange,
    periodOptions,
    quarter,
    handleQuarterChange,
    quarterOptions,
    dateFrom,
    dateTo,
    setDateFrom,
    setDateTo,
  };
}
