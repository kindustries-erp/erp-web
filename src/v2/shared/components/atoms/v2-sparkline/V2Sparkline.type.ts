export interface V2SparklineProps {
  /** Từ 2 điểm trở lên. Ít hơn thì không vẽ gì */
  values: number[];
  /** Màu đường và chấm cuối; mặc định theo màu chữ phụ */
  color?: string;
  width?: number;
  height?: number;
  /** Mô tả xu hướng cho trình đọc màn hình */
  ariaLabel: string;
  className?: string;
}
