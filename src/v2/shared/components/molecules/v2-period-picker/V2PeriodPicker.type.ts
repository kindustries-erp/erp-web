import type { V2ExportPeriodOption } from "@/v2/shared/utils/exportPeriod";

/** Đơn vị kỳ hiển thị dạng pill tab */
export type V2PeriodUnit = "week" | "month" | "quarter" | "custom";

export interface V2PeriodPickerProps {
  /** Đơn vị đang chọn: tuần, tháng, quý hoặc tùy chỉnh */
  unit: V2PeriodUnit;
  onUnitChange: (unit: V2PeriodUnit) => void;
  /** Giá trị kỳ đang chọn (`yyyy-Wnn`, `yyyy-MM` hoặc `yyyy-Qn`); rỗng khi tùy chỉnh */
  period: string;
  onPeriodChange: (period: string) => void;
  periodOptions: V2ExportPeriodOption[];
  /** Ngày bắt đầu và kết thúc dạng `yyyy-MM-dd`, chỉ sửa được khi đơn vị là tùy chỉnh */
  dateFrom: string;
  onDateFromChange: (value: string) => void;
  dateTo: string;
  onDateToChange: (value: string) => void;
  className?: string;
}
