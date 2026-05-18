import type { ReactNode } from "react";
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
  cell: (item: T) => ReactNode;
  className?: string;
  headerClassName?: string;
  skeletonClassName?: string;
}

interface DataTableRowMeta {
  className?: string;
  skeletonClassName?: string;
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
  page?: number;
  pageSize?: number;
  total?: number;
  totalPages?: number;
  onPage?: (page: number) => void;
  onPageSize?: (pageSize: number) => void;
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
  page,
  pageSize,
  total,
  totalPages,
  onPage,
  onPageSize,
}: DataTableProps<T>) {
  const showPagination =
    page != null &&
    pageSize != null &&
    total != null &&
    totalPages != null &&
    !!onPage &&
    !!onPageSize;

  const tableColumns = columns.map<ColumnDef<T, unknown>>((column) => ({
    id: column.key,
    header: () => column.header,
    cell: ({ row }) => column.cell(row.original),
    meta: {
      className: column.className,
      skeletonClassName: column.skeletonClassName,
    } satisfies DataTableRowMeta,
  }));

  const table = useReactTable({
    data: items,
    columns: tableColumns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: getRowKey,
    manualPagination: true,
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
        <Table style={{ minWidth }}>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className="hover:bg-transparent border-b border-border"
              >
                {headerGroup.headers.map((header) => {
                  const column = columns.find((x) => x.key === header.id);
                  return (
                    <TableHead
                      key={header.id}
                      className={column?.headerClassName}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
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
                  colSpan={columns.length}
                  className="text-center text-[color:var(--warn-fg)] py-10"
                >
                  {error}
                </TableCell>
              </TableRow>
            )}

            {!loading && !error && items.length === 0 && (
              <TableRow className="hover:bg-transparent">
                <TableCell
                  colSpan={columns.length}
                  className="text-center text-[color:var(--faint)] py-10"
                >
                  {emptyLabel}
                </TableCell>
              </TableRow>
            )}

            {!loading &&
              !error &&
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => {
                    const meta = cell.column.columnDef.meta as DataTableRowMeta;
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
              ))}
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
