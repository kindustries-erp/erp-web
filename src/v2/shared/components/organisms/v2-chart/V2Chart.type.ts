import type { V2ChartSeries } from "@/v2/shared/components/molecules/v2-chart-frame";

export type { V2ChartSeries };

interface V2ChartBaseProps {
  /** Nhãn trục hạng mục (tháng, đối tác...) */
  labels: string[];
  /** Hiển thị và đọc giá trị, ví dụ `1.2M ₫`. Mặc định là số có dấu phân cách nghìn */
  formatValue?: (value: number) => string;
  /** Mô tả biểu đồ cho trình đọc màn hình; cũng là tên của bảng ở chế độ xem dạng bảng */
  ariaLabel: string;
  loading?: boolean;
  height?: number;
  className?: string;
}

export interface V2BarChartProps extends V2ChartBaseProps {
  /** Tối đa 5 chuỗi, chuỗi dư được gộp vào "Khác" */
  series: V2ChartSeries[];
  stacked?: boolean;
  horizontal?: boolean;
}

export interface V2LineChartProps extends V2ChartBaseProps {
  series: V2ChartSeries[];
  /** Tô nhẹ vùng dưới đường */
  area?: boolean;
}

export interface V2DonutChartProps extends V2ChartBaseProps {
  /** Giá trị của từng mảng, cùng thứ tự với `labels` (tối đa 5, phần dư gộp vào "Khác") */
  values: number[];
}
