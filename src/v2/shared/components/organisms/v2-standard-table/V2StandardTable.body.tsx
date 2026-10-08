import * as React from "react";
import { flexRender } from "@tanstack/react-table";
import type { Row, Table } from "@tanstack/react-table";
import { V2TableRowHoverActions } from "@/v2/shared/components/molecules/v2-table-row-actions";
import { hasRowActions } from "@/v2/shared/components/molecules/v2-table-row-actions";
import { TableBody, TableCell, TableRow } from "@/v2/shared/ui";
import { TableColumnAlign } from "@/v2/shared/types/v2-table";
import type { V2RowActionGroup } from "@/v2/shared/types/v2-table";
import { cn } from "@/v2/shared/utils/cn";
import { V2_ROW_ACTIONS_COLUMN_WIDTH } from "./V2StandardTable.header";
import type { V2Column } from "./V2StandardTable.type";

const ALIGN_CLASS: Record<TableColumnAlign, string> = {
  [TableColumnAlign.LEFT]: "text-left",
  [TableColumnAlign.CENTER]: "text-center",
  [TableColumnAlign.RIGHT]: "text-right tabular-nums",
};

interface RowProps<T> {
  row: Row<T>;
  /** Đổi khi thứ tự/ẩn hiện cột thay đổi để row memo vẫn render lại đúng */
  layoutKey: string;
  isSelected: boolean;
  rowClassName?: string;
  isMenuOpen: boolean;
  columnsByKey: Map<string, V2Column<T>>;
  rowActions?: (row: T) => V2RowActionGroup[];
  onRowContextMenu: (event: React.MouseEvent, rowKey: string) => void;
}

function V2TableRowInner<T>({
  row,
  isSelected,
  rowClassName,
  isMenuOpen,
  columnsByKey,
  rowActions,
  onRowContextMenu,
}: RowProps<T>) {
  const groups = React.useMemo(
    () => rowActions?.(row.original) ?? [],
    [rowActions, row.original],
  );
  const hasActions = hasRowActions(groups);

  return (
    <TableRow
      data-state={isSelected ? "selected" : undefined}
      data-context-menu-active={isMenuOpen ? "true" : undefined}
      onContextMenu={
        hasActions ? (event) => onRowContextMenu(event, row.id) : undefined
      }
      className={cn(
        "group h-[38px] border-b border-[color:var(--border-light)] hover:bg-surface-hover data-[state=selected]:bg-muted data-[context-menu-active=true]:bg-primary/[0.04]",
        rowClassName,
      )}
    >
      {row.getVisibleCells().map((cell) => {
        const column = columnsByKey.get(cell.column.id);
        return (
          <TableCell
            key={cell.id}
            style={{ width: cell.column.getSize() }}
            className={cn(
              "truncate border-r border-border px-2 py-1 text-xs",
              column?.align && ALIGN_CLASS[column.align],
              column?.className,
            )}
          >
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </TableCell>
        );
      })}
      <TableCell
        style={{ minWidth: V2_ROW_ACTIONS_COLUMN_WIDTH }}
        className="pointer-events-none sticky right-0 z-20 border-none bg-transparent p-0"
      >
        {hasActions && <V2TableRowHoverActions groups={groups} />}
      </TableCell>
    </TableRow>
  );
}

const V2TableRow = React.memo(V2TableRowInner) as typeof V2TableRowInner;

interface BodyProps<T> {
  table: Table<T>;
  layoutKey: string;
  columnsByKey: Map<string, V2Column<T>>;
  colSpan: number;
  loading: boolean;
  emptyLabel: string;
  loadingLabel: string;
  menuRowKey: string | null;
  rowActions?: (row: T) => V2RowActionGroup[];
  getRowClassName?: (row: T, index: number) => string | undefined;
  onRowContextMenu: (event: React.MouseEvent, rowKey: string) => void;
}

export function V2TableBodyRows<T>({
  table,
  layoutKey,
  columnsByKey,
  colSpan,
  loading,
  emptyLabel,
  loadingLabel,
  menuRowKey,
  rowActions,
  getRowClassName,
  onRowContextMenu,
}: BodyProps<T>) {
  const rows = table.getRowModel().rows;

  if (rows.length === 0) {
    return (
      <TableBody>
        <TableRow className="hover:bg-transparent">
          <TableCell
            colSpan={colSpan}
            className="h-24 text-center text-xs text-muted-fg"
          >
            {loading ? loadingLabel : emptyLabel}
          </TableCell>
        </TableRow>
      </TableBody>
    );
  }

  return (
    <TableBody className={cn(loading && "pointer-events-none opacity-60")}>
      {rows.map((row, index) => (
        <V2TableRow
          key={row.id}
          row={row}
          layoutKey={layoutKey}
          isSelected={row.getIsSelected()}
          rowClassName={getRowClassName?.(row.original, index + 1)}
          isMenuOpen={menuRowKey === row.id}
          columnsByKey={columnsByKey}
          rowActions={rowActions}
          onRowContextMenu={onRowContextMenu}
        />
      ))}
    </TableBody>
  );
}
