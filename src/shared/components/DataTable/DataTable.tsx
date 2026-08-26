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
  enableColumnVisibility = true,
  defaultColumnVisibility,
  tableId,
  enableColumnResizing = false,
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
  fullscreenClassName,
  fullscreenHeaderExtra,
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

  const { isFullscreen, toggleFullscreen, closeFullscreen } =
    useDataTableFullscreen({
      onFullscreenChange,
    });

  const { scrollContainerRef, isScrolledTop, isScrolledBottom } =
    useDataTableScroll({
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
    state: {
      columnVisibility: internalVisibility,
      columnOrder: internalColumnOrder,
      rowSelection: rowSelection || {},
      columnSizing: internalColumnSizing,
    },
    onColumnVisibilityChange: handleColumnVisibilityChange,
    onColumnOrderChange: handleColumnOrderChange,
    onRowSelectionChange: onRowSelectionChange,
    onColumnSizingChange: handleColumnSizingChange,
    columnResizeMode: "onChange",
    enableColumnResizing,
    meta: tableMeta,
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
            className={cn(
              "bg-surface transition-shadow duration-150 flex-1 min-h-0 flex flex-col relative w-full",
              elevated && "rounded-lg border border-border shadow-xs",
              variant === "spreadsheet"
                ? "border border-border/80 rounded-none overflow-x-auto overflow-y-auto"
                : "border border-border/60 rounded-xl overflow-x-auto overflow-y-auto",
              isScrolledTop &&
                variant !== "spreadsheet" &&
                "shadow-[inset_0_4px_6px_-2px_rgba(0,0,0,0.05)]",
              isScrolledBottom &&
                variant !== "spreadsheet" &&
                "shadow-[inset_0_-4px_6px_-2px_rgba(0,0,0,0.05)]",
              containerClassName,
            )}
          >
            <Table
              className={cn(
                "border-collapse border-spacing-0 w-full",
                variant === "spreadsheet" ? "table-fixed" : "",
              )}
              style={{
                minWidth: isFsView ? undefined : minWidth,
                width:
                  variant === "spreadsheet"
                    ? `${table.getCenterTotalSize()}px`
                    : undefined,
              }}
            >
              <TableHeader
                className={cn(
                  variant === "spreadsheet"
                    ? "sticky top-0 z-20 bg-muted border-b border-border shadow-[0_1px_0_0_var(--border-light)]"
                    : "sticky top-0 z-20 bg-muted border-b border-border shadow-[0_1px_0_0_var(--border-light)]",
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
                            isFirstCol &&
                              !enableRowSelection &&
                              variant !== "spreadsheet" &&
                              "sticky left-0 bg-muted shadow-[1px_0_0_0_var(--border-light)] z-30",
                            variant === "spreadsheet" &&
                              "border-r border-border py-1 text-xs select-none relative",
                            variant === "spreadsheet" &&
                              ![
                                "__actions",
                                "__selection",
                                "__expand",
                              ].includes(header.column.id) &&
                              "px-2 truncate",
                          )}
                          style={{
                            width: isActionsCol ? actionsWidth : undefined,
                            minWidth: isActionsCol ? actionsWidth : undefined,
                            maxWidth: isActionsCol
                              ? actionsWidth
                              : enableColumnResizing
                                ? header.column.getSize()
                                : undefined,
                          }}
                        >
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext(),
                              )}
                          {enableColumnResizing &&
                            header.column.getCanResize() && (
                              <div
                                onMouseDown={header.getResizeHandler()}
                                onTouchStart={header.getResizeHandler()}
                                className={cn(
                                  "absolute right-0 top-0 h-full w-1 cursor-col-resize user-select-none touch-none hover:bg-primary/50",
                                  header.column.getIsResizing()
                                    ? "bg-primary w-1.5"
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
          total={total}
          fullscreenClassName={fullscreenClassName}
          fullscreenHeaderExtra={fullscreenHeaderExtra}
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
