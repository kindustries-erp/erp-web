import React, { type ReactNode, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import * as Popover from "@radix-ui/react-popover";
import { Settings2, GripVertical } from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { useUserPreferences } from "@/shared/hooks/useUserPreferences";

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
  type Table as TanstackTable,
  type VisibilityState,
  type Column,
  type Updater,
  type ColumnSizingState,
} from "@tanstack/react-table";
import { Skeleton } from "@/shared/components/Skeleton";
import { TablePagination } from "@/shared/components/TablePagination";
import { useT } from "@/core/i18n";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from "@/shared/components/ui/table";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { cn } from "@/shared/utils";

export interface DataTableColumn<T> {
  key: string;
  header: ReactNode;
  cell: (item: T, index: number) => ReactNode;
  className?: string;
  headerClassName?: string;
  skeletonClassName?: string;
  sortable?: boolean;
  sortKey?: string;
  hideable?: boolean;
  label?: ReactNode;
  size?: number;
  minSize?: number;
  maxSize?: number;
  enableResizing?: boolean;
}

export interface ActionsColumnConfig<T> {
  cell: (item: T, index: number) => ReactNode;
  header?: ReactNode;
  className?: string;
  headerClassName?: string;
}

interface DataTableRowMeta {
  className?: string;
  headerClassName?: string;
  skeletonClassName?: string;
  sortable?: boolean;
  sortKey?: string;
  hideable?: boolean;
  label?: ReactNode;
}

interface DataTableProps<T> {
  items: T[];
  columns: DataTableColumn<T>[];
  getRowKey: (item: T) => string;
  loading?: boolean;
  error?: string | null;
  emptyLabel: string;
  filters?: ReactNode;
  minWidth?: number;
  loadingRows?: number;
  elevated?: boolean;
  containerClassName?: string;
  actionsColumn?: ActionsColumnConfig<T>;
  page?: number;
  pageSize?: number;
  total?: number;
  totalPages?: number;
  onPage?: (page: number) => void;
  onPageSize?: (pageSize: number) => void;
  onRowClick?: (item: T) => void;
  renderSubRow?: (item: T) => ReactNode;
  expandedRowKeys?: string[];
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  onSort?: (key: string) => void;
  enableColumnVisibility?: boolean;
  tableId?: string;
  enableColumnResizing?: boolean;
  enableRowSelection?: boolean;
  rowSelection?: Record<string, boolean>;
  onRowSelectionChange?: (updater: Updater<Record<string, boolean>>) => void;
  variant?: "default" | "spreadsheet";
  summaryRow?: Record<string, ReactNode>;
}

interface SortableItemProps<T> {
  id: string;
  column: Column<T, unknown>;
}

function SortableColumnItem<T>({ id, column }: SortableItemProps<T>) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1 : 0,
    opacity: isDragging ? 0.5 : 1,
  };

  const meta = column.columnDef.meta as DataTableRowMeta;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2 px-3 py-2 rounded-md text-[13px] hover:bg-[color:var(--popup-bg-hover)] bg-surface"
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab hover:text-foreground text-muted-foreground transition-colors outline-none"
      >
        <GripVertical size={14} />
      </div>

      <label className="flex items-center gap-2 cursor-pointer flex-1 select-none">
        <div
          className="flex items-center justify-center w-4 h-4 rounded-[4px] border border-border bg-surface data-[state=checked]:bg-primary data-[state=checked]:border-primary transition-colors"
          data-state={column.getIsVisible() ? "checked" : "unchecked"}
        >
          {column.getIsVisible() && (
            <svg
              width="10"
              height="10"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-primary-fg"
            >
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          )}
        </div>
        <input
          type="checkbox"
          className="sr-only"
          checked={column.getIsVisible()}
          onChange={(e) => column.toggleVisibility(e.target.checked)}
        />
        <span className="truncate">{meta?.label as ReactNode}</span>
      </label>
    </div>
  );
}

