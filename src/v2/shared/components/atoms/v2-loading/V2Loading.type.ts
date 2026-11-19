import type * as React from "react";
import type { V2Size } from "@/v2/shared/types/v2-size";

/**
 * V2LoadingVariant — Các biến thể animation loading trong ERP.
 * Chuẩn hóa enum theo /erp-ui-structure Phần D.
 */
export enum V2LoadingVariant {
  SUPERCAR_ROAD = "supercar-road",
  TAIL_SPIN = "tail-spin",
  THREE_DOTS = "three-dots",
  PULSE_BARS = "pulse-bars",
  RINGS = "rings",
  ORBIT = "orbit",
  GRID = "grid",
}

export type V2LoadingVariantType = V2LoadingVariant | `${V2LoadingVariant}`;

/**
 * V2LoadingSize — Kích thước của loading indicator.
 */
export enum V2LoadingSize {
  XS = "xs",
  SM = "sm",
  MD = "md",
  LG = "lg",
  XL = "xl",
}

export type V2LoadingSizeType =
  | V2LoadingSize
  | `${V2LoadingSize}`
  | V2Size
  | `${V2Size}`;

/**
 * V2LoadingTextPosition — Vị trí nhãn text.
 */
export enum V2LoadingTextPosition {
  BOTTOM = "bottom",
  RIGHT = "right",
}

export type V2LoadingTextPositionType =
  | V2LoadingTextPosition
  | `${V2LoadingTextPosition}`;

/**
 * Bản đồ nhãn tên biến thể loading (chuẩn /erp-ui-structure Phần D).
 */
export const V2_LOADING_VARIANT_LABELS: Record<V2LoadingVariant, string> = {
  [V2LoadingVariant.SUPERCAR_ROAD]: "Siêu xe thể thao",
  [V2LoadingVariant.TAIL_SPIN]: "Vòng xoay mượt",
  [V2LoadingVariant.THREE_DOTS]: "Ba chấm nhảy",
  [V2LoadingVariant.PULSE_BARS]: "Thanh sóng âm",
  [V2LoadingVariant.RINGS]: "Vòng sóng lan tỏa",
  [V2LoadingVariant.ORBIT]: "Quỹ đạo vệ tinh",
  [V2LoadingVariant.GRID]: "Ma trận công nghệ",
};

export interface IndicatorProps extends React.SVGProps<SVGSVGElement> {
  size?: V2LoadingSizeType;
  color?: string;
  className?: string;
}

export interface V2LoadingProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Biến thể animation loading.
   * @default V2LoadingVariant.SUPERCAR_ROAD
   */
  variant?: V2LoadingVariantType;

  /**
   * Kích thước của loading indicator.
   * @default V2LoadingSize.MD
   */
  size?: V2LoadingSizeType;

  /**
   * Tùy chỉnh màu sắc trực tiếp (hex / rgb). Nếu bỏ trống sẽ kế thừa từ CSS class `text-primary` hoặc `currentColor`.
   */
  color?: string;

  /**
   * Nhãn text hiển thị kèm loading indicator (VD: "Đang tải trang...").
   */
  text?: React.ReactNode;

  /**
   * Vị trí hiển thị của nhãn text so với indicator.
   * @default V2LoadingTextPosition.BOTTOM
   */
  textPosition?: V2LoadingTextPositionType;

  /**
   * Hiển thị căn giữa toàn khung màn hình hoặc container cha (h-full w-full).
   * @default false
   */
  fullscreen?: boolean;

  /**
   * Thuộc tính trợ năng accessibility aria-label.
   * @default "Đang tải"
   */
  "aria-label"?: string;
}
