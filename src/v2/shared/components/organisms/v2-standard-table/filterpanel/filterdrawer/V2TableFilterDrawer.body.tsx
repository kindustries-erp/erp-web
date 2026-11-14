import * as React from "react";
import { Check } from "lucide-react";
import { V2Button } from "@/v2/shared/components/atoms/v2-button";
import { V2Text } from "@/v2/shared/components/atoms/v2-text";
import { V2FilterColumnSearch } from "@/v2/shared/components/molecules/v2-filter-column-search";
import { DrawerSection } from "@/v2/shared/components/molecules/v2-drawer-section";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { buildActiveFilterChips } from "../../utils/v2ActiveFilterChips";
import { V2TableFilterCards } from "../V2StandardTable.filtercards";
import { V2TableFilterChips } from "../V2StandardTable.filterchips";
import { groupFilterColumns } from "./V2TableFilterDrawer.groups";
import type { V2TableFilterDrawerProps } from "./V2TableFilterDrawer.type";
import type { V2FilterDrawerTab } from "./V2TableFilterDrawer.ui.hook";

export interface V2TableFilterDrawerBodyProps<
  T,
> extends V2TableFilterDrawerProps<T> {
  tab: V2FilterDrawerTab;
}

/** Nội dung chung của drawer lọc (desktop và mobile): tab Cột hoặc tab Bộ lọc đã lưu */
export function V2TableFilterDrawerBody<T>({
  tab,
  panel,
  columns,
  state,
  filters,
  extraContent,
  presets,
}: V2TableFilterDrawerBodyProps<T>) {
  const { t } = useV2Translation();
  const chips = React.useMemo(
    () => buildActiveFilterChips(state.query, columns, t),
    [state.query, columns, t],
  );
  const activeKeys = React.useMemo(
    () => new Set(chips.map((c) => c.columnKey)),
    [chips],
  );

  if (tab === "presets" && presets) {
    return (
      <div className="flex flex-col gap-2">
        {presets.presets.length === 0 ? (
          <V2Text as="p" variant="caption" className="py-6 text-center">
            {t("v2.table.filterPresetsEmpty")}
          </V2Text>
        ) : (
          <ul role="list" className="flex flex-col gap-1.5">
            {presets.presets.map((item) => {
              const active = item.key === presets.activeKey;
              return (
                <li key={item.key}>
                  <V2Button
                    type="button"
                    variant={active ? "secondary" : "ghost"}
                    aria-pressed={active}
                    onClick={() => presets.onSelect(item.key)}
                    className="h-11 w-full justify-start gap-2 px-3 text-sm"
                  >
                    <span className="flex-1 truncate text-left">
                      {item.label}
                    </span>
                    {active && <Check className="h-4 w-4 text-primary" />}
                  </V2Button>
                </li>
              );
            })}
          </ul>
        )}
        {presets.activeKey !== undefined && (
          <V2Button
            type="button"
            variant="ghost"
            onClick={presets.onClearActive}
            className="h-11 justify-start px-3 text-sm"
          >
            {t("v2.table.filterPresetClear")}
          </V2Button>
        )}
      </div>
    );
  }

  const groups = groupFilterColumns(panel.visibleColumns);
  return (
    <div className="flex flex-col gap-3">
      {extraContent}
      <V2FilterColumnSearch
        value={panel.colSearch}
        onChange={panel.setColSearch}
      />
      {chips.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <V2Text
            as="span"
            variant="caption"
            className="text-[10px] font-semibold uppercase tracking-wider"
          >
            {t("v2.table.activeFilters", { count: chips.length })}
          </V2Text>
          <V2TableFilterChips
            chips={chips}
            onReveal={panel.reveal}
            onRemove={state.clearColumn}
          />
        </div>
      )}
      <V2Text
        as="span"
        variant="caption"
        weight="semibold"
        className="uppercase tracking-wider"
      >
        {t("v2.table.filterByColumn", {
          count: panel.visibleColumns.length,
        })}
      </V2Text>
      {panel.visibleColumns.length === 0 ? (
        <V2Text as="p" variant="caption" className="py-6 text-center">
          {t("v2.table.noMatchingColumns")}
        </V2Text>
      ) : (
        groups.map((group) => (
          <DrawerSection
            key={group.key}
            title={t(group.labelKey)}
            count={group.columns.length}
            collapsible
            defaultCollapsed={false}
            bodyClassName="flex flex-col gap-1.5"
          >
            <V2TableFilterCards
              columns={group.columns}
              state={state}
              filters={filters}
              activeKeys={activeKeys}
              expandedKey={panel.expandedKey}
              onExpandedChange={panel.setExpanded}
            />
          </DrawerSection>
        ))
      )}
    </div>
  );
}
