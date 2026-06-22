import React from "react";
import { DataTable, type DataTableColumn } from "@/shared/components/DataTable";
import {
  ActionDropdown,
  type ActionItem,
} from "@/shared/components/ActionDropdown";

export interface StandardTableProps<T> {
  items: T[];
  columns: DataTableColumn<T>[];
  total?: number;
  totalPages?: number;
  page?: number;
  pageSize?: number;
  onPage?: (page: number) => void;
  onPageSize?: (size: number) => void;
  sortArray?: string[];
  onSort?: (colId: string) => void;
  loadingRows?: number;
  expandedRowIds?: Record<string, boolean>;
  onToggleExpand?: (id: string) => void;
  getRowKey: (row: T) => string;
  emptyLabel?: string;
  minWidth?: number;
  loading?: boolean;
  error?: string | null;
  actions?: (row: T) => ActionItem[];
  renderSubRow?: (row: T) => React.ReactNode;
  onRowClick?: (row: T) => void;
  enableColumnVisibility?: boolean;
  tableId?: string;
}

export function StandardTable<T>({
  items,
  columns,
  total,
  totalPages,
  page,
  pageSize,
  onPage,
  onPageSize,
  sortArray,
  onSort,
  loadingRows,
  expandedRowIds,
  getRowKey,
  emptyLabel = "Chưa có dữ liệu.",
  minWidth = 1000,
  loading = false,
  error = null,
  actions,
  renderSubRow,
  onRowClick,
  enableColumnVisibility = true,
  tableId,
}: StandardTableProps<T>) {
  return (
    <DataTable
      columns={columns}
      items={items}
      total={total}
      totalPages={totalPages}
      page={page}
      pageSize={pageSize}
      onPage={onPage}
      onPageSize={onPageSize}
      onRowClick={onRowClick}
      sortBy={
        sortArray?.[0]?.startsWith("-") ? sortArray[0].slice(1) : sortArray?.[0]
      }
      sortOrder={sortArray?.[0]?.startsWith("-") ? "desc" : "asc"}
      onSort={onSort}
      getRowKey={getRowKey}
      emptyLabel={emptyLabel}
      minWidth={minWidth}
      loadingRows={loadingRows}
      loading={loading}
      error={error}
      actionsColumn={
        actions
          ? {
              header: "",
              cell: (row) => <ActionDropdown items={actions(row)} />,
            }
          : undefined
      }
      expandedRowKeys={
        expandedRowIds
          ? Object.keys(expandedRowIds).filter((key) => expandedRowIds[key])
          : undefined
      }
      renderSubRow={renderSubRow}
      enableColumnVisibility={enableColumnVisibility}
      tableId={tableId}
    />
  );
}
