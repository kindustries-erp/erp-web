import * as React from "react";
import { V2Text } from "@/v2/shared/components/atoms/v2-text";

export interface V2ViewModeSectionHeaderProps {
  title: string;
  /** Nút hành động căn phải cùng hàng tiêu đề (ví dụ "Tạo mới") */
  action?: React.ReactNode;
}

/** Tiêu đề nhóm trong popover; nút hành động nằm cùng hàng, căn phải */
export const V2ViewModeSectionHeader: React.FC<
  V2ViewModeSectionHeaderProps
> = ({ title, action }) => (
  <div className="flex items-center justify-between gap-2 px-2 pt-1 pb-0.5">
    <V2Text
      variant="caption"
      weight="semibold"
      truncate
      className="min-w-0 uppercase tracking-[0.05em]"
    >
      {title}
    </V2Text>
    {action}
  </div>
);
