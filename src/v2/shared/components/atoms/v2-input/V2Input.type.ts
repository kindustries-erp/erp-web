import type * as React from "react";

export type V2InputSize = "xs" | "sm" | "md" | "lg";
export type V2InputVariant = "default" | "search" | "ghost";

export interface V2InputProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "size"
> {
  /** Variant hiển thị: default (có viền), search (trong suốt, không viền hộp), ghost */
  variant?: V2InputVariant;
  /** Kích thước ô nhập: xs (h-7), sm (h-8), md (h-9), lg (h-10) */
  sizeVariant?: V2InputSize;
  /** Alias cho sizeVariant tương thích V1/V2 */
  size?: V2InputSize;
  /** Icon hoặc node hiển thị ở đầu ô nhập */
  leftIcon?: React.ReactNode;
  /** Icon hoặc node hiển thị ở cuối ô nhập */
  rightIcon?: React.ReactNode;
  /** Hiển thị nút xóa nội dung nhanh khi có giá trị */
  clearable?: boolean;
  /** Callback khi bấm nút xóa nhanh */
  onClear?: () => void;
  /** Trạng thái lỗi hoặc thông báo lỗi (border màu đỏ/destructive) */
  error?: boolean | string;
  /** ClassName bổ sung cho container bọc ngoài */
  containerClassName?: string;
  /** ClassName bổ sung cho phần tử input bên trong */
  inputClassName?: string;
}
