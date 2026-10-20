import * as React from "react";
import type { Table } from "@tanstack/react-table";
import { V2SubtotalSummaryCell } from "@/v2/shared/components/molecules/v2-subtotal-summary-cell";
import { TableCell, TableFooter, TableRow } from "@/v2/shared/ui";
import { cn } from "@/v2/shared/utils/cn";
import {
  V2_GLASS_SURFACE_CLASS,
  V2_ROW_ACTIONS_COLUMN_WIDTH,
} from "../header/V2StandardTable.header";
import type { V2ColumnSummaryValues } from "./V2StandardTable.summary";
import type { V2Column } from "../V2StandardTable.type";

export interface V2TableSummaryProps<T> {
  table: Table<T>;
  columnsByKey: Map<string, V2Column<T>>;
  values: Record<string, V2ColumnSummaryValues>;
  page: number;
  totalPages: number;
}

/** Hàng tổng cuối bảng (desktop): mỗi cột có `summary` một ô, các cột khác để trống */
export function V2TableSummary<T>({
  table,
  columnsByKey,
  values,
  page,
  totalPages,
}: V2TableSummaryProps<T>) {
  return (
    <TableFooter className="border-border bg-transparent">
      <TableRow className="hover:bg-transparent">
        {table.getVisibleLeafColumns().map((leaf) => {
          const summary = columnsByKey.get(leaf.id)?.summary;
          const value = values[leaf.id];
          return (
            <TableCell
              key={leaf.id}
              style={{ width: leaf.getSize() }}
              className={cn(
                "sticky bottom-0 z-10 px-2 py-1.5 text-right align-middle",
                V2_GLASS_SURFACE_CLASS,
              )}
            >
              {summary && value && (
                <V2SubtotalSummaryCell
                  variant={summary.variant}
                  pageValue={value.pageValue}
                  totalValue={value.totalValue}
                  cumulativeValue={value.cumulativeValue}
                  page={page}
                  totalPages={totalPages}
                  metricTitle={summary.metricTitle}
                  unit={summary.unit}
                  className="justify-end"
                />
              )}
            </TableCell>
          );
        })}
        <TableCell
          style={{ minWidth: V2_ROW_ACTIONS_COLUMN_WIDTH }}
          className={cn("sticky bottom-0 right-0 z-20", V2_GLASS_SURFACE_CLASS)}
        />
      </TableRow>
    </TableFooter>
  );
}
