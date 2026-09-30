import React from "react";
import { cn } from "@/shared/utils";

export function NeutralCountBadge({
  count,
  className,
}: {
  count: number | string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center min-w-[20px] px-1.5 py-0.5 rounded text-[11px] font-mono font-medium text-foreground bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 shadow-2xs",
        className,
      )}
    >
      {count}
    </span>
  );
}
