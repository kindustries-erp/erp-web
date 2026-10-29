import { useEffect, useMemo, useState } from "react";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import {
  generateMonthOptions,
  generateQuarterOptions,
  generateYearOptions,
  initMonth,
  initQuarter,
  initYear,
  monthFirstDay,
  monthFromExactRange,
  monthLastDay,
  quarterFirstDay,
  quarterFromExactRange,
  quarterLastDay,
  yearFirstDay,
  yearFromExactRange,
  yearLastDay,
  type V2ExportPeriodType,
} from "@/v2/shared/utils/exportPeriod";

/**
 * Kỳ (tháng / quý / năm / tùy chỉnh) và khoảng ngày đồng bộ.
 * Chọn kỳ sẽ cập nhật khoảng ngày; sửa ngày thủ công sẽ suy ra lại kỳ tương ứng.
 * Không giới hạn độ dài khoảng ngày: API tự chia thành các cửa sổ quét.
 */
export function useInvoiceSyncPeriod() {
  const { t } = useV2Translation();
  const [periodType, setPeriodType] = useState<V2ExportPeriodType>("month");
  const [period, setPeriod] = useState(initMonth());
  const [quarter, setQuarter] = useState(initQuarter());
  const [year, setYear] = useState(initYear());
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

  const yearOptions = useMemo(
    () =>
      generateYearOptions(4, new Date(), (y) =>
        t("v2.exportExcel.condition.yearLabel", {
          defaultValue: "Năm {{year}}",
          year: y,
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
    } else if (next === "year") {
      const active = year || initYear();
      setYear(active);
      setDateFrom(yearFirstDay(active));
      setDateTo(yearLastDay(active));
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

  const handleYearChange = (value: string) => {
    setYear(value);
    if (value) {
      setDateFrom(yearFirstDay(value));
      setDateTo(yearLastDay(value));
    }
  };

  useEffect(() => {
    if (periodType === "month") {
      const next = monthFromExactRange(dateFrom, dateTo);
      setPeriod((prev) => (prev === next ? prev : next));
    } else if (periodType === "quarter") {
      const next = quarterFromExactRange(dateFrom, dateTo);
      setQuarter((prev) => (prev === next ? prev : next));
    } else if (periodType === "year") {
      const next = yearFromExactRange(dateFrom, dateTo);
      setYear((prev) => (prev === next ? prev : next));
    }
  }, [dateFrom, dateTo, periodType]);

  /** Đưa về tháng hiện tại, dùng khi mở lại drawer */
  const reset = () => {
    const current = initMonth();
    setPeriodType("month");
    setPeriod(current);
    setDateFrom(monthFirstDay(current));
    setDateTo(monthLastDay(current));
  };

  return {
    periodType,
    handlePeriodTypeChange,
    period,
    handlePeriodChange,
    periodOptions,
    quarter,
    handleQuarterChange,
    quarterOptions,
    year,
    handleYearChange,
    yearOptions,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    reset,
  };
}

export type InvoiceSyncPeriodState = ReturnType<typeof useInvoiceSyncPeriod>;
