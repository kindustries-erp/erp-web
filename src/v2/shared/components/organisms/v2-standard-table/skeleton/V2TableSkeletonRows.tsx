import * as React from "react";
import type { Table } from "@tanstack/react-table";
import { V2Skeleton } from "@/v2/shared/components/atoms/v2-skeleton";
import { TableCell, TableRow } from "@/v2/shared/ui";
import { cn } from "@/v2/shared/utils/cn";
import {
  V2_INDEX_COLUMN_ID,
  V2_SELECTION_COLUMN_ID,
} from "../hooks/V2StandardTable.hook";

export const V2_TABLE_SKELETON_ROWS = 5;

/** Độ rộng xen kẽ để các thanh không đều nhau như dữ liệu thật */
const BAR_WIDTHS = ["w-3/4", "w-1/2", "w-5/6", "w-2/3"];

/** Dòng skeleton theo từng cột đang hiển thị, khớp độ rộng với dòng dữ liệu */
export function V2TableSkeletonRows<T>({
  table,
  loadingLabel,
  count = V2_TABLE_SKELETON_ROWS,
}: {
  table: Table<T>;
  loadingLabel: string;
  count?: number;
}) {
  const columns = table.getVisibleLeafColumns();
  return (
    <>
      {Array.from({ length: count }, (_, rowIndex) => (
        <TableRow key={rowIndex} className="h-[38px] hover:bg-transparent">
          {columns.map((column, columnIndex) => (
            <TableCell key={column.id} className="py-2">
              {rowIndex === 0 && columnIndex === 0 && (
                <span role="status" className="sr-only">
                  {loadingLabel}
                </span>
              )}
              {column.id !== V2_SELECTION_COLUMN_ID && (
                <V2Skeleton
                  data-testid="v2-table-skeleton-bar"
                  className={cn(
                    "h-4",
                    column.id === V2_INDEX_COLUMN_ID
                      ? "w-6"
                      : BAR_WIDTHS[
                          (rowIndex + columnIndex) % BAR_WIDTHS.length
                        ],
                  )}
                />
              )}
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}
