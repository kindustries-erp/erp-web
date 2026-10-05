import React from "react";
import { format, isValid, parseISO } from "date-fns";
import { Tooltip } from "@/core/components/ui/Tooltip";

export function toDisplayDate(iso?: string): string {
  if (!iso) return "-";
  const date = parseISO(iso);
  if (!isValid(date)) return "-";
  return format(date, "dd/MM/yyyy HH:mm");
}

export function toDisplayRange(dateFrom?: string, dateTo?: string): string {
  if (!dateFrom && !dateTo) return "-";
  const from = dateFrom ? toDisplayDate(dateFrom).slice(0, 10) : "-";
  const to = dateTo ? toDisplayDate(dateTo).slice(0, 10) : "-";
  return `${from} - ${to}`;
}

export function renderOverflowText(
  text: string,
  className?: string,
): React.ReactNode {
  const value = text?.trim() || "-";
  const showTooltip = value.length > 36;

  return (
    <Tooltip content={value} disabled={!showTooltip}>
      <div
        className={`truncate ${className || ""}`}
        title={showTooltip ? undefined : value}
      >
        {value}
      </div>
    </Tooltip>
  );
}
