import React from "react";
import { useTranslation } from "react-i18next";
import { TableHead } from "@/shared/components/ui/table";
import { TableColumnHeaderFilter } from "@/shared/components/DataTable/TableColumnHeaderFilter";
import { useTableColumnState } from "@/shared/hooks/useTableColumnState";
import type { FifoHeaderColumn } from "./fifoColumns";

type TableState = ReturnType<typeof useTableColumnState>;

interface FifoHeaderCellProps {
  column: FifoHeaderColumn;
  tableState: TableState;
  optionsMap: Record<string, { label: string; value: string }[]>;
}

/** Trạng thái sắp xếp hiện tại của một cột: "asc", "desc" hoặc "none". */
export function sortStateOf(sorts: string[], key: string) {
  if (sorts.includes(key)) return "asc" as const;
  if (sorts.includes(`-${key}`)) return "desc" as const;
  return "none" as const;
}

/** Một ô tiêu đề có sắp xếp, tìm kiếm và lọc theo cột. */
export function FifoHeaderCell({
  column,
  tableState,
  optionsMap,
}: FifoHeaderCellProps) {
  const { t } = useTranslation(["vinfastParts", "common"]);
  const { key } = column;

  return (
    <TableHead className={column.className}>
      <TableColumnHeaderFilter
        title={t(column.titleKey, column.titleDefault)}
        align={column.align}
        sortState={sortStateOf(tableState.sorts, key)}
        onSortChange={(state) => tableState.setSort(key, state)}
        searchValue={tableState.columnSearch[key] || ""}
        onSearchChange={(val) => tableState.setColumnSearch(key, val)}
        filterOptions={optionsMap[key] || []}
        selectedFilters={tableState.columnFilters[key] || []}
        onFilterChange={(vals) => tableState.setColumnFilter(key, vals)}
        isActive={!!tableState.columnFilters[key]?.length}
      />
    </TableHead>
  );
}
