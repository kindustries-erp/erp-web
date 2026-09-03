import React from "react";
import {
  Search,
  ListFilter,
  Calendar,
  ArrowDownAZ,
  SlidersHorizontal,
  X,
  Hash,
} from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";
import { Tooltip } from "@/core/components/ui/Tooltip";
import { FilterChipCategory } from "@/shared/components/DataTable/types";
import type { ActiveFilterChipItem } from "@/shared/hooks/useUnifiedTableFilter";
import { cn } from "@/shared/utils";

interface ActiveFilterChipsProps {
  chips: ActiveFilterChipItem[];
  onRemoveChip: (id: string) => void;
  onChipClick?: (columnKey: string) => void;
  className?: string;
}

export function ActiveFilterChips({
  chips,
  onRemoveChip,
  onChipClick,
  className,
}: ActiveFilterChipsProps) {
  if (!chips || chips.length === 0) return null;

  const getCategoryIcon = (category: FilterChipCategory) => {
    switch (category) {
      case FilterChipCategory.TEXT:
        return <Search className="h-3 w-3 text-muted-foreground shrink-0" />;
      case FilterChipCategory.MULTI_SELECT:
        return (
          <ListFilter className="h-3 w-3 text-muted-foreground shrink-0" />
        );
      case FilterChipCategory.NUMERIC:
        return <Hash className="h-3 w-3 text-muted-foreground shrink-0" />;
      case FilterChipCategory.DATE:
        return <Calendar className="h-3 w-3 text-muted-foreground shrink-0" />;
      case FilterChipCategory.SORT:
        return (
          <ArrowDownAZ className="h-3 w-3 text-muted-foreground shrink-0" />
        );
      case FilterChipCategory.CUSTOM:
      default:
        return (
          <SlidersHorizontal className="h-3 w-3 text-muted-foreground shrink-0" />
        );
    }
  };

  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Đang lọc ({chips.length})
        </span>
      </div>
      <div className="flex flex-wrap gap-1 max-h-32 overflow-y-auto pr-1">
        {chips.map((chip) => (
          <Badge
            key={chip.id}
            variant="secondary"
            className="group/chip h-auto py-0.5 pl-2 pr-1 gap-1 text-[11px] font-normal border border-primary/20 bg-primary/8 hover:bg-primary/12 text-primary transition-all rounded-lg max-w-full"
          >
            <div
              className="flex items-center gap-1 min-w-0 cursor-pointer"
              onClick={() => onChipClick?.(chip.columnKey)}
              title="Click để đến bộ lọc cột này"
            >
              {getCategoryIcon(chip.category)}
              <span className="font-semibold text-foreground truncate max-w-[85px]">
                {chip.label}:
              </span>
              <span className="text-primary-foreground/80 dark:text-primary-foreground/90 font-medium truncate max-w-[105px]">
                {chip.valueDisplay}
              </span>
            </div>
            <Tooltip content="Xóa bộ lọc này">
              <button
                type="button"
                className="h-3.5 w-3.5 rounded-full flex items-center justify-center text-muted-foreground/70 hover:text-red-600 hover:bg-red-100 dark:hover:bg-red-950/60 transition-colors ml-0.5"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveChip(chip.id);
                }}
              >
                <X className="h-2.5 w-2.5" />
              </button>
            </Tooltip>
          </Badge>
        ))}
      </div>
    </div>
  );
}
