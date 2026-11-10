import * as React from "react";
import { V2Text } from "@/v2/shared/components/atoms/v2-text";
import { V2FilterPanel } from "@/v2/shared/components/molecules/v2-filter-panel";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { buildActiveFilterChips } from "../utils/v2ActiveFilterChips";
import type { V2HeaderFilters } from "../hooks/V2StandardTable.filter.hook";
import { V2TableFilterCards } from "./V2StandardTable.filtercards";
import { V2TableFilterChips } from "./V2StandardTable.filterchips";
import type { V2FilterPanelController } from "./V2StandardTable.filterpanel.hook";
import type { V2TableState } from "../hooks/V2StandardTable.state.hook";
import type { V2Column } from "../V2StandardTable.type";

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
  const chips = React.useMemo(
    () => buildActiveFilterChips(state.query, columns, t),
    [state.query, columns, t],
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
          </>
        ) : undefined
      }
    >
      <V2TableFilterCards
        columns={panel.visibleColumns}
        state={state}
        filters={filters}
        activeKeys={activeKeys}
        expandedKey={panel.expandedKey}
        onExpandedChange={panel.setExpanded}
      />
    </V2FilterPanel>
  );
}
