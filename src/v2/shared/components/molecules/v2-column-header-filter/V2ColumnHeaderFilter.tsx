import * as React from "react";
import { ArrowDownAZ, ArrowUpAZ, ListFilter } from "lucide-react";
import { V2Button } from "@/v2/shared/components/atoms/v2-button";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { Popover, PopoverContent, PopoverTrigger } from "@/v2/shared/ui";
import {
  ColumnValueType,
  TableColumnAlign,
  TableSortState,
} from "@/v2/shared/types/v2-table";
import { cn } from "@/v2/shared/utils/cn";
import { V2ColumnHeaderFilterPanel } from "./V2ColumnHeaderFilter.panel";
import type { V2ColumnHeaderFilterProps } from "./V2ColumnHeaderFilter.type";

const ALIGN_CLASS: Record<TableColumnAlign, string> = {
  [TableColumnAlign.LEFT]: "justify-start",
  [TableColumnAlign.CENTER]: "justify-center",
  [TableColumnAlign.RIGHT]: "justify-end",
};

const GLASS_STYLE: React.CSSProperties = {
  backdropFilter: "blur(24px) saturate(200%)",
  WebkitBackdropFilter: "blur(24px) saturate(200%)",
};

export const V2ColumnHeaderFilter: React.FC<V2ColumnHeaderFilterProps> = (
  props,
) => {
  const { t } = useV2Translation();
  const { label, sort, selected, search, operator, dateRange } = props;
  const [open, setOpen] = React.useState(false);
  const align = props.align ?? TableColumnAlign.LEFT;
  const isDate = props.valueType === ColumnValueType.DATE;
  const isFilterActive =
    selected.length > 0 ||
    search.trim() !== "" ||
    Boolean(operator) ||
    Boolean(dateRange?.from || dateRange?.to);
  const isSortActive = sort !== TableSortState.NONE;
  const hasActiveModifiers = isFilterActive || isSortActive;

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    props.onOpenChange?.(next);
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <V2Button
          variant="ghost"
          data-active={isFilterActive}
          aria-label={t("v2.table.filterColumn", { label })}
          className={cn(
            "group h-auto w-full min-w-0 gap-1 rounded-none p-0 text-[length:inherit] font-[inherit] uppercase tracking-[inherit] text-inherit hover:bg-transparent hover:text-foreground",
            ALIGN_CLASS[align],
            props.className,
          )}
        >
          <span className="truncate">{label}</span>
          <span
            className={cn(
              "relative flex h-5 min-w-[20px] items-center justify-center gap-0.5 rounded-md px-0.5 transition-colors",
              hasActiveModifiers
                ? "text-primary"
                : "text-muted-fg/30 opacity-0 group-hover:opacity-100",
              open && "bg-muted opacity-100",
            )}
          >
            {(!hasActiveModifiers || isFilterActive) && (
              <ListFilter className="h-3.5 w-3.5" />
            )}
            {isSortActive &&
              (sort === TableSortState.ASC ? (
                <ArrowDownAZ className="h-3.5 w-3.5" />
              ) : (
                <ArrowUpAZ className="h-3.5 w-3.5" />
              ))}
            {hasActiveModifiers && (
              <span className="absolute -right-1 -top-1 flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-primary" />
              </span>
            )}
          </span>
        </V2Button>
      </PopoverTrigger>
      <PopoverContent
        align={align === TableColumnAlign.RIGHT ? "end" : "start"}
        sideOffset={8}
        style={GLASS_STYLE}
        className={cn(
          "rounded-xl border-border/70 p-0",
          isDate ? "w-72" : "w-64",
        )}
      >
        <V2ColumnHeaderFilterPanel
          {...props}
          isActive={isFilterActive}
          onClose={() => handleOpenChange(false)}
        />
      </PopoverContent>
    </Popover>
  );
};
