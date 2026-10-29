import { useMemo, useState } from "react";
import type { V2PeriodUnit } from "@/v2/shared/components/organisms/v2-period-picker";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import {
  generateMonthOptions,
  generateQuarterOptions,
  generateWeekOptions,
  initMonth,
  initQuarter,
  initWeek,
  monthFirstDay,
  monthLastDay,
  quarterFirstDay,
  quarterLastDay,
  weekFirstDay,
  weekLastDay,
} from "@/v2/shared/utils/exportPeriod";

/** Khoảng ngày của một kỳ; tùy chỉnh không có khoảng cố định */
function rangeOf(unit: V2PeriodUnit, value: string) {
  if (!value) return { from: "", to: "" };
  if (unit === "week")
    return { from: weekFirstDay(value), to: weekLastDay(value) };
  if (unit === "quarter") {
    return { from: quarterFirstDay(value), to: quarterLastDay(value) };
  }
  return { from: monthFirstDay(value), to: monthLastDay(value) };
}

/** Giá trị kỳ mặc định (kỳ hiện tại) của từng đơn vị */
function defaultPeriodOf(unit: V2PeriodUnit): string {
  if (unit === "week") return initWeek();
  if (unit === "quarter") return initQuarter();
  if (unit === "month") return initMonth();
  return "";
}

const shortDay = (iso: string) => `${iso.slice(8, 10)}/${iso.slice(5, 7)}`;

/**
 * Kỳ (tuần / tháng / quý / tùy chỉnh) và khoảng ngày đồng bộ hóa đơn.
 * Chọn kỳ sẽ cập nhật khoảng ngày; chỉ ở chế độ tùy chỉnh mới sửa ngày trực tiếp.
 * Không giới hạn độ dài khoảng ngày: API tự chia thành các cửa sổ quét.
 */
export function useInvoiceSyncPeriod() {
  const { t } = useV2Translation();
  const [unit, setUnit] = useState<V2PeriodUnit>("month");
  const [period, setPeriod] = useState(initMonth());
  const [dateFrom, setDateFrom] = useState(monthFirstDay(initMonth()));
  const [dateTo, setDateTo] = useState(monthLastDay(initMonth()));

  const periodOptions = useMemo(() => {
    if (unit === "week") {
      return generateWeekOptions(12, new Date(), (week, year, from, to) =>
        t("v2.periodPicker.weekLabel", {
          defaultValue: "Tuần {{week}}/{{year}} ({{from}} - {{to}})",
          week,
          year,
          from: shortDay(from),
          to: shortDay(to),
        }),
      );
    }
    if (unit === "quarter") {
      return generateQuarterOptions(3, new Date(), (quarterNum, year) =>
        t("v2.exportExcel.condition.quarterLabel", {
          defaultValue: "Quý {{quarter}}/{{year}}",
          quarter: quarterNum,
          year,
        }),
      );
    }
    return generateMonthOptions(24, new Date(), (month, year) =>
      t("v2.exportExcel.condition.monthLabel", {
        defaultValue: "Tháng {{month}}/{{year}}",
        month,
        year,
      }),
    );
  }, [unit, t]);

  const handleUnitChange = (next: V2PeriodUnit) => {
    setUnit(next);
    if (next === "custom") {
      setPeriod("");
      return;
    }
    const value = defaultPeriodOf(next);
    const range = rangeOf(next, value);
    setPeriod(value);
    setDateFrom(range.from);
    setDateTo(range.to);
  };

  const handlePeriodChange = (value: string) => {
    setPeriod(value);
    const range = rangeOf(unit, value);
    if (range.from && range.to) {
      setDateFrom(range.from);
      setDateTo(range.to);
    }
  };

  /** Đưa về tháng hiện tại, dùng khi mở lại drawer */
  const reset = () => handleUnitChange("month");

  return {
    unit,
    handleUnitChange,
    period,
    handlePeriodChange,
    periodOptions,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    reset,
  };
}

export type InvoiceSyncPeriodState = ReturnType<typeof useInvoiceSyncPeriod>;
