import * as React from "react";
import { cn } from "@/v2/shared/utils/cn";
import { V2Text } from "@/v2/shared/components/atoms";
import type { V2StatusChipTone } from "./V2TabBar.type";
import { DOT_CLASS, numberFormatter } from "./TabBarChip.constants";

export interface TabBarChipHeaderProps {
  label: React.ReactNode;
  tone: V2StatusChipTone;
  pct: number;
  total: number;
  isActive: boolean;
  badgeCount?: number;
}

/** Hàng tiêu đề của chip trạng thái: Chấm màu + Nhãn (Count) bên trái; Tỷ trọng % bên phải */
export const TabBarChipHeader: React.FC<TabBarChipHeaderProps> = ({
  label,
  tone,
  pct,
  total,
  isActive,
  badgeCount,
}) => (
  <span className="flex items-center justify-between gap-2">
    <span className="flex items-center gap-1.5 min-w-0">
      <span
        aria-hidden="true"
        data-tone={tone}
        className={cn("h-1.5 w-1.5 shrink-0 rounded-full", DOT_CLASS[tone])}
      />
      <V2Text
        as="span"
        variant="tab-pill"
        color="inherit"
        className={cn(
          "text-xs leading-none truncate",
          isActive
            ? "font-semibold text-foreground"
            : "font-medium text-muted-fg group-hover:text-foreground",
        )}
      >
        {label}
        {badgeCount !== undefined && (
          <span className="font-mono text-[11px] font-normal text-muted-fg/80 ml-1">
            {`(${numberFormatter.format(badgeCount)})`}
          </span>
        )}
      </V2Text>
    </span>
    {total > 0 && (
      <V2Text
        as="span"
        variant="tab-pill"
        color="inherit"
        className="font-mono text-[11px] leading-none text-muted-fg/80 tabular-nums shrink-0"
      >
        {`${pct}%`}
      </V2Text>
    )}
  </span>
);

TabBarChipHeader.displayName = "TabBarChipHeader";
