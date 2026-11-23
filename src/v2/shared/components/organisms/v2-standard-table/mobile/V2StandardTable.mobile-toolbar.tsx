import * as React from "react";
import { createPortal } from "react-dom";
import {
  V2Badge,
  V2BadgeSize,
  V2BadgeVariant,
  V2Button,
  V2Icon,
  V2Text,
} from "@/v2/shared/components/atoms";
import {
  RefreshCw,
  Search,
  SlidersHorizontal,
} from "@/v2/shared/components/atoms/v2-icon/icons";
import { V2ToolbarIconButton } from "@/v2/shared/components/atoms/v2-toolbar-icon-button";
import { V2Dropdown } from "@/v2/shared/components/molecules/v2-dropdown";
import type { V2DropdownGroup } from "@/v2/shared/components/molecules/v2-dropdown";
import { V2SplitButton } from "@/v2/shared/components/molecules/v2-split-button";
import { V2TableFilterChip } from "@/v2/shared/components/molecules/v2-table-filter-chip";
import { V2TableSelectionChip } from "@/v2/shared/components/molecules/v2-table-selection-chip";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import type { V2TableToolbarConfig } from "../V2StandardTable.type";

export interface V2StandardTableMobileToolbarProps {
  config?: V2TableToolbarConfig;
  activeFilterCount: number;
  onClearAllFilters: () => void;
  selectedCount: number;
  onClearSelection: () => void;
  toolbarExtra?: React.ReactNode;
  portalTarget?: HTMLElement | null;
  loading?: boolean;
  search?: { value: string; onChange: (text: string) => void };
  onOpenSheet: () => void;
}

const menuOf = (groups?: V2DropdownGroup[], align: "start" | "end" = "end") =>
  groups && groups.length > 0
    ? (trigger: React.ReactElement) => (
        <V2Dropdown groups={groups} trigger={trigger} align={align} />
      )
    : undefined;

export const V2StandardTableMobileToolbar: React.FC<
  V2StandardTableMobileToolbarProps
> = ({
  config,
  activeFilterCount,
  onClearAllFilters,
  selectedCount,
  onClearSelection,
  toolbarExtra,
  portalTarget,
  loading,
  search,
  onOpenSheet,
}) => {
  const { t } = useV2Translation();
  const filterGroup = config?.filterGroup;
  const activeGroup = filterGroup?.items.find(
    (item) => item.key === filterGroup.activeKey,
  );
  const isDefaultGroup =
    !filterGroup || filterGroup.activeKey === (filterGroup.allKey ?? "all");
  const hasSearchOrFilterTrigger = Boolean(
    config?.search || config?.filterGroup || config?.onFilterToggle,
  );
  const activeText =
    search?.value.trim() || (!isDefaultGroup ? activeGroup?.label : undefined);
  const triggerText =
    activeText ?? t("v2.table.searchAndFilter", "Tìm kiếm & Bộ lọc");

  const cluster = (
    <div className="flex min-w-0 flex-1 items-center gap-1.5">
      {hasSearchOrFilterTrigger && (
        <V2Button
          type="button"
          variant="outline"
          data-testid="v2-table-mobile-search-filter-btn"
          onClick={onOpenSheet}
          className="h-10 min-w-0 flex-1 justify-between gap-2 rounded-xl border-border/70 bg-card px-3 shadow-xs hover:bg-surface/80"
        >
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <V2Icon
              icon={Search}
              size={15}
              className="shrink-0 text-muted-fg"
            />
            <V2Text
              as="span"
              variant="caption"
              truncate
              color={activeText ? "default" : "muted"}
            >
              {triggerText}
            </V2Text>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            {activeFilterCount > 0 && (
              <V2Badge
                variant={V2BadgeVariant.SECONDARY}
                size={V2BadgeSize.XS}
                className="rounded-full px-1.5 font-mono text-[10px]"
              >
                {activeFilterCount}
              </V2Badge>
            )}
            <V2Icon
              icon={SlidersHorizontal}
              size={14}
              className="text-muted-fg"
            />
          </div>
        </V2Button>
      )}
      {selectedCount > 0 &&
        (config ? (
          <V2TableSelectionChip
            count={selectedCount}
            onClear={onClearSelection}
            renderMenu={menuOf(config.bulkActions, "start")}
          />
        ) : (
          <V2Text as="span" variant="body-sm" color="muted">
            {t("v2.table.selectedCount", { count: selectedCount })}
          </V2Text>
        ))}
      {activeFilterCount > 0 && (
        <V2TableFilterChip
          count={activeFilterCount}
          onClear={onClearAllFilters}
          onToggleFilter={onOpenSheet}
        />
      )}
      {config?.onRefresh && (
        <V2ToolbarIconButton
          label={t("v2.table.refresh", "Làm mới")}
          icon={
            <V2Icon
              icon={RefreshCw}
              size={16}
              className={loading ? "animate-spin" : undefined}
            />
          }
          disabled={loading}
          onClick={config.onRefresh}
        />
      )}
      {config?.create && (
        <V2SplitButton
          label={config.create.label}
          icon={config.create.icon}
          onClick={config.create.onClick}
          renderMenu={menuOf(config.create.actions)}
        />
      )}
    </div>
  );

  if (portalTarget) {
    return (
      <>
        {createPortal(cluster, portalTarget)}
        {toolbarExtra && (
          <div className="flex min-h-8 items-center gap-2">{toolbarExtra}</div>
        )}
      </>
    );
  }

  return (
    <div className="flex min-h-10 flex-wrap items-center justify-between gap-2">
      {cluster}
      {toolbarExtra && (
        <div className="flex items-center gap-2">{toolbarExtra}</div>
      )}
    </div>
  );
};
