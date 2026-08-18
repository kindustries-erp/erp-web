import React from "react";
import { RotateCcw } from "lucide-react";
import { Tooltip } from "@/core/components/ui/Tooltip";
import { Button } from "@/shared/components/ui/Button";
import { DataTable, type DataTableColumn } from "@/shared/components/DataTable";
import {
  ActionDropdown,
  type ActionDropdownItem,
} from "@/shared/components/ActionDropdown";
import type { Updater, VisibilityState } from "@tanstack/react-table";

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
  expandedRowKeys?: string[];
  onToggleExpand?: (id: string) => void;
  getRowKey: (row: T) => string;
  emptyLabel?: string;
  minWidth?: number;
  loading?: boolean;
  error?: string | null;
  actions?: (row: T) => ActionDropdownItem[];
  actionColumnSize?: number;
  enableRowHoverActions?: boolean;
  hideLegacyActionColumn?: boolean;
  renderSubRow?: (row: T) => React.ReactNode;
  onRowClick?: (row: T) => void;
  enableColumnVisibility?: boolean;
  defaultColumnVisibility?: VisibilityState;
  tableId?: string;
  enableColumnResizing?: boolean;
  enableRowSelection?: boolean;
  rowSelection?: Record<string, boolean>;
  onRowSelectionChange?: (updater: Updater<Record<string, boolean>>) => void;
  variant?: "default" | "spreadsheet";
  summaryRow?: Record<string, React.ReactNode>;
  containerClassName?: string;
  defaultColumnOrder?: string[];
  sidePanel?: React.ReactNode;
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
  expandedRowKeys,
  getRowKey,
  emptyLabel = "Chưa có dữ liệu.",
  minWidth = 1000,
  loading = false,
  error = null,
  actions,
  actionColumnSize,
  enableRowHoverActions = true,
  hideLegacyActionColumn = false,
  renderSubRow,
  onRowClick,
  enableColumnVisibility = true,
  defaultColumnVisibility,
  tableId,
  enableColumnResizing,
  enableRowSelection,
  rowSelection,
  onRowSelectionChange,
  variant,
  summaryRow,
  containerClassName,
  defaultColumnOrder,
  sidePanel,
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
      sortArray={sortArray}
      onSort={onSort}
      getRowKey={getRowKey}
      emptyLabel={emptyLabel}
      minWidth={minWidth}
      loadingRows={loadingRows}
      loading={loading}
      error={error}
      actionsColumn={
        actions && !hideLegacyActionColumn
          ? {
              header: tableId ? (
                <Tooltip content="Khôi phục độ rộng">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (tableId) {
                        const event = new CustomEvent(
                          `reset-column-sizing-${tableId}`,
                        );
                        window.dispatchEvent(event);
                      }
                    }}
                  >
                    <RotateCcw className="h-3.5 w-3.5 text-muted-foreground" />
                  </Button>
                </Tooltip>
              ) : (
                ""
              ),
              cell: (row) => <ActionDropdown items={actions(row)} />,
              size: actionColumnSize,
              minSize: actionColumnSize,
              maxSize: actionColumnSize,
            }
          : undefined
      }
      rowHoverActions={
        actions && enableRowHoverActions !== false
          ? (row) => actions(row)
          : undefined
      }
      expandedRowKeys={
        expandedRowKeys ||
        (expandedRowIds
          ? Object.keys(expandedRowIds).filter((key) => expandedRowIds[key])
          : undefined)
      }
      renderSubRow={renderSubRow}
      enableColumnVisibility={enableColumnVisibility}
      defaultColumnVisibility={defaultColumnVisibility}
      tableId={tableId}
      enableColumnResizing={enableColumnResizing}
      enableRowSelection={enableRowSelection}
      rowSelection={rowSelection}
      onRowSelectionChange={onRowSelectionChange}
      variant={variant}
      summaryRow={summaryRow}
      containerClassName={containerClassName}
      defaultColumnOrder={defaultColumnOrder}
      sidePanel={sidePanel}
    />
  );
}
