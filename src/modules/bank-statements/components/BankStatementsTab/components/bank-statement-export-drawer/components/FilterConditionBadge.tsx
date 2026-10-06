import React from "react";
import { Tooltip } from "@/core/components/ui/Tooltip";

export interface FilterConditionBadgeProps {
  label: string;
  value: string;
  className?: string;
}

export function FilterConditionBadge({
  label,
  value,
  className = "",
}: FilterConditionBadgeProps) {
  const displayValue = value?.trim() || "-";
  const showTooltip = displayValue.length > 28;

  return (
    <div
      data-testid="filter-condition-badge"
      className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md border border-border/80 bg-background text-foreground text-[11px] leading-tight max-w-full ${className}`}
    >
      <span className="text-muted-foreground font-medium shrink-0">
        {label}:
      </span>
      <Tooltip content={displayValue} disabled={!showTooltip}>
        <span
          className="font-medium truncate max-w-[200px]"
          title={showTooltip ? undefined : displayValue}
        >
          {displayValue}
        </span>
      </Tooltip>
    </div>
  );
}
