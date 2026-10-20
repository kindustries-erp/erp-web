import type * as React from "react";

export interface V2ChartSeries {
  key: string;
  label: string;
  data: number[];
}

export interface V2ChartLegendItem {
  key: string;
  label: string;
  color: string;
}

export interface V2ChartFrameProps {
  /** Nhãn trục hạng mục (hoặc tên từng mảng với biểu đồ tròn) */
  labels: string[];
  /** Dữ liệu cho chế độ xem dạng bảng */
  series: V2ChartSeries[];
  /** Legend hiện khi có từ 2 mục trở lên */
  legend: V2ChartLegendItem[];
  formatValue?: (value: number) => string;
  /** Mô tả biểu đồ cho trình đọc màn hình, cũng là tên của bảng */
  ariaLabel: string;
  loading?: boolean;
  height?: number;
  /** Phần vẽ biểu đồ */
  children: React.ReactNode;
  className?: string;
}
