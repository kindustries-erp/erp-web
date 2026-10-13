import { format, isValid } from "date-fns";
import {
  PERIOD_OPTS,
  periodFirstDay,
  periodLastDay,
  periodFromExactRange,
} from "@/modules/finance/utils/financeHelpers";
import { getPresetRange, type PresetKey } from "@/shared/utils/datePresets";
import type {
  PeriodComboboxOption,
  PeriodPresetKey,
} from "./DateRangeColumnSlot.type";

export function toIsoString(d: Date | undefined): string {
  if (!d || !isValid(d)) return "";
  return format(d, "yyyy-MM-dd");
}

export function buildQuickPresetOptions(
  t: (key: string, def?: string) => string,
): { key: PeriodPresetKey; label: string }[] {
  return [
    { key: "all", label: t("common.all", "Tất cả") },
    { key: "today", label: t("common.today", "Hôm nay") },
    { key: "yesterday", label: t("common.yesterday", "Hôm qua") },
    { key: "thisMonth", label: t("common.thisMonth", "Tháng này") },
    { key: "lastMonth", label: t("common.lastMonth", "Tháng trước") },
    { key: "thisQuarter", label: t("common.thisQuarter", "Quý này") },
    { key: "lastQuarter", label: t("common.lastQuarter", "Quý trước") },
    { key: "thisYear", label: t("common.thisYear", "Năm nay") },
  ];
}

export function buildMonthPeriodOptions(
  t: (key: string, def?: string) => string,
): PeriodComboboxOption[] {
  const monthOptions: PeriodComboboxOption[] = PERIOD_OPTS.map((opt) => ({
    value: opt.value,
    label: opt.label,
  }));

  return [
    { value: "all", label: t("common.allPeriods", "Tất cả kỳ") },
    ...monthOptions,
    { value: "custom", label: t("common.custom", "Tùy chỉnh") },
  ];
}

export function getRangeForPreset(
  key: PeriodPresetKey,
  year = new Date().getFullYear(),
): { from: string; to: string } {
  if (!key || key === "all" || key === "custom") {
    return { from: "", to: "" };
  }
  const range = getPresetRange(key as PresetKey, year);
  return {
    from: toIsoString(range.from),
    to: toIsoString(range.to),
  };
}

export function getRangeForMonthPeriod(periodKey: string): {
  from: string;
  to: string;
} {
  if (!periodKey || periodKey === "all" || periodKey === "custom") {
    return { from: "", to: "" };
  }
  if (/^\d{4}-\d{2}$/.test(periodKey)) {
    return {
      from: periodFirstDay(periodKey),
      to: periodLastDay(periodKey),
    };
  }
  return { from: "", to: "" };
}

export function detectPresetFromRange(
  from: string,
  to: string,
): PeriodPresetKey {
  if (!from && !to) return "all";

  const year = new Date().getFullYear();
  const presetsToCheck: PresetKey[] = [
    "today",
    "yesterday",
    "thisMonth",
    "lastMonth",
    "thisQuarter",
    "lastQuarter",
    "thisYear",
  ];

  for (const key of presetsToCheck) {
    const r = getPresetRange(key, year);
    if (toIsoString(r.from) === from && toIsoString(r.to) === to) {
      return key as PeriodPresetKey;
    }
  }

  return "custom";
}

export function detectMonthPeriodFromRange(from: string, to: string): string {
  if (!from && !to) return "all";
  const matchedMonth = periodFromExactRange(from, to);
  if (matchedMonth) return matchedMonth;
  return "custom";
}
