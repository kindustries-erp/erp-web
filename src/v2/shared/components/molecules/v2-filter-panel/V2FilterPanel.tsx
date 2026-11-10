import * as React from "react";
import { Filter, RotateCcw, X } from "lucide-react";
import { V2Button } from "@/v2/shared/components/atoms/v2-button";
import { V2Text } from "@/v2/shared/components/atoms/v2-text";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { cn } from "@/v2/shared/utils/cn";
import { V2FilterColumnSearch } from "./V2FilterPanel.search";
import type { V2FilterPanelProps } from "./V2FilterPanel.type";

export const V2FilterPanel: React.FC<V2FilterPanelProps> = ({
  activeCount,
  onResetAll,
  onClose,
  search,
  onSearchChange,
  columnCount,
  chips,
  extraContent,
  children,
  className,
}) => {
  const { t } = useV2Translation();
  const resetLabel = t("v2.table.resetAllFilters", "Xóa tất cả bộ lọc");
  return (
    <aside
      aria-label={t("v2.table.filterPanelTitle", "Bộ lọc")}
      className={cn(
        "flex h-full min-h-0 w-80 shrink-0 flex-col gap-3 rounded-xl border border-border/60 bg-surface p-3",
        className,
      )}
    >
      <header className="flex shrink-0 items-center justify-between border-b border-border/50 pb-2.5">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Filter className="h-3.5 w-3.5" />
          </span>
          <V2Text
            as="span"
            variant="label"
            weight="bold"
            className="text-foreground"
          >
            {t("v2.table.filterPanelTitle", "Bộ lọc")}
          </V2Text>
          {activeCount > 0 && (
            <V2Text
              as="span"
              variant="caption"
              weight="semibold"
              className="text-primary"
            >
              ({activeCount})
            </V2Text>
          )}
        </div>
        <div className="flex items-center gap-0.5">
          {activeCount > 0 && (
            <V2Button
              type="button"
              variant="ghost"
              size="icon-xs"
              aria-label={resetLabel}
              title={resetLabel}
              onClick={onResetAll}
              className="text-muted-fg hover:text-destructive"
            >
              <RotateCcw className="h-3 w-3" />
            </V2Button>
          )}
          <V2Button
            type="button"
            variant="ghost"
            size="icon-xs"
            aria-label={t("v2.table.closePanel", "Đóng bộ lọc")}
            onClick={onClose}
          >
            <X className="h-3.5 w-3.5" />
          </V2Button>
        </div>
      </header>
      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto pr-0.5">
        {extraContent}
        <V2FilterColumnSearch value={search} onChange={onSearchChange} />
        {chips && <div className="flex flex-col gap-1.5">{chips}</div>}
        <div className="flex flex-col gap-1.5">
          <V2Text
            as="span"
            variant="caption"
            weight="semibold"
            className="uppercase tracking-wider"
          >
            {t("v2.table.filterByColumn", { count: columnCount })}
          </V2Text>
          {columnCount === 0 ? (
            <V2Text as="p" variant="caption" className="py-6 text-center">
              {t("v2.table.noMatchingColumns", "Không có cột phù hợp")}
            </V2Text>
          ) : (
            children
          )}
        </div>
      </div>
    </aside>
  );
};
