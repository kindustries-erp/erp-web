import React from "react";
import { formatGMT7 } from "@/shared/utils/format";
import { Tooltip } from "@/core/components/ui/Tooltip";

export interface TableDateCellProps {
  /** The date to display (ISO string or similar) */
  date?: string | null;
  /** Format to display, defaults to "datetime-sec" for tooltip and "datetime" for splitting */
  format?: "datetime" | "date" | "datetime-sec";
  /** Custom class for the container */
  className?: string;
  /** If true, wraps the cell in a tooltip with the full date and time */
  showTooltip?: boolean;
}

export function TableDateCell({
  date,
  format = "datetime",
  className,
  showTooltip = true,
}: TableDateCellProps) {
  if (!date) return <span className="text-muted-foreground">—</span>;

  // Render format
  const dateTimeStr = formatGMT7(date, format === "date" ? "date" : "datetime");
  const tooltipStr = formatGMT7(date, "datetime-sec");

  const [datePart = "", timePart = ""] = dateTimeStr.split(" ");

  const content = (
    <div
      className={`inline-flex flex-row items-baseline gap-1.5 whitespace-nowrap leading-tight ${
        showTooltip ? "cursor-help" : ""
      } ${className || ""}`}
    >
      <span className="text-sm text-foreground">{datePart}</span>
      {timePart && (
        <span className="text-[11px] text-muted-foreground font-normal">
          {timePart}
        </span>
      )}
    </div>
  );

  if (showTooltip) {
    return (
      <Tooltip content={tooltipStr} side="top">
        {content}
      </Tooltip>
    );
  }

  return content;
}
