import type { ComboboxOption } from "@/shared/components/Combobox";

export interface DateRangeColumnSlotProps {
  dateFrom: string; // "yyyy-MM-dd" or ""
  dateTo: string; // "yyyy-MM-dd" or ""
  onChange: (from: string, to: string) => void;
  onClose?: () => void;
  className?: string;
}

export type PeriodPresetKey =
  | "all"
  | "thisMonth"
  | "lastMonth"
  | "thisQuarter"
  | "lastQuarter"
  | "thisYear"
  | "today"
  | "yesterday"
  | "custom";

export type PeriodComboboxOption = ComboboxOption;
