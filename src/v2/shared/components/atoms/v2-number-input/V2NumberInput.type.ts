import type * as React from "react";

export interface V2NumberInputProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "value" | "defaultValue" | "onChange" | "type" | "min" | "max"
> {
  /** `null` là ô trống */
  value: number | null;
  onValueChange: (value: number | null) => void;
  /** Số chữ số thập phân tối đa (mặc định 0 = số nguyên) */
  decimals?: number;
  min?: number;
  max?: number;
  allowNegative?: boolean;
  /** Locale dùng để hiển thị dấu phân cách nghìn khi không gõ (mặc định `vi-VN`) */
  locale?: string;
}
