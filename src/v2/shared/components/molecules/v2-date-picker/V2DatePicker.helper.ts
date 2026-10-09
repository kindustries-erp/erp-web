import {
  endOfMonth,
  endOfQuarter,
  endOfYear,
  format,
  isValid,
  parse,
  startOfMonth,
  startOfQuarter,
  startOfYear,
  subMonths,
} from "date-fns";
import type { Matcher } from "react-day-picker";
import type { V2DateRangePreset } from "./V2DatePicker.type";

const ISO_FORMAT = "yyyy-MM-dd";
const DISPLAY_FORMAT = "dd/MM/yyyy";

export const parseIsoDate = (
  iso: string | null | undefined,
): Date | undefined => {
  if (!iso) return undefined;
  const date = parse(iso, ISO_FORMAT, new Date());
  return isValid(date) ? date : undefined;
};

export const toIsoDate = (date: Date): string => format(date, ISO_FORMAT);

/** `yyyy-MM-dd` thành `dd/MM/yyyy`; chuỗi rỗng nếu không hợp lệ */
export const formatDisplayDate = (iso: string | null | undefined): string => {
  const date = parseIsoDate(iso);
  return date ? format(date, DISPLAY_FORMAT) : "";
};

export const buildDisabledMatchers = (
  minDate?: string,
  maxDate?: string,
): Matcher[] => {
  const min = parseIsoDate(minDate);
  const max = parseIsoDate(maxDate);
  return [...(min ? [{ before: min }] : []), ...(max ? [{ after: max }] : [])];
};

type Translate = (key: string, fallback?: string) => string;

/** Các mốc chọn nhanh thường dùng: hôm nay, tháng này, tháng trước, quý này, năm nay */
export const buildV2DatePresets = (
  t: Translate,
  today: Date = new Date(),
): V2DateRangePreset[] => {
  const range = (from: Date, to: Date) => () => ({
    from: toIsoDate(from),
    to: toIsoDate(to),
  });
  const lastMonth = subMonths(today, 1);
  return [
    {
      key: "today",
      label: t("v2.form.presetToday", "Hôm nay"),
      range: range(today, today),
    },
    {
      key: "thisMonth",
      label: t("v2.form.presetThisMonth", "Tháng này"),
      range: range(startOfMonth(today), endOfMonth(today)),
    },
    {
      key: "lastMonth",
      label: t("v2.form.presetLastMonth", "Tháng trước"),
      range: range(startOfMonth(lastMonth), endOfMonth(lastMonth)),
    },
    {
      key: "thisQuarter",
      label: t("v2.form.presetThisQuarter", "Quý này"),
      range: range(startOfQuarter(today), endOfQuarter(today)),
    },
    {
      key: "thisYear",
      label: t("v2.form.presetThisYear", "Năm nay"),
      range: range(startOfYear(today), endOfYear(today)),
    },
  ];
};
