import * as React from "react";
import type { Table } from "@tanstack/react-table";
import { V2SubtotalSummaryCell } from "@/v2/shared/components/molecules/v2-subtotal-summary-cell";
import { TableColumnAlign } from "@/v2/shared/types/v2-table";
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
  totalRows?: number;
  pageSize?: number;
}

/** Hàng tổng cuối bảng (desktop): ô nhãn "Tổng cộng: ⓘ" + các ô số liệu subtotal */
export function V2TableSummary<T>({
  table,
  columnsByKey,
  values,
  page,
  totalPages,
  totalRows,
  pageSize = 20,
}: V2TableSummaryProps<T>) {
  const visibleLeafColumns = table.getVisibleLeafColumns();
  const pageRowsCount = table.getRowModel().rows.length;
  const resolvedTotalRows = totalRows ?? pageRowsCount;
  const cumulativeRows = Math.min(
    (page - 1) * pageSize + pageRowsCount,
    resolvedTotalRows,
  );

  return (
    <TableFooter className="border-border bg-transparent">
      <TableRow className="hover:bg-transparent">
        {visibleLeafColumns.map((leaf) => {
          const column = columnsByKey.get(leaf.id);
          const summary = column?.summary;
          const value = values[leaf.id];
          const isLabel = summary?.variant === "label";
          const align = column?.align;

          const alignClass =
            align === TableColumnAlign.RIGHT
              ? "text-right"
              : align === TableColumnAlign.CENTER
                ? "text-center"
                : isLabel
                  ? "text-left"
                  : "text-right";

          const justifyClass =
            align === TableColumnAlign.RIGHT
              ? "justify-end"
              : align === TableColumnAlign.CENTER
                ? "justify-center"
                : isLabel
                  ? "justify-start"
                  : "justify-end";

          return (
            <TableCell
              key={leaf.id}
              style={{ width: leaf.getSize() }}
              className={cn(
                "sticky bottom-0 z-10 px-2 py-1.5 align-middle",
                alignClass,
                V2_GLASS_SURFACE_CLASS,
              )}
            >
              {isLabel ? (
                <V2SubtotalSummaryCell
                  variant="label"
                  label={summary.label}
                  pageValue={pageRowsCount}
                  totalValue={resolvedTotalRows}
                  cumulativeValue={cumulativeRows}
                  page={page}
                  totalPages={totalPages}
                  className={justifyClass}
                />
              ) : summary && value ? (
                <V2SubtotalSummaryCell
                  variant={summary.variant}
                  pageValue={value.pageValue}
                  totalValue={value.totalValue}
                  cumulativeValue={value.cumulativeValue}
                  page={page}
                  totalPages={totalPages}
                  metricTitle={summary.metricTitle}
                  unit={summary.unit}
                  className={justifyClass}
                />
              ) : null}
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
