import React, { type ReactNode } from "react";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import { Skeleton } from "@/shared/components/Skeleton";
import { TablePagination } from "@/shared/components/TablePagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
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
}

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
  elevated = true,
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
}: DataTableProps<T>) {
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
      meta: {
        className: column.className,
        headerClassName: column.headerClassName,
        skeletonClassName: column.skeletonClassName,
        sortable: column.sortable,
        sortKey: column.sortKey || column.key,
      } satisfies DataTableRowMeta,
    }),
  );

  if (actionsColumn) {
    tableColumns.unshift({
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
        className: actionsColumn.className,
        headerClassName: actionsColumn.headerClassName ?? "w-[48px]",
        skeletonClassName: "",
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
  });

  return (
    <>
      {filters && <div className="flex gap-2 mb-3 flex-wrap">{filters}</div>}
      <div
        className={cn(
          "bg-surface border border-border rounded-[10px] overflow-x-auto",
          elevated && "card-shadow",
          containerClassName,
        )}
      >
        <Table style={{ minWidth }} className="table-fixed">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className="hover:bg-transparent border-b border-border"
              >
                {headerGroup.headers.map((header) => {
                  const meta = header.column.columnDef.meta as DataTableRowMeta;
                  return (
                    <TableHead
                      key={header.id}
                      className={meta?.headerClassName}
                    >
                      {header.isPlaceholder ? null : meta.sortable ? (
                        <div
                          className="flex items-center gap-1 cursor-pointer hover:text-foreground transition-colors"
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
                  {table.getAllLeafColumns().map((column) => {
                    const meta = column.columnDef.meta as DataTableRowMeta;
                    return (
                      <TableCell key={column.id} className={meta.className}>
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
                      {row.getVisibleCells().map((cell) => {
                        const meta = cell.column.columnDef
                          .meta as DataTableRowMeta;
                        return (
                          <TableCell key={cell.id} className={meta.className}>
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
                          colSpan={tableColumns.length}
                          className="p-4 pl-14 bg-muted/20"
                        >
                          {renderSubRow(row.original)}
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                );
              })}
          </TableBody>
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
