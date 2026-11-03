export type V2ExportPeriodType = "month" | "quarter" | "year" | "custom";

export interface V2ExportPeriodOption {
  value: string;
  label: string;
}

/** Nhãn tùy biến (đã dịch) cho một mốc thời gian, mặc định giữ nguyên tiếng Việt */
export type V2PeriodLabelFormatter = (
  /** Số thứ tự kỳ: tháng 1–12 hoặc quý 1–4 */
  index: number,
  year: number,
  /** Ngày đầu và cuối kỳ dạng `yyyy-MM-dd` */
  from: string,
  to: string,
) => string;
