import React, { useMemo, type ReactNode } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { format as formatDate, isValid } from "date-fns";
import { Tooltip } from "@/core/components/ui/Tooltip";
import { Badge } from "@/shared/components/ui/badge";
import { cn } from "@/shared/utils";
import type {
  DataTableColumn,
  ActionsColumnConfig,
  DataTableRowMeta,
} from "../types";
import { getNestedValue } from "../utils";
import { TableRowHoverActions } from "../TableRowHoverActions";
import {
  SelectionHeaderCheckbox,
  SelectionCellCheckbox,
} from "../components/SelectionCheckboxes";
import type { ActionDropdownItem } from "@/shared/components/ActionDropdown";

interface UseDataTableColumnsParams<T> {
  columns: DataTableColumn<T>[];
  actionsColumn?: ActionsColumnConfig<T>;
  rowHoverActions?: (
    item: T,
    index: number,
    meta?: any,
  ) => ActionDropdownItem[];
  enableRowSelection?: boolean;
  page?: number;
  pageSize?: number;
  variant?: "default" | "spreadsheet";
}

export function useDataTableColumns<T>({
  columns,
  actionsColumn,
  rowHoverActions,
  enableRowSelection,
  page,
  pageSize,
  variant,
}: UseDataTableColumnsParams<T>) {
  const effectiveColumns = useMemo(
    () =>
      actionsColumn ? columns.filter((col) => col.key !== "actions") : columns,
    [columns, actionsColumn],
  );

  const tableColumns: ColumnDef<T, unknown>[] = useMemo(() => {
    const cols: ColumnDef<T, unknown>[] = effectiveColumns.map((column) => {
      let cellClass = column.className;
      const headerClass = column.headerClassName || "text-center";
      if (column.valueType === "number" || column.valueType === "date") {
        cellClass = cn("text-right", cellClass);
      }
      return {
        id: column.key,
        header:
          typeof column.header === "function"
            ? (column.header as any)
            : () => column.header,
        cell: ({ row, table }) => {
          let value: any;
          if (column.cell) {
            value = column.cell(
              row.original,
              page && pageSize
                ? (page - 1) * pageSize + row.index + 1
                : row.index + 1,
              table.options.meta,
            );
          } else if (column.dataIndex) {
            value = getNestedValue(row.original, column.dataIndex);
          }

          if (column.valueType === "text" && typeof value === "string") {
            return (
              <Tooltip content={value}>
                <div className="truncate w-full">{value}</div>
              </Tooltip>
            );
          }
          if (column.valueType === "number" && typeof value === "number") {
            return value.toLocaleString();
          }
          if (column.valueType === "date" && value) {
            const dateObj = new Date(value);
            if (isValid(dateObj)) {
              const dateStr = formatDate(
                dateObj,
                column.dateFormat || "dd/MM/yyyy HH:mm",
              );
              const fullDateStr = formatDate(dateObj, "dd/MM/yyyy HH:mm:ss");
              return (
                <Tooltip content={fullDateStr}>
                  <span>{dateStr}</span>
                </Tooltip>
              );
            }
          }
          if (column.valueType === "status" && typeof value === "string") {
            let badgeVariant:
              | "default"
              | "secondary"
              | "destructive"
              | "outline"
              | "ghost" = "default";
            const lower = value.toLowerCase();
            if (["active", "approved", "success", "completed"].includes(lower))
              badgeVariant = "default";
            else if (["draft", "pending", "processing"].includes(lower))
              badgeVariant = "secondary";
            else if (
              ["cancelled", "rejected", "failed", "error"].includes(lower)
            )
              badgeVariant = "destructive";

            return <Badge variant={badgeVariant}>{value}</Badge>;
          }

          return value as ReactNode;
        },
        size: column.size,
        minSize: column.minSize,
        maxSize: column.maxSize,
        enableResizing: column.enableResizing,
        meta: {
          className: cellClass,
          headerClassName: headerClass,
          skeletonClassName: column.skeletonClassName,
          sortable: column.sortable,
          sortKey: column.sortKey || column.key,
          hideable: column.hideable !== false,
          label:
            column.label ||
            (typeof column.header === "function"
              ? column.key
              : column.header) ||
            column.key,
        } satisfies DataTableRowMeta,
      };
    });

    if (actionsColumn) {
      const actionColSize = actionsColumn.size ?? 40;
      const actionColMinSize = actionsColumn.minSize ?? actionColSize;
      const actionColMaxSize = actionsColumn.maxSize ?? actionColSize;

      cols.push({
        id: "__actions",
        header:
          typeof actionsColumn.header === "function"
            ? (actionsColumn.header as any)
            : () => actionsColumn.header ?? "",
        cell: ({ row, table }) =>
          actionsColumn.cell(
            row.original,
            page && pageSize
              ? (page - 1) * pageSize + row.index + 1
              : row.index + 1,
            table.options.meta,
          ),
        enableResizing: false,
        size: actionColSize,
        minSize: actionColMinSize,
        maxSize: actionColMaxSize,
        meta: {
          className: cn(
            "px-0 text-center",
            variant !== "spreadsheet" &&
              "bg-surface group-hover:bg-surface-hover sticky right-0 shadow-[-1px_0_0_0_var(--border-light)] z-10",
            actionsColumn.className,
          ),
          headerClassName: cn(
            "px-0 text-center",
            variant !== "spreadsheet" &&
              "bg-muted sticky right-0 top-0 shadow-[-1px_1px_0_0_var(--border-light)] z-30",
            actionsColumn.headerClassName,
          ),
          skeletonClassName: "",
          hideable: false,
        } satisfies DataTableRowMeta,
      });
    }

    if (rowHoverActions) {
      cols.push({
        id: "__hover_actions",
        header: () => null,
        cell: ({ row, table }) => {
          const actionItems = rowHoverActions(
            row.original,
            page && pageSize
              ? (page - 1) * pageSize + row.index + 1
              : row.index + 1,
            table.options.meta,
          );
          if (!actionItems || actionItems.length === 0) return null;
          return (
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-auto">
              <TableRowHoverActions items={actionItems} />
            </div>
          );
        },
        enableResizing: false,
        size: 116,
        minSize: 116,
        maxSize: 116,
        meta: {
          className:
            "w-[116px] min-w-[116px] max-w-[116px] p-0 m-0 border-none bg-transparent sticky right-0 z-20 overflow-visible pointer-events-none",
          headerClassName:
            "w-[116px] min-w-[116px] max-w-[116px] p-0 m-0 border-r border-border",
          skeletonClassName: "",
          hideable: false,
        } satisfies DataTableRowMeta,
      });
    }

    if (enableRowSelection) {
      cols.unshift({
        id: "__selection",
        header: ({ table }) => <SelectionHeaderCheckbox table={table} />,
        cell: ({ row }) => <SelectionCellCheckbox row={row} />,
        enableResizing: false,
        size: 40,
        meta: {
          className: cn(
            "w-[40px] min-w-[40px] max-w-[40px] px-2 text-center",
            variant !== "spreadsheet" &&
              "bg-surface sticky left-0 z-20 shadow-[1px_0_0_0_var(--border-light)]",
          ),
          headerClassName: cn(
            "w-[40px] min-w-[40px] max-w-[40px] px-2 text-center",
            variant !== "spreadsheet"
              ? "bg-muted sticky left-0 top-0 z-40 shadow-[1px_1px_0_0_var(--border-light)]"
              : "bg-muted sticky top-0 z-20 shadow-[0_1px_0_0_var(--border-light)] border-r border-border h-auto",
          ),
          skeletonClassName: "",
          hideable: false,
        } satisfies DataTableRowMeta,
      });
    }

    return cols;
  }, [
    effectiveColumns,
    actionsColumn,
    rowHoverActions,
    enableRowSelection,
    page,
    pageSize,
    variant,
  ]);

  return tableColumns;
}
