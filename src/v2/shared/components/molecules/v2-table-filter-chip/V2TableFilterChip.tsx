import * as React from "react";
import { Filter, X } from "lucide-react";
import { V2Button } from "@/v2/shared/components/atoms/v2-button";
import { AppTooltip } from "@/v2/shared/components/atoms/v2-tooltip";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { cn } from "@/v2/shared/utils/cn";
import type { V2TableFilterChipProps } from "./V2TableFilterChip.type";

export const V2TableFilterChip: React.FC<V2TableFilterChipProps> = ({
  count,
  onClear,
  onToggleFilter,
  showLabel = false,
  className,
}) => {
  const { t } = useV2Translation();
  if (count <= 0) return null;

  const filterLabel = t("v2.table.filter", "Bộ lọc");
  const clearLabel = t("v2.table.clearAllFilters", { count });
  const triggerLabel = t("v2.table.filterCount", {
    count,
    defaultValue: `${filterLabel} (${count})`,
  });

  const infoTrigger = (
    <V2Button
      type="button"
      variant="ghost"
      size="sm"
      aria-label={triggerLabel}
      onClick={onToggleFilter}
      className={cn(
        "h-full gap-1.5 rounded-none px-2.5 text-foreground transition-colors",
        onToggleFilter
          ? "cursor-pointer hover:bg-surface-hover hover:text-primary"
          : "cursor-default hover:bg-transparent",
      )}
    >
      <Filter className="h-3.5 w-3.5 shrink-0 text-primary" />
      {showLabel && (
        <span className="text-xs font-medium leading-none">{filterLabel}</span>
      )}
      <span className="text-[11px] font-bold leading-none text-primary">
        ({count})
      </span>
    </V2Button>
  );

  return (
    <div
      className={cn(
        "inline-flex h-8 shrink-0 items-stretch overflow-hidden rounded-lg border border-border bg-surface shadow-xs transition-colors hover:border-primary/40",
        className,
      )}
    >
      <AppTooltip content={triggerLabel} disabled={!onToggleFilter}>
        {infoTrigger}
      </AppTooltip>
      <span className="w-px self-stretch bg-border/60" aria-hidden />
      <AppTooltip content={clearLabel}>
        <V2Button
          type="button"
          variant="ghost"
          size="sm"
          aria-label={clearLabel}
          onClick={onClear}
          className="h-full cursor-pointer rounded-none px-2 text-muted-fg transition-colors hover:bg-destructive/10 hover:text-destructive"
        >
          <X className="h-3.5 w-3.5" />
        </V2Button>
      </AppTooltip>
    </div>
  );
};
