import React, { type MouseEvent } from "react";
import { flexRender } from "@tanstack/react-table";
import { TableRow, TableCell } from "@/shared/components/ui/table";
import { cn } from "@/shared/utils";
import type { DataTableRowMemoProps, DataTableRowMeta } from "../types";
import type { ActionDropdownItem } from "@/shared/components/ActionDropdown";

export function DataTableRowInner<T>({
  row,
  rowKey,
  isExpanded,
  isContextMenuActive,
  rowIndex,
  isSelected,
  getRowClassName,
  onRowClick,
  onRowContextMenu,
  enableRowContextMenu,
  rowHoverActions,
  setContextMenu,
  variant,
  enableRowSelection,
  enableColumnResizing,
  renderSubRow,
}: DataTableRowMemoProps<T>) {
  return (
    <React.Fragment key={row.id}>
      <TableRow
        data-state={isSelected && "selected"}
        data-context-menu-active={isContextMenuActive ? "true" : undefined}
        className={cn(
          "group",
          onRowClick && "cursor-pointer",
          isExpanded && "bg-muted/5 font-medium border-l-2 border-l-primary",
          isContextMenuActive && "bg-primary/[0.04] dark:bg-primary/[0.08]",
          getRowClassName?.(row.original, rowIndex),
        )}
        onClick={onRowClick ? () => onRowClick(row.original) : undefined}
        onContextMenu={(e: MouseEvent) => {
          if (onRowContextMenu) {
            onRowContextMenu(row.original, rowIndex + 1, e);
          }
          if (enableRowContextMenu !== false) {
            let actionItems: ActionDropdownItem[] | undefined;
            if (rowHoverActions) {
              actionItems = rowHoverActions(
                row.original,
                rowIndex + 1,
                (row as any).table?.options?.meta,
              );
            }
            if (actionItems && actionItems.length > 0) {
              e.preventDefault();
              e.stopPropagation();
              setContextMenu({
                x: e.clientX,
                y: e.clientY,
                items: actionItems,
                rowKey,
              });
            }
          }
        }}
      >
        {row.getVisibleCells().map((cell, index) => {
          const isHoverActionsCol = cell.column.id === "__hover_actions";
          if (isHoverActionsCol) {
            return (
              <TableCell
                key={cell.id}
                className="w-[116px] min-w-[116px] max-w-[116px] p-0 m-0 border-none bg-transparent sticky right-0 z-20 overflow-visible pointer-events-none"
                style={{
                  width: 116,
                  minWidth: 116,
                  maxWidth: 116,
                }}
              >
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </TableCell>
            );
          }
          const meta = cell.column.columnDef.meta as DataTableRowMeta;
          const isFirstCol = index === 0;
          const isActionsCol = cell.column.id === "__actions";
          const actionsWidth = cell.column.getSize();
          return (
            <TableCell
              key={cell.id}
              className={cn(
                meta?.className,
                isFirstCol &&
                  !enableRowSelection &&
                  variant !== "spreadsheet" &&
                  "sticky left-0 bg-surface group-hover:bg-surface-hover shadow-[1px_0_0_0_var(--border-light)] z-10",
                variant === "spreadsheet" &&
                  "border-r border-border py-1 text-xs",
                variant === "spreadsheet" &&
                  !["__actions", "__selection", "__expand"].includes(
                    cell.column.id,
                  ) &&
                  "px-2 truncate",
              )}
              style={{
                width: isActionsCol ? actionsWidth : undefined,
                minWidth: isActionsCol ? actionsWidth : undefined,
                maxWidth: isActionsCol
                  ? actionsWidth
                  : enableColumnResizing
                    ? cell.column.getSize()
                    : undefined,
              }}
            >
              {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </TableCell>
          );
        })}
        <TableCell
          className="w-auto p-0 m-0 border-none"
          style={{ width: "auto" }}
        />
      </TableRow>
      {renderSubRow && isExpanded && (
        <TableRow className="bg-muted/5 hover:bg-muted/5 border-b border-border/60">
          <TableCell
            colSpan={row.getVisibleCells().length + 1}
            className="p-4 bg-muted/20"
          >
            {renderSubRow(row.original)}
          </TableCell>
        </TableRow>
      )}
    </React.Fragment>
  );
}

export const DataTableRowMemo = React.memo(DataTableRowInner, (prev, next) => {
  if (
    prev.visibleColumnsKey !== next.visibleColumnsKey ||
    prev.row.original !== next.row.original ||
    prev.isSelected !== next.isSelected ||
    prev.isExpanded !== next.isExpanded ||
    prev.isContextMenuActive !== next.isContextMenuActive ||
    prev.rowIndex !== next.rowIndex ||
    prev.variant !== next.variant ||
    prev.enableRowSelection !== next.enableRowSelection ||
    prev.enableColumnResizing !== next.enableColumnResizing ||
    prev.rowKey !== next.rowKey ||
    prev.getRowClassName !== next.getRowClassName ||
    prev.onRowClick !== next.onRowClick ||
    prev.renderSubRow !== next.renderSubRow
  ) {
    return false;
  }

  return true;
}) as typeof DataTableRowInner;
