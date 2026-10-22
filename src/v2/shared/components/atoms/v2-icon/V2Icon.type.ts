import type * as React from "react";
import type { LucideIcon } from "./icons";

export interface V2IconProps extends Omit<
  React.SVGAttributes<SVGSVGElement>,
  "color"
> {
  /**
   * Component Icon (thường là LucideIcon được export từ V2 atoms)
   */
  icon?: LucideIcon | React.ComponentType<any>;
  /**
   * Kích thước icon (mặc định: 16px)
   */
  size?: number | string;
  /**
   * Độ dày nét vẽ stroke (mặc định: 2)
   */
  strokeWidth?: number | string;
  /**
   * Màu vẽ (mặc định: currentColor)
   */
  color?: string;
  /**
   * Aria label cho icon hỗ trợ accessibility
   */
  "aria-label"?: string;
  /**
   * Ẩn đối với screen reader (mặc định: true nếu không có aria-label)
   */
  "aria-hidden"?: boolean | "true" | "false";
}
