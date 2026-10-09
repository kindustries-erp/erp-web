import * as React from "react";
import type { Table } from "@tanstack/react-table";
import {
  V2TableBodyRows,
  type V2TableBodyRowsProps,
} from "./V2StandardTable.body";
import {
  V2TableHeaderRows,
  V2_ROW_ACTIONS_COLUMN_WIDTH,
} from "./V2StandardTable.header";
import type { V2HeaderFilters } from "./V2StandardTable.filter.hook";
import type { V2TableState } from "./V2StandardTable.state.hook";
import { V2TableSummary } from "./V2StandardTable.summary.row";
import type { V2ColumnSummaryValues } from "./V2StandardTable.summary";
import type { V2Column } from "./V2StandardTable.type";

interface V2TableGridProps<T> extends Omit<
  V2TableBodyRowsProps<T>,
  "colSpan" | "table" | "columnsByKey"
> {
  table: Table<T>;
  columnsByKey: Map<string, V2Column<T>>;
  state: V2TableState;
  fetchOptionsFor: (column: V2Column<T>) => unknown;
  filters: V2HeaderFilters;
  /** Có thì hiện hàng tổng cuối bảng (chỉ desktop truyền vào) */
  summary?: {
    values: Record<string, V2ColumnSummaryValues>;
    page: number;
    totalPages: number;
  };
}

/** Phần `<table>` thuần: colgroup + header + body, dùng chung cho desktop */
export function V2TableGrid<T>({
  table,
  columnsByKey,
  state,
  fetchOptionsFor,
  filters,
  summary,
  ...bodyProps
}: V2TableGridProps<T>) {
  return (
    <table
      className="w-full table-fixed border-collapse border-spacing-0 text-xs"
      style={{ minWidth: table.getTotalSize() + V2_ROW_ACTIONS_COLUMN_WIDTH }}
    >
      <colgroup>
        {table.getVisibleLeafColumns().map((column) => (
          <col key={column.id} style={{ width: column.getSize() }} />
        ))}
        <col />
      </colgroup>
      <V2TableHeaderRows
        table={table}
        columnsByKey={columnsByKey}
        state={state}
        fetchOptionsFor={fetchOptionsFor}
        filters={filters}
      />
      <V2TableBodyRows
        table={table}
        columnsByKey={columnsByKey}
        colSpan={table.getVisibleLeafColumns().length + 1}
        {...bodyProps}
      />
      {summary && (
        <V2TableSummary
          table={table}
          columnsByKey={columnsByKey}
          values={summary.values}
          page={summary.page}
          totalPages={summary.totalPages}
        />
      )}
    </table>
  );
}
