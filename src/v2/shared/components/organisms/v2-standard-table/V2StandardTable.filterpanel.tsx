import * as React from "react";
import { V2FilterChip } from "@/v2/shared/components/atoms/v2-filter-chip";
import { V2ColumnHeaderFilterPanel } from "@/v2/shared/components/molecules/v2-column-header-filter/V2ColumnHeaderFilter.panel";
import { V2FilterCard } from "@/v2/shared/components/molecules/v2-filter-card";
import { V2FilterPanel } from "@/v2/shared/components/molecules/v2-filter-panel";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { buildActiveFilterChips } from "./v2ActiveFilterChips";
import type { V2HeaderFilters } from "./V2StandardTable.filter.hook";
import type { V2FilterPanelController } from "./V2StandardTable.filterpanel.hook";
import type { V2TableState } from "./V2StandardTable.state.hook";
import type { V2Column } from "./V2StandardTable.type";

interface V2TableFilterPanelProps<T> {
  panel: V2FilterPanelController<T>;
  columns: V2Column<T>[];
  state: V2TableState;
  filters: V2HeaderFilters;
  extraContent?: React.ReactNode;
}

export function V2TableFilterPanel<T>({
  panel,
  columns,
  state,
  filters,
  extraContent,
}: V2TableFilterPanelProps<T>) {
  const { t } = useV2Translation();
  const { query } = state;
  const chips = React.useMemo(
    () => buildActiveFilterChips(query, columns, t),
    [query, columns, t],
  );
  const activeKeys = new Set(chips.map((c) => c.columnKey));

  return (
    <V2FilterPanel
      activeCount={state.activeFilterCount}
      onResetAll={state.resetAll}
      onClose={panel.close}
      search={panel.colSearch}
      onSearchChange={panel.setColSearch}
      columnCount={panel.visibleColumns.length}
      extraContent={extraContent}
      chips={
        chips.length > 0 ? (
          <>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-fg">
              {t("v2.table.activeFilters", { count: chips.length })}
            </span>
            <div className="flex flex-wrap gap-1.5">
              {chips.map((chip) => (
                <V2FilterChip
                  key={chip.id}
                  label={chip.label}
                  summary={chip.summary}
                  onClick={() => panel.reveal(chip.columnKey)}
                  onRemove={() => state.clearColumn(chip.columnKey)}
                />
              ))}
            </div>
          </>
        ) : undefined
      }
    >
      {panel.visibleColumns.map((column) => {
        const spec = column.filter;
        if (!spec) return null;
        const key = column.key;
        return (
          <V2FilterCard
            key={key}
            columnKey={key}
            title={column.label}
            valueType={spec.valueType}
            active={activeKeys.has(key)}
            open={panel.expandedKey === key}
            onOpenChange={(open) => panel.setExpanded(key, open)}
          >
            <V2ColumnHeaderFilterPanel
              columnKey={key}
              label={column.label}
              valueType={spec.valueType}
              sort={state.getSort(key)}
              onSortChange={(direction) => state.setSort(key, direction)}
              selected={query.columnFilters[key] ?? []}
              onSelectedChange={(values) => state.setColumnFilter(key, values)}
              search={query.columnSearch[key] ?? ""}
              onSearchChange={(text) => state.setColumnSearch(key, text)}
              operator={query.columnOperators[key]}
              onOperatorChange={(f) => state.setColumnOperator(key, f)}
              dateRange={query.dateRanges[key]}
              onDateRangeChange={(range) => state.setDateRange(key, range)}
              onClear={() => state.clearColumn(key)}
              optionsState={filters.optionsFor(key)}
              onOptionsSearchChange={filters.onOptionsSearchChange}
              formatOptionLabel={spec.formatOptionLabel}
              align={column.align}
              isActive={activeKeys.has(key)}
              onClose={() => panel.setExpanded(key, false)}
            />
          </V2FilterCard>
        );
      })}
    </V2FilterPanel>
  );
}
