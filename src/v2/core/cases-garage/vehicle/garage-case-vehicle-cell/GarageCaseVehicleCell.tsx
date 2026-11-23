import React from "react";
import { cn } from "@/shared/utils";

export interface GarageCaseVehicleCellProps {
  value: string | null | undefined;
  mono?: boolean;
  className?: string;
}

/** Ô một dòng text, rỗng hiện "—". */
export function GarageCaseVehicleCell({
  value,
  mono = false,
  className,
}: GarageCaseVehicleCellProps) {
  if (!value) {
    return <span className="text-muted-foreground/50 select-none">—</span>;
  }
  return (
    <span
      title={value}
      className={cn(
        "block truncate text-xs text-slate-800 dark:text-slate-200 select-text",
        mono && "font-mono",
        className,
      )}
    >
      {value}
    </span>
  );
}
