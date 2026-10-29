import * as React from "react";
import { Maximize2, Minimize2, RefreshCw } from "lucide-react";
import { V2Button } from "@/v2/shared/components/atoms/v2-button";
import { V2ToolbarIconButton } from "@/v2/shared/components/atoms/v2-toolbar-icon-button";
import { V2TableFilterButton } from "@/v2/shared/components/atoms/v2-table-filter-button";
import { V2ColumnToggle } from "@/v2/shared/components/molecules/v2-column-toggle";
import type { V2ColumnToggleProps } from "@/v2/shared/components/molecules/v2-column-toggle";
import { V2Dropdown } from "@/v2/shared/components/molecules/v2-dropdown";
import type { V2DropdownGroup } from "@/v2/shared/components/molecules/v2-dropdown";
import { V2SearchInput } from "@/v2/shared/components/molecules/v2-search-input";
import { V2SplitButton } from "@/v2/shared/components/molecules/v2-split-button";
import { V2TableSelectionChip } from "@/v2/shared/components/molecules/v2-table-selection-chip";
import { V2ViewModeCombobox } from "@/v2/shared/components/molecules/v2-view-mode-combobox";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import type { V2ViewPresetsApi } from "../hooks/V2StandardTable.views.hook";
import type { V2TableToolbarConfig } from "../V2StandardTable.type";
import { V2TableViewModes } from "./V2StandardTable.viewmodes";

export interface V2TableToolbarClusterProps {
  config: V2TableToolbarConfig;
  /** Có thì chế độ xem tùy chỉnh (tạo/sửa/xóa, lưu) do bảng quản lý; không có thì chỉ hiện config */
  viewPresets?: V2ViewPresetsApi;
  activeFilterCount: number;
  onClearAllFilters: () => void;
  selectedCount: number;
  onClearSelection: () => void;
  columnToggle?: V2ColumnToggleProps;
  loading?: boolean;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
  /** Có thì hiện ô tìm kiếm toàn cục ở đầu cụm */
  search?: { value: string; onChange: (text: string) => void };
}

const menuOf = (groups?: V2DropdownGroup[], align: "start" | "end" = "end") =>
  groups && groups.length > 0
    ? (trigger: React.ReactElement) => (
        <V2Dropdown groups={groups} trigger={trigger} align={align} />
      )
    : undefined;

export const V2TableToolbarCluster: React.FC<V2TableToolbarClusterProps> = ({
  config,
  viewPresets,
  activeFilterCount,
  onClearAllFilters,
  selectedCount,
  onClearSelection,
  columnToggle,
  loading,
  isFullscreen,
  onToggleFullscreen,
  search,
}) => {
  const { t } = useV2Translation();
  const { filterGroup, viewModes, create } = config;
  const fsLabel = isFullscreen
    ? t("v2.table.exitFullscreen", "Thoát toàn màn hình")
    : t("v2.table.fullscreen", "Toàn màn hình");
  const refreshLabel = t("v2.table.refresh", "Làm mới");

  return (
    <div className="flex flex-wrap items-center gap-2">
      {search && (
        <V2SearchInput
          value={search.value}
          onChange={search.onChange}
          placeholder={config.search?.placeholder}
        />
      )}
      {viewPresets
        ? (viewPresets.viewModes || viewPresets.filterGroup) && (
            <V2TableViewModes
              presets={viewPresets}
              columns={columnToggle?.columns ?? []}
            />
          )
        : (viewModes || filterGroup) && (
            <V2ViewModeCombobox
              items={viewModes?.items}
              activeKey={viewModes?.activeKey}
              onSelect={viewModes?.onSelect}
              filterGroup={filterGroup}
            />
          )}
      <V2TableSelectionChip
        count={selectedCount}
        onClear={onClearSelection}
        renderMenu={menuOf(config.bulkActions, "start")}
      />
      {columnToggle && <V2ColumnToggle {...columnToggle} />}
      {activeFilterCount > 0 && (
        <V2Button
          variant="destructive-outline"
          size="xs"
          onClick={onClearAllFilters}
        >
          {t("v2.table.clearAllFilters", { count: activeFilterCount })}
        </V2Button>
      )}
      {config.onFilterToggle && (
        <V2TableFilterButton
          activeCount={activeFilterCount}
          onClick={config.onFilterToggle}
        />
      )}
      {onToggleFullscreen && (
        <V2ToolbarIconButton
          label={fsLabel}
          icon={
            isFullscreen ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )
          }
          onClick={onToggleFullscreen}
        />
      )}
      {config.onRefresh && (
        <V2ToolbarIconButton
          label={refreshLabel}
          icon={
            <RefreshCw
              className={loading ? "h-4 w-4 animate-spin" : "h-4 w-4"}
            />
          }
          disabled={loading}
          onClick={config.onRefresh}
        />
      )}
      {create && (
        <V2SplitButton
          label={create.label}
          icon={create.icon}
          onClick={create.onClick}
          renderMenu={menuOf(create.actions)}
        />
      )}
    </div>
  );
};
