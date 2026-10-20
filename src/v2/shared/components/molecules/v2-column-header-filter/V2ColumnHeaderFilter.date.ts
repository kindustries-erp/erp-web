import type { V2DateRange } from "@/v2/shared/types/v2-table";

export type V2DatePreset = "today" | "last7" | "last30" | "thisMonth";

export const V2_DATE_PRESETS: V2DatePreset[] = [
  "today",
  "last7",
  "last30",
  "thisMonth",
];

const pad = (value: number): string => String(value).padStart(2, "0");

export const toISODate = (date: Date): string =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

const shiftDays = (date: Date, days: number): Date => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

export const getDatePreset = (
  preset: V2DatePreset,
  now: Date = new Date(),
): V2DateRange => {
  const to = toISODate(now);
  switch (preset) {
    case "today":
      return { from: to, to };
    case "last7":
      return { from: toISODate(shiftDays(now, -6)), to };
    case "last30":
      return { from: toISODate(shiftDays(now, -29)), to };
    case "thisMonth":
      return {
        from: toISODate(new Date(now.getFullYear(), now.getMonth(), 1)),
        to,
      };
  }
};
