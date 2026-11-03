import type * as React from "react";
import type { V2ComboboxOption } from "@/v2/shared/components/molecules/v2-combobox";
import type { V2ExportPeriodType } from "@/v2/shared/utils/exportPeriod";

export type V2ExportMode = "by-period" | "by-current-filter";

export interface V2ExportFilterSummaryRow {
  label: string;
  value: string;
}

export interface V2ExportConditionSectionProps {
  exportMode: V2ExportMode;
  onExportModeChange: (mode: V2ExportMode) => void;

  periodType: V2ExportPeriodType;
  onPeriodTypeChange: (type: V2ExportPeriodType) => void;
  period: string;
  onPeriodChange: (period: string) => void;
  periodOptions: V2ComboboxOption[];
  quarter: string;
  onQuarterChange: (quarter: string) => void;
  quarterOptions: V2ComboboxOption[];
  year?: string;
  onYearChange?: (year: string) => void;
  yearOptions?: V2ComboboxOption[];
  dateFrom: string;
  onDateFromChange: (value: string) => void;
  dateTo: string;
  onDateToChange: (value: string) => void;

  /** Tóm tắt bộ lọc đang áp dụng, hiện khi chọn "Theo filter hiện tại" */
  filterSummaryRows?: V2ExportFilterSummaryRow[];
  filterCount?: number;

  starting: boolean;
  startDisabled?: boolean;
  onStart: () => void;
  /** Nội dung chèn trước nút xuất (ví dụ chọn loại file) */
  children?: React.ReactNode;
  className?: string;
}
