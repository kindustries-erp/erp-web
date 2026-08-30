import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";
import {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableRow,
  TableHead,
  TableCell,
} from "@/shared/components/ui/table";
import { Skeleton } from "@/shared/components/Skeleton";
import { TablePagination } from "@/shared/components/TablePagination";
import { subscribePortalTarget } from "@/shared/components/portalStore";
import { useT } from "@/core/i18n";
import { cn } from "@/shared/utils";

import type { DataTableProps, DataTableRowMeta } from "./types";
import { useDataTablePreferences } from "./hooks/useDataTablePreferences";
import { useDataTableColumns } from "./hooks/useDataTableColumns";
import { useDataTableScroll } from "./hooks/useDataTableScroll";
import { useDataTableFullscreen } from "./hooks/useDataTableFullscreen";
import { ColumnToggle } from "./components/ColumnToggle";
import { FullscreenToggle } from "./components/FullscreenToggle";
import { DataTableRowMemo } from "./components/DataTableRow";
import {
  FullscreenPlaceholder,
  FullscreenModal,
} from "./components/FullscreenModal";
import { TableRowContextMenu } from "./TableRowContextMenu";
import type { ActionDropdownItem } from "@/shared/components/ActionDropdown";

export function DataTable<T>({
  items,
  columns,
  getRowKey,
  loading = false,
  emptyLabel,
  filters,
  minWidth = 800,
  loadingRows = 5,
  elevated = false,
  containerClassName,
  actionsColumn,
  rowHoverActions,
  page,
  pageSize,
  pageSizeOptions,
  paginationClassName,
  total,
  totalPages,
  onPage,
  onPageSize,
  onRowClick,
  getRowClassName,
  enableRowContextMenu = true,
  onRowContextMenu,
  renderSubRow,
  expandedRowKeys,
  sortBy,
  sortOrder,
  sortArray,
  onSort,
  enableColumnVisibility = true,
  defaultColumnVisibility,
  tableId,
  enableColumnResizing = true,
  enableRowSelection = false,
  rowSelection,
  onRowSelectionChange,
  variant = "default",
  summaryRow,
  defaultColumnOrder,
  sidePanel,
  tableMeta,
  enableFullscreen,
  tableTitle,
  tableDesc,
  tableIcon,
  fullscreenClassName,
  fullscreenHeaderExtra,
  fullscreenTabs,
  onFullscreenChange,
}: DataTableProps<T>) {
  const t = useT();

  const {
    internalVisibility,
    internalColumnOrder,
    internalColumnSizing,
    handleColumnVisibilityChange,
    handleColumnOrderChange,
    handleColumnSizingChange,
    handleResetTableLayout,
  } = useDataTablePreferences({
    tableId,
    defaultColumnVisibility,
    defaultColumnOrder,
  });

  const { isFullscreen, isExiting, toggleFullscreen, closeFullscreen } =
    useDataTableFullscreen({
      onFullscreenChange,
    });

  const {
    scrollContainerRef,
    isScrolledTop,
    isScrolledBottom,
    handleTableScroll,
  } = useDataTableScroll({
    items,
    loading,
  });

  const tableColumns = useDataTableColumns({
    columns,
    actionsColumn,
    rowHoverActions,
    enableRowSelection,
    page,
    pageSize,
    variant,
  });

  const table = useReactTable({
    data: items,
    columns: tableColumns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: getRowKey,
    manualPagination: true,
    manualSorting: true,
    columnResizeMode: "onChange",
    meta: tableMeta,
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

  // Portal target subscription for toolbar controls
  const [portalTarget, setPortalTarget] = useState<Element | null>(null);

  useEffect(() => {
    if (!tableId || (!enableColumnVisibility && !enableFullscreen)) return;
    return subscribePortalTarget(tableId, setPortalTarget);
  }, [tableId, enableColumnVisibility, enableFullscreen]);

  // Context menu state
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    items: ActionDropdownItem[];
    rowKey: string;
  } | null>(null);

  useEffect(() => {
    const handleCloseMenu = () => setContextMenu(null);
    if (contextMenu) {
      window.addEventListener("click", handleCloseMenu);
      window.addEventListener("contextmenu", handleCloseMenu);
      return () => {
        window.removeEventListener("click", handleCloseMenu);
        window.removeEventListener("contextmenu", handleCloseMenu);
      };
    }
  }, [contextMenu]);

  const renderTableContent = (isFsView = false) => {
    return (
      <div className="flex flex-col flex-1 min-h-0 w-full relative">
        {filters && (
          <div className="mb-4 flex flex-wrap items-center gap-2 shrink-0">
            {filters}
          </div>
        )}

        <div className="flex items-stretch flex-1 min-h-0 w-full relative">
          <div
            ref={!isFsView ? scrollContainerRef : undefined}
            onScroll={!isFsView ? handleTableScroll : undefined}
            className={cn(
              "bg-surface transition-shadow duration-150 flex-1 min-h-0 flex flex-col relative w-full",
              elevated && "rounded-lg border border-border shadow-xs",
              "border border-border/60 rounded-xl overflow-x-auto overflow-y-auto",
              isScrolledTop && "shadow-[inset_0_4px_6px_-2px_rgba(0,0,0,0.05)]",
              isScrolledBottom &&
                "shadow-[inset_0_-4px_6px_-2px_rgba(0,0,0,0.05)]",
              containerClassName,
            )}
          >
            <Table
              className={cn(
                "table-fixed",
                variant === "spreadsheet" && "border-collapse border-spacing-0",
              )}
              style={{
                minWidth: enableColumnResizing
                  ? table.getTotalSize()
                  : isFsView
                    ? undefined
                    : minWidth,
                width: "100%",
              }}
            >
              <TableHeader
                className={cn(
                  "sticky top-0 z-20 bg-muted border-b border-border shadow-[0_1px_0_0_var(--border-light)]",
                )}
              >
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow
                    key={headerGroup.id}
                    className={cn(
                      "hover:bg-transparent border-none",
                      variant === "spreadsheet" ? "h-7" : "",
                    )}
                  >
                    {headerGroup.headers.map((header, index) => {
                      const isHoverActionsCol =
                        header.column.id === "__hover_actions";
                      if (isHoverActionsCol) {
                        return (
                          <TableHead
                            key={header.id}
                            className="w-[116px] min-w-[116px] max-w-[116px] p-0 m-0 border-r border-border"
                            style={{
                              width: 116,
                              minWidth: 116,
                              maxWidth: 116,
                            }}
                          />
                        );
                      }
                      const meta = header.column.columnDef
                        .meta as DataTableRowMeta;
                      const isFirstCol = index === 0;
                      const isActionsCol = header.column.id === "__actions";
                      const actionsWidth = header.column.getSize();
                      return (
                        <TableHead
                          key={header.id}
                          className={cn(
                            meta?.headerClassName,
                            "sticky top-0 bg-transparent z-20 border-r border-border",
                            isFirstCol &&
                              !enableRowSelection &&
                              variant !== "spreadsheet" &&
                              "left-0 z-35 bg-muted shadow-[1px_0_0_0_var(--border-light)]",
                            variant === "spreadsheet" &&
                              "border-r border-border py-1 h-auto text-[11px]",
                            variant === "spreadsheet" &&
                              ![
                                "__actions",
                                "__selection",
                                "__expand",
                              ].includes(header.column.id) &&
                              "px-2 truncate",
                            enableColumnResizing && "relative group",
                          )}
                          style={{
                            width: isActionsCol
                              ? actionsWidth
                              : enableColumnResizing ||
                                  header.column.columnDef.size !== undefined
                                ? header.getSize()
                                : undefined,
                            minWidth: isActionsCol
                              ? actionsWidth
                              : (header.column.columnDef.minSize ??
                                (header.column.columnDef.size !== undefined
                                  ? header.getSize()
                                  : undefined)),
                            maxWidth: isActionsCol
                              ? actionsWidth
                              : (header.column.columnDef.maxSize ?? undefined),
                          }}
                        >
                          {header.isPlaceholder ? null : meta?.sortable ? (
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
                                    sortArray
                                      ? sortArray.includes(meta.sortKey!)
                                        ? 3.5
                                        : 1.5
                                      : sortBy === meta.sortKey &&
                                          sortOrder === "asc"
                                        ? 3.5
                                        : 1.5
                                  }
                                  className={cn(
                                    "transition-all duration-150",
                                    sortArray
                                      ? sortArray.includes(meta.sortKey!)
                                        ? "text-foreground"
                                        : "text-muted-foreground/35"
                                      : sortBy === meta.sortKey
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
                                    sortArray
                                      ? sortArray.includes(`-${meta.sortKey!}`)
                                        ? 3.5
                                        : 1.5
                                      : sortBy === meta.sortKey &&
                                          sortOrder === "desc"
                                        ? 3.5
                                        : 1.5
                                  }
                                  className={cn(
                                    "transition-all duration-150",
                                    sortArray
                                      ? sortArray.includes(`-${meta.sortKey!}`)
                                        ? "text-foreground"
                                        : "text-muted-foreground/35"
                                      : sortBy === meta.sortKey
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
                          {enableColumnResizing &&
                            header.column.getCanResize() && (
                              <div
                                onDoubleClick={() => header.column.resetSize()}
                                onMouseDown={header.getResizeHandler()}
                                onTouchStart={header.getResizeHandler()}
                                className={cn(
                                  "absolute right-0 top-0 h-full w-[5px] cursor-col-resize user-select-none touch-none hover:bg-primary/50 transition-colors",
                                  header.column.getIsResizing()
                                    ? "bg-primary w-[2px]"
                                    : "bg-transparent",
                                )}
                              />
                            )}
                        </TableHead>
                      );
                    })}
                    <TableHead
                      className="w-auto p-0 m-0 border-none"
                      style={{ width: "auto" }}
                    />
                  </TableRow>
                ))}
              </TableHeader>

              <TableBody>
                {loading ? (
                  Array.from({ length: loadingRows }).map((_, index) => (
                    <TableRow
                      key={index}
                      className={cn(variant === "spreadsheet" ? "h-7" : "")}
                    >
                      {table.getVisibleLeafColumns().map((column) => {
                        const meta = column.columnDef.meta as DataTableRowMeta;
                        return (
                          <TableCell
                            key={column.id}
                            className={cn(
                              meta?.className,
                              variant === "spreadsheet" &&
                                "border-r border-border py-1 px-2",
                            )}
                            style={{
                              maxWidth: enableColumnResizing
                                ? column.getSize()
                                : undefined,
                            }}
                          >
                            <Skeleton
                              className={cn(
                                "h-4 w-full",
                                meta?.skeletonClassName,
                              )}
                            />
                          </TableCell>
                        );
                      })}
                      <TableCell className="w-auto p-0 m-0 border-none" />
                    </TableRow>
                  ))
                ) : items.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={table.getVisibleLeafColumns().length + 1}
                      className="h-32 text-center text-muted-foreground select-none"
                    >
                      {emptyLabel || t("table.empty", "Chưa có dữ liệu.")}
                    </TableCell>
                  </TableRow>
                ) : (
                  table.getRowModel().rows.map((row, index) => {
                    const rowKey = getRowKey ? getRowKey(row.original) : row.id;
                    const isExpanded = expandedRowKeys?.includes(rowKey);
                    const isSelected = row.getIsSelected();
                    const isContextMenuActive = contextMenu?.rowKey === rowKey;

                    return (
                      <DataTableRowMemo
                        key={rowKey}
                        row={row}
                        rowKey={rowKey}
                        isExpanded={isExpanded}
                        isContextMenuActive={isContextMenuActive}
                        rowIndex={index}
                        isSelected={isSelected}
                        getRowClassName={getRowClassName}
                        onRowClick={onRowClick}
                        onRowContextMenu={onRowContextMenu}
                        enableRowContextMenu={enableRowContextMenu}
                        rowHoverActions={rowHoverActions}
                        setContextMenu={setContextMenu}
                        variant={variant}
                        enableRowSelection={enableRowSelection}
                        enableColumnResizing={enableColumnResizing}
                        renderSubRow={renderSubRow}
                      />
                    );
                  })
                )}
              </TableBody>

              {summaryRow && items.length > 0 && !loading && (
                <TableFooter className="sticky bottom-0 z-20 bg-muted/80 backdrop-blur-sm border-t border-border font-semibold shadow-[0_-1px_0_0_var(--border-light)]">
                  <TableRow className="hover:bg-transparent">
                    {table.getVisibleLeafColumns().map((column) => {
                      const meta = column.columnDef.meta as DataTableRowMeta;
                      const summaryContent = summaryRow[column.id];
                      return (
                        <TableCell
                          key={column.id}
                          className={cn(
                            meta?.className,
                            variant === "spreadsheet" &&
                              "border-r border-border py-1.5 px-2 text-xs",
                          )}
                          style={{
                            maxWidth: enableColumnResizing
                              ? column.getSize()
                              : undefined,
                          }}
                        >
                          {summaryContent ?? null}
                        </TableCell>
                      );
                    })}
                    <TableCell className="w-auto p-0 m-0 border-none" />
                  </TableRow>
                </TableFooter>
              )}
            </Table>
          </div>

          {sidePanel && (
            <div className="shrink-0 relative z-30">{sidePanel}</div>
          )}
        </div>

        {total !== undefined && onPage && onPageSize && (
          <div className={cn("mt-4 shrink-0", paginationClassName)}>
            <TablePagination
              page={page || 1}
              pageSize={pageSize || 20}
              total={total}
              totalPages={totalPages || Math.ceil(total / (pageSize || 20))}
              onPage={onPage}
              onPageSize={onPageSize}
              pageSizeOptions={pageSizeOptions}
            />
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {portalTarget &&
        createPortal(
          <div className="flex items-center gap-1.5 shrink-0">
            {enableColumnVisibility && (
              <ColumnToggle
                table={table}
                _visibility={internalVisibility}
                _order={internalColumnOrder}
                onReset={handleResetTableLayout}
              />
            )}
            {enableFullscreen && (
              <FullscreenToggle
                isFullscreen={isFullscreen}
                onToggle={toggleFullscreen}
              />
            )}
          </div>,
          portalTarget,
        )}

      {/* Normal / In-place Table View */}
      {isFullscreen ? (
        <FullscreenPlaceholder
          tableTitle={tableTitle}
          tableDesc={tableDesc}
          tableIcon={tableIcon}
          onExit={closeFullscreen}
        />
      ) : (
        renderTableContent(false)
      )}

      {/* Fullscreen Modal View */}
      {isFullscreen && (
        <FullscreenModal
          table={table}
          tableTitle={tableTitle}
          tableDesc={tableDesc}
          tableIcon={tableIcon}
          total={total}
          isExiting={isExiting}
          fullscreenClassName={fullscreenClassName}
          fullscreenHeaderExtra={fullscreenHeaderExtra}
          fullscreenTabs={fullscreenTabs}
          enableColumnVisibility={enableColumnVisibility}
          internalVisibility={internalVisibility}
          internalColumnOrder={internalColumnOrder}
          onResetTableLayout={handleResetTableLayout}
          onExit={closeFullscreen}
        >
          {renderTableContent(true)}
        </FullscreenModal>
      )}

      {contextMenu && (
        <TableRowContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          items={contextMenu.items}
          isOpen={Boolean(contextMenu)}
          onClose={() => setContextMenu(null)}
        />
      )}
    </>
  );
}
