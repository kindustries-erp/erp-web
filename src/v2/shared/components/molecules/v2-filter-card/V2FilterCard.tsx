import * as React from "react";
import { Calendar, ChevronDown, Hash, ListFilter } from "lucide-react";
import { V2Button } from "@/v2/shared/components/atoms/v2-button";
import { ColumnValueType } from "@/v2/shared/types/v2-table";
import { cn } from "@/v2/shared/utils/cn";
import type { V2FilterCardProps } from "./V2FilterCard.type";

const TYPE_ICON: Partial<Record<ColumnValueType, React.ElementType>> = {
  [ColumnValueType.DATE]: Calendar,
  [ColumnValueType.NUMBER]: Hash,
};

export const V2FilterCard: React.FC<V2FilterCardProps> = ({
  columnKey,
  title,
  valueType,
  active = false,
  open,
  onOpenChange,
  children,
  className,
}) => {
  const Icon = TYPE_ICON[valueType] ?? ListFilter;
  const bodyId = `filter-card-body-${columnKey}`;
  return (
    <div
      id={`filter-card-${columnKey}`}
      data-active={active ? "true" : "false"}
      className={cn(
        "overflow-hidden rounded-lg border bg-surface",
        active ? "border-primary/40" : "border-border/60",
        className,
      )}
    >
      <V2Button
        type="button"
        variant="ghost"
        aria-expanded={open}
        aria-controls={bodyId}
        onClick={() => onOpenChange(!open)}
        className="h-9 w-full justify-start gap-2 rounded-none px-2.5 text-xs font-medium"
      >
        <Icon className="h-3.5 w-3.5 shrink-0 text-muted-fg" />
        <span className="flex-1 truncate text-left">{title}</span>
        {active && (
          <span
            data-testid="filter-card-dot"
            className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary"
          />
        )}
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 shrink-0 text-muted-fg transition-transform",
            open && "rotate-180",
          )}
        />
      </V2Button>
      {open && (
        <div id={bodyId} className="border-t border-border/60">
          {children}
        </div>
      )}
    </div>
  );
};
