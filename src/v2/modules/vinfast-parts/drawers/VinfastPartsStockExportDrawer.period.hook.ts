import { useEffect, useMemo, useState } from "react";
import {
  PERIOD_OPTS,
  initPeriod,
  periodFirstDay,
  periodFromExactRange,
  periodLastDay,
} from "@/modules/finance/utils/financeHelpers";
import type { V2ExportMode } from "@/v2/shared/components/molecules/v2-export-condition-section";
import {
  generateQuarterOptions,
  initQuarter,
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
  const [exportMode, setExportMode] = useState<V2ExportMode>("by-period");
  const [periodType, setPeriodType] = useState<V2ExportPeriodType>("month");
  const [period, setPeriod] = useState(initPeriod());
  const [quarter, setQuarter] = useState(initQuarter());
  const [dateFrom, setDateFrom] = useState(periodFirstDay(period));
  const [dateTo, setDateTo] = useState(periodLastDay(period));

  const periodOptions = useMemo(() => PERIOD_OPTS, []);
  const quarterOptions = useMemo(
    () =>
      generateQuarterOptions(3).map(({ value, label }) => ({ value, label })),
    [],
  );

  const handlePeriodTypeChange = (next: V2ExportPeriodType) => {
    setPeriodType(next);
    if (next === "month") {
      const active = period || initPeriod();
      setPeriod(active);
      setDateFrom(periodFirstDay(active));
      setDateTo(periodLastDay(active));
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
      setDateFrom(periodFirstDay(value));
      setDateTo(periodLastDay(value));
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
      const next = periodFromExactRange(dateFrom, dateTo) || "";
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
