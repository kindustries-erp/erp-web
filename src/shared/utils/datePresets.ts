import {
  format,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  subMonths,
  subDays,
  subQuarters,
  startOfQuarter,
  endOfQuarter,
} from "date-fns";

export type PresetKey =
  | "today"
  | "yesterday"
  | "thisMonth"
  | "lastMonth"
  | "thisQuarter"
  | "lastQuarter"
  | "thisYear"
  | "all"
  | `month-${string}`
  | `quarter-${string}`;

export function getPresetRange(
  key: PresetKey,
  year: number,
): {
  from: Date | undefined;
  to: Date | undefined;
} {
  const now = new Date();
  if (key.startsWith("month-")) {
    const m = parseInt(key.split("-")[1], 10) - 1;
    const d = new Date(year, m, 1);
    return { from: startOfMonth(d), to: endOfMonth(d) };
  }
  if (key.startsWith("quarter-")) {
    const q = parseInt(key.split("-")[1], 10) - 1;
    const m = q * 3;
    const d = new Date(year, m, 1);
    return { from: startOfQuarter(d), to: endOfQuarter(d) };
  }

  switch (key) {
    case "today":
      return { from: now, to: now };
    case "yesterday": {
      const yesterday = subDays(now, 1);
      return { from: yesterday, to: yesterday };
    }
    case "thisMonth":
      return { from: startOfMonth(now), to: endOfMonth(now) };
    case "lastMonth": {
      const last = subMonths(now, 1);
      return { from: startOfMonth(last), to: endOfMonth(last) };
    }
    case "thisQuarter":
      return { from: startOfQuarter(now), to: endOfQuarter(now) };
    case "lastQuarter": {
      const last = subQuarters(now, 1);
      return { from: startOfQuarter(last), to: endOfQuarter(last) };
    }
    case "thisYear":
      return { from: startOfYear(now), to: endOfYear(now) };
    case "all":
      return { from: undefined, to: undefined };
    default:
      return { from: undefined, to: undefined };
  }
}

export interface MonthPresetOption {
  value: string;
  label: string;
}

/**
 * Sinh danh sách các kỳ tháng từ thời điểm hiện tại trở về quá khứ (không bao gồm tháng tương lai).
 * @param yearsBack Số năm về quá khứ cần sinh (mặc định 2 năm)
 * @param labelFormatter Hàm format hiển thị (mặc định `Tháng ${month}/${year}`)
 */
export function getPastMonthPresets(
  yearsBack = 2,
  labelFormatter: (month: number, year: number) => string = (m, y) =>
    `Tháng ${m}/${y}`,
): MonthPresetOption[] {
  const options: MonthPresetOption[] = [];
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  for (let year = currentYear; year >= currentYear - yearsBack; year--) {
    const maxMonth = year === currentYear ? currentMonth : 12;
    for (let month = maxMonth; month >= 1; month--) {
      options.push({
        value: `month-${month}-${year}`,
        label: labelFormatter(month, year),
      });
    }
  }
  return options;
}

/**
 * Trả về preset và khoảng ngày của tháng hiện tại (từ ngày đầu tháng đến ngày cuối tháng).
 */
export function getCurrentMonthPreset(): {
  presetKey: string;
  from: string;
  to: string;
} {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  return {
    presetKey: `month-${month}-${year}`,
    from: format(startOfMonth(now), "yyyy-MM-dd"),
    to: format(endOfMonth(now), "yyyy-MM-dd"),
  };
}
