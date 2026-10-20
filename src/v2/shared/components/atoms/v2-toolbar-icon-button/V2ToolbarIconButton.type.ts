import type * as React from "react";
import type { V2ButtonProps } from "@/v2/shared/components/atoms/v2-button";

export interface V2ToolbarIconButtonProps extends Omit<
  V2ButtonProps,
  "children" | "title" | "size" | "variant" | "leftIcon" | "rightIcon"
> {
  /** Dùng làm aria-label và tooltip (bắt buộc: nút chỉ có icon) */
  label: string;
  icon: React.ReactNode;
  /** Trạng thái đang bật (viền + màu primary) */
  active?: boolean;
  /** Số hiển thị ở góc nút; chỉ hiện khi > 0 */
  badge?: number;
}
