import * as React from "react";
import { cn } from "@/v2/shared/utils/cn";
import type {
  V2DrawerLinesColumn,
  V2DrawerLinesTableProps,
} from "./V2DrawerLinesTable.type";

const ALIGN_CLASS: Record<NonNullable<V2DrawerLinesColumn["align"]>, string> = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
};

/**
 * Bảng dòng chứng từ dùng trong drawer, theo chuẩn V2 (table-fixed + colgroup).
 * Một vùng cuộn duy nhất: header dính đỉnh, chân bảng dính đáy, không xuống dòng ở header và các ô số.
 */
export function V2DrawerLinesTable<R>({
  ariaLabel,
  columns,
  rows,
  getRowKey,
  renderCell,
  footerCells,
  footerLabel,
  emptyLabel,
  maxHeight = "60vh",
}: V2DrawerLinesTableProps<R>) {
  const minTableWidth = columns.reduce(
    (sum, col) => sum + (col.grow ? (col.minWidth ?? 120) : (col.width ?? 100)),
    0,
  );

  // Cột đầu tiên có ô tổng: mọi cột trước đó gộp thành một ô nhãn (không có cột nào trước thì bỏ nhãn)
  const footerIds = footerCells ? Object.keys(footerCells) : [];
  const firstFooterIdx = columns.findIndex((col) => footerIds.includes(col.id));
  const hasFooter = firstFooterIdx >= 0;
  const labelSpan = hasFooter ? firstFooterIdx : 0;

  return (
    <div
      className="overflow-auto rounded border border-border bg-surface"
      style={{ maxHeight }}
    >
      <table
        aria-label={ariaLabel}
        className="w-full border-collapse text-xs"
        style={{ tableLayout: "fixed", minWidth: minTableWidth }}
      >
        <colgroup>
          {columns.map((col) => (
            <col
              key={col.id}
              style={col.grow ? undefined : { width: col.width ?? 100 }}
            />
          ))}
        </colgroup>
        <thead className="sticky top-0 z-10">
          <tr className="border-b border-border bg-muted/95 backdrop-blur">
            {columns.map((col) => (
              <th
                key={col.id}
                title={col.headerTitle ?? undefined}
                className={cn(
                  "whitespace-nowrap truncate px-2 py-1.5 text-[11px] font-semibold text-muted-fg",
                  ALIGN_CLASS[col.align ?? "left"],
                )}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="p-6 text-center text-muted-fg"
              >
                {emptyLabel}
              </td>
            </tr>
          ) : (
            rows.map((row, index) => (
              <tr
                key={getRowKey(row, index)}
                className="border-b border-border hover:bg-muted/30"
              >
                {columns.map((col) => (
                  <td
                    key={col.id}
                    className={cn(
                      "px-2 py-1.5 align-middle",
                      col.wrap
                        ? "whitespace-normal break-words"
                        : "whitespace-nowrap truncate",
                      ALIGN_CLASS[col.align ?? "left"],
                    )}
                  >
                    {renderCell(col, row, index)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
        {hasFooter && rows.length > 0 && (
          <tfoot className="sticky bottom-0 z-10 border-t border-border bg-muted/95 font-semibold">
            <tr>
              {labelSpan > 0 && (
                <td
                  colSpan={labelSpan}
                  className="whitespace-nowrap px-2 py-1.5 text-right"
                >
                  {footerLabel}
                </td>
              )}
              {columns.slice(labelSpan).map((col) => (
                <td
                  key={col.id}
                  className={cn(
                    "whitespace-nowrap px-2 py-1.5 tabular-nums",
                    ALIGN_CLASS[col.align ?? "left"],
                  )}
                >
                  {footerCells?.[col.id]}
                </td>
              ))}
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  );
}
