import * as React from "react";
import { cn } from "@/v2/shared/utils/cn";
import type { V2StatusChipTone } from "./V2TabBar.type";
import { PROGRESS_BAR_CLASS } from "./TabBarChip.constants";

export interface TabBarChipProgressProps {
  pct: number;
  tone: V2StatusChipTone;
  hide?: boolean;
  label?: React.ReactNode;
}

/** Thanh hairline progress bar 2px của tab trạng thái, thể hiện đúng tỷ lệ % theo tone */
export const TabBarChipProgress: React.FC<TabBarChipProgressProps> = ({
  pct,
  tone,
  hide = false,
  label,
}) => {
  if (hide) return null;
  return (
    <span
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={typeof label === "string" ? label : undefined}
      className="block h-0.5 w-full overflow-hidden rounded-full bg-border/40"
    >
      <span
        className={cn(
          "block h-full transition-all duration-300",
          PROGRESS_BAR_CLASS[tone],
        )}
        style={{ width: `${pct}%` }}
      />
    </span>
  );
};

TabBarChipProgress.displayName = "TabBarChipProgress";