function ColumnToggle<T>({
  table,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _visibility,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _order,
}: {
  table: TanstackTable<T>;
  _visibility?: VisibilityState;
  _order?: string[];
}) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const hideableColumns = table.getAllLeafColumns().filter((col) => {
    const meta = col.columnDef.meta as DataTableRowMeta;
    return meta?.hideable !== false && col.id !== "__actions";
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const currentOrder = table.getAllLeafColumns().map((c) => c.id);
      const oldOrderIndex = currentOrder.findIndex((id) => id === active.id);
      const newOrderIndex = currentOrder.findIndex((id) => id === over.id);

      const newOrder = arrayMove(currentOrder, oldOrderIndex, newOrderIndex);
      table.setColumnOrder(newOrder);
    }
  };

  if (hideableColumns.length === 0) return null;

  return (
    <Popover.Root modal={false} open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button
          type="button"
          className="inline-flex items-center justify-center w-8 h-8 rounded-md text-[color:var(--muted-fg)] hover:bg-[color:var(--popup-bg-hover)] hover:text-foreground transition-colors outline-none cursor-pointer border border-border pointer-events-auto shadow-sm"
          title={t("Hiển thị cột")}
          onClick={(e) => {
            e.stopPropagation();
            setOpen(true);
          }}
          onPointerDown={(e) => e.stopPropagation()}
        >
          <Settings2 size={16} />
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align="end"
          className="z-[9999] min-w-[180px] rounded-lg p-1 popup-content bg-surface border border-border shadow-md"
        >
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={hideableColumns.map((col) => col.id)}
              strategy={verticalListSortingStrategy}
            >
              {hideableColumns.map((column) => (
                <SortableColumnItem<T>
                  key={column.id}
                  id={column.id}
                  column={column}
                />
              ))}
            </SortableContext>
          </DndContext>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

import { subscribePortalTarget } from "./portalStore";

export function DataTable<T>({
  items,
  columns,
  getRowKey,
  loading = false,
  error = null,
  emptyLabel,
  filters,
  minWidth = 700,
  loadingRows = 6,
  elevated = false,
  containerClassName,
  actionsColumn,
  page,
  pageSize,
  total,
  totalPages,
  onPage,
  onPageSize,
  onRowClick,
  renderSubRow,
  expandedRowKeys,
  sortBy,
  sortOrder,
  onSort,
  enableColumnVisibility,
  tableId,
  enableColumnResizing,
  enableRowSelection,
  rowSelection,
  onRowSelectionChange,
  variant = "default",
  summaryRow,
}: DataTableProps<T>) {
  const { getTablePreference, setTablePreferences } = useUserPreferences();

  const [internalVisibility, setInternalVisibility] = useState<VisibilityState>(
    () => (tableId ? getTablePreference(tableId)?.columnVisibility || {} : {}),
  );

  const [internalColumnOrder, setInternalColumnOrder] = useState<string[]>(
    () => (tableId ? getTablePreference(tableId)?.columnOrder || [] : []),
  );

  const [internalColumnSizing, setInternalColumnSizing] =
    useState<ColumnSizingState>(() =>
      tableId ? getTablePreference(tableId)?.columnSizing || {} : {},
    );

  const handleColumnVisibilityChange = (
    updaterOrValue: Updater<VisibilityState>,
  ) => {
    setInternalVisibility(updaterOrValue);
    if (tableId) {
      const newState =
        typeof updaterOrValue === "function"
          ? updaterOrValue(internalVisibility)
          : updaterOrValue;
      setTablePreferences(tableId, {
        columnOrder: internalColumnOrder,
        columnVisibility: newState,
        columnSizing: internalColumnSizing,
      });
    }
  };

  const handleColumnOrderChange = (updaterOrValue: Updater<string[]>) => {
    setInternalColumnOrder(updaterOrValue);
    if (tableId) {
      const newState =
        typeof updaterOrValue === "function"
          ? updaterOrValue(internalColumnOrder)
          : updaterOrValue;
      setTablePreferences(tableId, {
        columnOrder: newState,
        columnVisibility: internalVisibility,
        columnSizing: internalColumnSizing,
      });
    }
  };

  const handleColumnSizingChange = (
    updaterOrValue: Updater<ColumnSizingState>,
  ) => {
    setInternalColumnSizing(updaterOrValue);
    if (tableId) {
      const newState =
        typeof updaterOrValue === "function"
          ? updaterOrValue(internalColumnSizing)
          : updaterOrValue;
      setTablePreferences(tableId, {
        columnOrder: internalColumnOrder,
        columnVisibility: internalVisibility,
        columnSizing: newState,
      });
    }
  };

  const showPagination =
    page != null &&
    pageSize != null &&
    total != null &&
    totalPages != null &&
    !!onPage &&
    !!onPageSize;

  const effectiveColumns = actionsColumn
    ? columns.filter((col) => col.key !== "actions")
    : columns;

  const tableColumns: ColumnDef<T, unknown>[] = effectiveColumns.map(
    (column) => ({
      id: column.key,
      header: () => column.header,
      cell: ({ row }) =>
        column.cell(
          row.original,
          page && pageSize
            ? (page - 1) * pageSize + row.index + 1
            : row.index + 1,
        ),
      size: column.size,
      minSize: column.minSize,
      maxSize: column.maxSize,
      enableResizing: column.enableResizing,
      meta: {
        className: column.className,
        headerClassName: column.headerClassName,
        skeletonClassName: column.skeletonClassName,
        sortable: column.sortable,
        sortKey: column.sortKey || column.key,
        hideable: column.hideable !== false,
        label: column.label || column.header || column.key,
      } satisfies DataTableRowMeta,
    }),
  );

  if (actionsColumn) {
    tableColumns.push({
      id: "__actions",
      header: () => actionsColumn.header ?? "",
      cell: ({ row }) =>
        actionsColumn.cell(
          row.original,
          page && pageSize
            ? (page - 1) * pageSize + row.index + 1
            : row.index + 1,
        ),
      meta: {
        className: cn(
          "w-[48px] px-0 text-center",
          variant !== "spreadsheet" &&
            "bg-surface group-hover:bg-surface-hover sticky right-0 shadow-[-1px_0_0_0_var(--border-light)] z-10",
          actionsColumn.className,
        ),
        headerClassName: cn(
          "w-[48px] px-0 text-center",
          variant !== "spreadsheet" &&
            "bg-surface sticky right-0 top-0 shadow-[-1px_1px_0_0_var(--border-light)] z-30",
          actionsColumn.headerClassName,
        ),
        skeletonClassName: "",
        hideable: false,
      } satisfies DataTableRowMeta,
    });
  }

  if (enableRowSelection) {
    tableColumns.unshift({
      id: "__selection",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
          className="translate-y-[2px]"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
          className="translate-y-[2px]"
          onClick={(e) => e.stopPropagation()}
        />
      ),
      enableResizing: false,
      size: 40,
      meta: {
        className: cn(
          "w-[40px] px-2 text-center",
          variant !== "spreadsheet" &&
            "bg-surface sticky left-0 z-20 shadow-[1px_0_0_0_var(--border-light)]",
        ),
        headerClassName: cn(
          "w-[40px] px-2 text-center",
          variant !== "spreadsheet"
            ? "bg-surface sticky left-0 top-0 z-40 shadow-[1px_1px_0_0_var(--border-light)]"
            : "sticky top-0 z-20 shadow-[0_1px_0_0_var(--border-light)] border-r border-border h-auto",
        ),
        skeletonClassName: "",
        hideable: false,
      } satisfies DataTableRowMeta,
    });
  }

  const table = useReactTable({
    data: items,
    columns: tableColumns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: getRowKey,
    manualPagination: true,
    manualSorting: true,
    columnResizeMode: "onChange",
    state: {
      columnVisibility: internalVisibility,
      columnOrder: internalColumnOrder,
      rowSelection: rowSelection || {},
      columnSizing: internalColumnSizing,
    },
    enableRowSelection,
    onRowSelectionChange,
    onColumnVisibilityChange: handleColumnVisibilityChange,
    onColumnOrderChange: handleColumnOrderChange,
    onColumnSizingChange: handleColumnSizingChange,
  });

  const [portalTarget, setPortalTarget] = useState<Element | null>(null);

  useEffect(() => {
    if (!enableColumnVisibility) return;
    return subscribePortalTarget(setPortalTarget);
  }, [enableColumnVisibility]);

  return (
    <>
      {enableColumnVisibility && portalTarget
        ? createPortal(
            <ColumnToggle
              table={table}
              _visibility={internalVisibility}
              _order={internalColumnOrder}
            />,
            portalTarget,
          )
        : null}
      {filters && <div className="flex gap-2 mb-3 flex-wrap">{filters}</div>}
      <div
        className={cn(
          "bg-surface border border-border rounded-[10px] overflow-auto relative flex-1 min-h-0",
          elevated && "card-shadow",
          containerClassName,
        )}
      >
        <Table
          style={{
            minWidth: enableColumnResizing ? table.getTotalSize() : minWidth,
          }}
          className={cn(
            "table-fixed",
            variant === "spreadsheet" && "border-collapse border-spacing-0",
          )}
        >
          <TableHeader className="sticky top-0 z-30 bg-surface shadow-[0_1px_0_0_var(--border-light)]">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className="hover:bg-transparent border-b border-border"
              >
                {headerGroup.headers.map((header, index) => {
                  const meta = header.column.columnDef.meta as DataTableRowMeta;
                  const isFirstCol = index === 0;
                  return (
                    <TableHead
                      key={header.id}
                      className={cn(
                        meta?.headerClassName,
                        "sticky top-0 bg-surface z-20 shadow-[0_1px_0_0_var(--border-light)]",
                        isFirstCol &&
                          !enableRowSelection &&
                          variant !== "spreadsheet" &&
                          "left-0 z-30 shadow-[1px_1px_0_0_var(--border-light)]",
                        variant === "spreadsheet" &&
                          "border-r border-border px-2 py-1 h-auto text-[11px]",
                        enableColumnResizing && "relative group",
                      )}
                      style={{
                        width: enableColumnResizing
                          ? header.getSize()
                          : undefined,
                      }}
                    >
                      {header.isPlaceholder ? null : meta.sortable ? (
                        <div
                          className={cn(
                            "flex items-center gap-1 cursor-pointer hover:text-foreground transition-colors",
                            meta.headerClassName?.includes("text-right") &&
                              "justify-end",
                            meta.headerClassName?.includes("text-center") &&
                              "justify-center",
                          )}
                          onClick={() => onSort?.(meta.sortKey!)}
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                          <div className="flex flex-col -space-y-[3px]">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="10"
                              height="10"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={
                                sortBy === meta.sortKey && sortOrder === "asc"
                                  ? 3.5
                                  : 1.5
                              }
                              className={cn(
                                "transition-all duration-150",
                                sortBy === meta.sortKey
                                  ? sortOrder === "asc"
                                    ? "text-foreground"
                                    : "text-muted-foreground/5"
                                  : "text-muted-foreground/35",
                              )}
                            >
                              <path d="m18 15-6-6-6 6" />
                            </svg>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="10"
                              height="10"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={
                                sortBy === meta.sortKey && sortOrder === "desc"
                                  ? 3.5
                                  : 1.5
                              }
                              className={cn(
                                "transition-all duration-150",
                                sortBy === meta.sortKey
                                  ? sortOrder === "desc"
                                    ? "text-foreground"
                                    : "text-muted-foreground/5"
                                  : "text-muted-foreground/35",
                              )}
                            >
                              <path d="m6 9 6 6 6-6" />
                            </svg>
                          </div>
                        </div>
                      ) : (
                        flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )
                      )}
                      {enableColumnResizing && header.column.getCanResize() && (
                        <div
                          {...{
                            onMouseDown: header.getResizeHandler(),
                            onTouchStart: header.getResizeHandler(),
                            className: cn(
                              "absolute right-0 top-0 h-full w-[4px] cursor-col-resize select-none touch-none bg-transparent group-hover:bg-primary/30 z-50",
                              header.column.getIsResizing()
                                ? "bg-primary/50 w-[4px]"
                                : "",
                            ),
                          }}
                          onClick={(e) => e.stopPropagation()}
                        />
                      )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {loading &&
              Array.from({ length: loadingRows }).map((_, rowIndex) => (
                <TableRow key={rowIndex} className="hover:bg-transparent">
                  {table.getAllLeafColumns().map((column, index) => {
                    const meta = column.columnDef.meta as DataTableRowMeta;
                    const isFirstCol = index === 0;
                    return (
                      <TableCell
                        key={column.id}
                        className={cn(
                          meta.className,
                          isFirstCol &&
                            !enableRowSelection &&
                            "sticky left-0 bg-surface shadow-[1px_0_0_0_var(--border-light)] z-10",
                          variant === "spreadsheet" &&
                            "border-r border-border px-2 py-1 text-xs truncate",
                        )}
                        style={{
                          maxWidth: enableColumnResizing
                            ? column.getSize()
                            : undefined,
                        }}
                      >
                        {meta.skeletonClassName !== "" && (
                          <Skeleton
                            className={cn("h-3 w-24", meta.skeletonClassName)}
                          />
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}

            {!loading && error && (
              <TableRow className="hover:bg-transparent">
                <TableCell
                  colSpan={tableColumns.length}
                  className="text-center text-[color:var(--warn-fg)] py-10"
                >
                  {error}
                </TableCell>
              </TableRow>
            )}

            {!loading && !error && items.length === 0 && (
              <TableRow className="hover:bg-transparent">
                <TableCell
                  colSpan={tableColumns.length}
                  className="text-center text-[color:var(--faint)] py-10"
                >
                  {emptyLabel}
                </TableCell>
              </TableRow>
            )}

            {!loading &&
              !error &&
              table.getRowModel().rows.map((row) => {
                const isExpanded = expandedRowKeys?.includes(
                  getRowKey(row.original),
                );
                return (
                  <React.Fragment key={row.id}>
                    <TableRow
                      data-state={row.getIsSelected() && "selected"}
                      className={cn(
                        onRowClick && "cursor-pointer",
                        isExpanded &&
                          "bg-muted/5 font-medium border-l-2 border-l-primary",
                      )}
                      onClick={
                        onRowClick ? () => onRowClick(row.original) : undefined
                      }
                    >
                      {row.getVisibleCells().map((cell, index) => {
                        const meta = cell.column.columnDef
                          .meta as DataTableRowMeta;
                        const isFirstCol = index === 0;
                        return (
                          <TableCell
                            key={cell.id}
                            className={cn(
                              meta.className,
                              isFirstCol &&
                                !enableRowSelection &&
                                variant !== "spreadsheet" &&
                                "sticky left-0 bg-surface group-hover:bg-surface-hover shadow-[1px_0_0_0_var(--border-light)] z-10",
                              variant === "spreadsheet" &&
                                "border-r border-border px-2 py-1 text-xs truncate",
                            )}
                            style={{
                              maxWidth: enableColumnResizing
                                ? cell.column.getSize()
                                : undefined,
                            }}
                          >
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext(),
                            )}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                    {renderSubRow && isExpanded && (
                      <TableRow className="bg-muted/5 hover:bg-muted/5 border-b border-border/60">
                        <TableCell
                          colSpan={row.getVisibleCells().length}
                          className="p-4 bg-muted/20"
                        >
                          {renderSubRow(row.original)}
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                );
              })}
          </TableBody>
          {summaryRow && (
            <TableFooter>
              <TableRow className="hover:bg-transparent">
                {table.getAllLeafColumns().map((column, index) => {
                  const meta = column.columnDef.meta as DataTableRowMeta;
                  const isFirstCol = index === 0;
                  return (
                    <TableCell
                      key={column.id}
                      className={cn(
                        meta.className,
                        isFirstCol &&
                          !enableRowSelection &&
                          "sticky left-0 bg-muted/50 z-10 shadow-[1px_0_0_0_var(--border-light)]",
                        variant === "spreadsheet" &&
                          "border-r border-border px-2 py-1 text-xs truncate font-semibold",
                      )}
                      style={{
                        maxWidth: enableColumnResizing
                          ? column.getSize()
                          : undefined,
                      }}
                    >
                      {summaryRow[column.id] !== undefined
                        ? summaryRow[column.id]
                        : null}
                    </TableCell>
                  );
                })}
              </TableRow>
            </TableFooter>
          )}
        </Table>
      </div>
      {showPagination && (
        <TablePagination
          page={page}
          pageSize={pageSize}
          total={total}
          totalPages={totalPages}
          onPage={onPage}
          onPageSize={onPageSize}
        />
      )}
    </>
  );
}
