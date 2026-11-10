import * as React from "react";
import { V2ColumnHeaderFilterPanel } from "@/v2/shared/components/molecules/v2-column-header-filter/V2ColumnHeaderFilter.panel";
import { V2FilterCard } from "@/v2/shared/components/molecules/v2-filter-card";
import type { V2HeaderFilters } from "../hooks/V2StandardTable.filter.hook";
import type { V2TableState } from "../hooks/V2StandardTable.state.hook";
import type { V2Column } from "../V2StandardTable.type";

/** Phần của cột dùng để dựng card lọc; không phụ thuộc kiểu dòng `T` nên dùng được cả trong dialog */
export type V2FilterColumn = Pick<
  V2Column<unknown>,
  "key" | "label" | "filter" | "align"
>;

export interface V2TableFilterCardsProps {
  /** Cột hiển thị trong danh sách (đã lọc theo khả năng lọc và ô tìm cột) */
  columns: V2FilterColumn[];
  /** Điều kiện và thao tác lọc; dùng cho cả bảng và bản nháp trong dialog */
  state: Pick<
    V2TableState,
    | "query"
    | "getSort"
    | "setSort"
    | "setColumnFilter"
    | "setColumnSearch"
    | "setColumnOperator"
    | "setDateRange"
    | "clearColumn"
  >;
  filters: V2HeaderFilters;
  /** Cột đang có điều kiện (để đánh dấu active) */
  activeKeys: Set<string>;
  expandedKey: string | null;
  onExpandedChange: (key: string, open: boolean) => void;
}

/** Danh sách card lọc theo cột: dùng chung cho panel bên phải và editor trong dialog bộ lọc */
export function V2TableFilterCards({
  columns,
  state,
  filters,
  activeKeys,
  expandedKey,
  onExpandedChange,
}: V2TableFilterCardsProps) {
  const { query } = state;
  return (
    <>
      {columns.map((column) => {
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
            open={expandedKey === key}
            onOpenChange={(open) => onExpandedChange(key, open)}
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
              onClose={() => onExpandedChange(key, false)}
            />
          </V2FilterCard>
        );
      })}
    </>
  );
}
