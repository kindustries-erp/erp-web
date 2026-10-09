export type V2ProgressTone = "primary" | "emerald" | "amber" | "rose";

export interface V2ProgressProps {
  /** 0–100. Bỏ trống nghĩa là chưa biết tiến độ (thanh nhấp nháy) */
  value?: number;
  tone?: V2ProgressTone;
  /** Nhãn hiển thị phía trên thanh (đã dịch) */
  label?: string;
  /** Hiện phần trăm bên phải nhãn */
  showValue?: boolean;
  className?: string;
}
