import { useCallback, useMemo, useState } from "react";

import {
  buildPeriodOptions,
  defaultPeriodValue,
  periodRange,
  toIsoDate,
  type ExportPeriodUnit,
  type PeriodOption,
  type PeriodRange,
} from "./exportPeriod";

export interface UseExportPeriodOptions {
  initialUnit?: ExportPeriodUnit;
  /** Dùng khi `initialUnit = "custom"`. */
  initialFrom?: string;
  initialTo?: string;
  today?: Date;
}

export interface ExportPeriodState {
  unit: ExportPeriodUnit;
  value: string;
  options: PeriodOption[];
  dateFrom: string;
  dateTo: string;
  setUnit: (unit: ExportPeriodUnit) => void;
  setValue: (value: string) => void;
  setDateFrom: (value: string) => void;
  setDateTo: (value: string) => void;
}

/**
 * Trạng thái chọn kỳ Tuần / Tháng / Quý / Tùy chỉnh. `dateFrom/dateTo` luôn là
 * khoảng ngày cuối cùng gửi lên API (YYYY-MM-DD).
 */
export function useExportPeriod({
  initialUnit = "month",
  initialFrom,
  initialTo,
  today,
}: UseExportPeriodOptions = {}): ExportPeriodState {
  const base = today ?? new Date();
  const [unit, setUnitState] = useState<ExportPeriodUnit>(initialUnit);
  const [value, setValueState] = useState(() =>
    defaultPeriodValue(initialUnit, base),
  );
  const [custom, setCustom] = useState<PeriodRange>(() => ({
    from: initialFrom ?? toIsoDate(base),
    to: initialTo ?? toIsoDate(base),
  }));

  const options = useMemo(() => buildPeriodOptions(unit, base), [unit, base]);

  const setUnit = useCallback(
    (next: ExportPeriodUnit) => {
      setUnitState(next);
      if (next === "custom") {
        // Giữ khoảng ngày của kỳ đang chọn làm điểm xuất phát cho tùy chỉnh.
        const current = periodRange(unit, value);
        if (current) setCustom(current);
        setValueState("");
      } else {
        setValueState(defaultPeriodValue(next, base));
      }
    },
    [unit, value, base],
  );

  const range = useMemo(
    () => (unit === "custom" ? custom : periodRange(unit, value)),
    [unit, value, custom],
  );

  return {
    unit,
    value,
    options,
    dateFrom: range?.from ?? "",
    dateTo: range?.to ?? "",
    setUnit,
    setValue: setValueState,
    setDateFrom: (from: string) => setCustom((prev) => ({ ...prev, from })),
    setDateTo: (to: string) => setCustom((prev) => ({ ...prev, to })),
  };
}
