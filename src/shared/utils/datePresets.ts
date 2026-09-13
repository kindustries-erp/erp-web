import {
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
