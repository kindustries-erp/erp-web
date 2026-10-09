import type * as React from "react";

export type V2StatTrendDirection = "up" | "down" | "flat";

export interface V2StatTrend {
  direction: V2StatTrendDirection;
  /** Nội dung đã dịch, ví dụ "+12% so với tháng trước" */
  label: string;
}

export interface V2StatCardProps {
  /** Nhãn chỉ số (đã dịch) */
  label: string;
  /** Giá trị đã format sẵn; component không tự format số/tiền */
  value: React.ReactNode;
  /** Đơn vị hiển thị sau giá trị, ví dụ "₫" hoặc "HĐ" */
  unit?: string;
  icon?: React.ReactNode;
  trend?: V2StatTrend;
  /** Hiển thị khung chờ thay cho giá trị */
  loading?: boolean;
  className?: string;
}
