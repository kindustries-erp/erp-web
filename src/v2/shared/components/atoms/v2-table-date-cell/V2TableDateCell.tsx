import * as React from "react";
import { cn } from "@/v2/shared/utils/cn";
import { formatDateTimeParts } from "./v2TableDate";

export interface V2TableDateCellProps {
  date: string | number | Date | null | undefined;
  className?: string;
}

export const V2TableDateCell = React.memo(function V2TableDateCell({
  date,
  className,
}: V2TableDateCellProps) {
  const parts = formatDateTimeParts(date);

  if (!parts) {
    return (
      <span className={cn("w-full text-right text-muted-fg", className)}>
        —
      </span>
    );
  }

  return (
    <div
      className={cn(
        "flex w-full flex-col items-end text-right leading-tight tabular-nums",
        className,
      )}
    >
      <span className="text-xs text-foreground">{parts.date}</span>
      {parts.time && (
        <span className="text-[10px] text-muted-fg">{parts.time}</span>
      )}
    </div>
  );
});
