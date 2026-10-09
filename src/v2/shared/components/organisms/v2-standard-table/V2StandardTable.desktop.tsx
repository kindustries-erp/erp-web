import * as React from "react";
import { getCoreRowModel, useReactTable } from "@tanstack/react-table";
import type { ColumnSizingState, Updater } from "@tanstack/react-table";
import { V2TablePagination } from "@/v2/shared/components/molecules/v2-table-pagination";
import { V2TableContextMenu } from "@/v2/shared/components/molecules/v2-table-row-actions";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { cn } from "@/v2/shared/utils/cn";
import { useV2TableColumns } from "./V2StandardTable.hook";
import { V2TableGrid } from "./V2StandardTable.grid";
import { useV2TableController } from "./V2StandardTable.controller.hook";
import { useV2FilterPanelToolbar } from "./V2StandardTable.filterpanel.hook";
import { V2TableFilterPanel } from "./V2StandardTable.filterpanel";
import { useV2DesktopToolbar } from "./V2StandardTable.toolbar.hook";
import { useV2TableScroll } from "./V2StandardTable.scroll.hook";
import { useV2TableSummary } from "./V2StandardTable.summary.hook";
import { useV2HeaderFilters } from "./V2StandardTable.filter.hook";
import { useV2RowMenu } from "./V2StandardTable.menu.hook";
import { useV2ColumnPreferences } from "./V2StandardTable.preferences.hook";
import { V2TableToolbar } from "./V2StandardTable.toolbar";
import type { V2StandardTableProps } from "./V2StandardTable.type";

export function V2StandardTableDesktop<T>(props: V2StandardTableProps<T>) {
  const { tableId, columns, getRowKey, rowActions, loading = false } = props;
  const enableRowSelection = props.enableRowSelection ?? false;
  const { t } = useV2Translation();
  const { mode, state, columnsByKey, view, selection } =
    useV2TableController(props);
  const columnKeys = React.useMemo(() => columns.map((c) => c.key), [columns]);
  const prefs = useV2ColumnPreferences({
    tableId,
    columnKeys,
    storage: props.preferencesStorage,
  });
  const { columnDefs, columnOrder, columnVisibility } = useV2TableColumns({
    columns,
    prefs,
    enableRowSelection,
    startIndex: view.startIndex,
  });
  const filters = useV2HeaderFilters({
    tableId,
    columnsByKey,
    fetchOptionsFor: view.fetchOptionsFor,
    filtersStrFor: view.filtersStrFor,
  });
  const scroll = useV2TableScroll(view.rows.length, loading);
  const summaryValues = useV2TableSummary({
    columns,
    mode,
    query: state.query,
    allRows: view.allRows,
    pageRows: view.rows,
    loading,
  });
  const hasSummary = columns.some((column) => column.summary);
  const totalPages = Math.max(1, Math.ceil(view.total / state.query.pageSize));
  const { menu, menuRowKey, menuGroups } = useV2RowMenu(
    view.rows,
    getRowKey,
    rowActions,
  );

  const table = useReactTable({
    data: view.rows,
    columns: columnDefs,
    getCoreRowModel: getCoreRowModel(),
    getRowId: getRowKey,
    enableRowSelection,
    columnResizeMode: "onEnd",
    state: {
      columnOrder,
      columnVisibility,
      columnSizing: prefs.sizing,
      rowSelection: selection.rowSelection,
    },
    onRowSelectionChange: selection.onRowSelectionChange,
    onColumnSizingChange: (updater: Updater<ColumnSizingState>) =>
      prefs.setSizing(
        typeof updater === "function" ? updater(prefs.sizing) : updater,
      ),
  });

  const layoutKey = React.useMemo(
    () =>
      [
        columnOrder.join(),
        JSON.stringify(columnVisibility),
        JSON.stringify(prefs.sizing),
      ].join("|"),
    [columnOrder, columnVisibility, prefs.sizing],
  );
  const { panel, toolbarConfig } = useV2FilterPanelToolbar({
    toolbar: props.toolbar,
    columns,
    filters,
    canFilter: (c) => Boolean(c.filter && view.fetchOptionsFor(c)),
    committedSearchOf: (key) => state.query.columnSearch[key] ?? "",
  });
  const { isFullscreen, toolbarProps } = useV2DesktopToolbar(
    prefs,
    columnsByKey,
    toolbarConfig,
    () => selection.onRowSelectionChange({}),
  );

  return (
    <div
      className={cn(
        "flex h-full min-h-0 flex-col gap-2",
        props.className,
        isFullscreen && "fixed inset-0 z-[60] h-auto bg-background p-4",
      )}
    >
      <V2TableToolbar
        activeFilterCount={state.activeFilterCount}
        onClearAllFilters={state.resetAll}
        selectedCount={selection.selectedCount}
        toolbarExtra={props.toolbarExtra}
        loading={loading}
        search={{ value: state.query.search ?? "", onChange: state.setSearch }}
        {...toolbarProps}
      />
      <div className="flex min-h-0 flex-1 gap-2">
        <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-2">
          <div
            ref={scroll.scrollRef}
            className={cn(
              "relative flex min-h-0 w-full flex-1 flex-col overflow-auto rounded-xl border border-border/60 bg-surface transition-shadow duration-150",
              scroll.isScrolledTop &&
                "shadow-[inset_0_4px_6px_-2px_rgba(0,0,0,0.05)]",
              scroll.isScrolledBottom &&
                "shadow-[inset_0_-4px_6px_-2px_rgba(0,0,0,0.05)]",
              props.containerClassName,
            )}
          >
            <V2TableGrid
              table={table}
              columnsByKey={columnsByKey}
              state={state}
              fetchOptionsFor={view.fetchOptionsFor}
              filters={filters}
              layoutKey={layoutKey}
              loading={loading}
              emptyLabel={
                props.emptyLabel ?? t("v2.table.empty", "Không có dữ liệu")
              }
              loadingLabel={t("v2.table.loading", "Đang tải dữ liệu...")}
              menuRowKey={menuRowKey}
              rowActions={rowActions}
              getRowClassName={props.getRowClassName}
              onRowContextMenu={menu.open}
              summary={
                hasSummary
                  ? {
                      values: summaryValues,
                      page: state.query.page,
                      totalPages,
                    }
                  : undefined
              }
            />
          </div>
          <V2TablePagination
            page={state.query.page}
            pageSize={state.query.pageSize}
            total={view.total}
            onPageChange={state.setPage}
            onPageSizeChange={state.setPageSize}
            className="mt-2 shrink-0"
          />
        </div>
        {panel.open && (
          <V2TableFilterPanel
            panel={panel}
            columns={columns}
            state={state}
            filters={filters}
            extraContent={props.toolbar?.filterPanel?.extraContent}
          />
        )}
      </div>
      <V2TableContextMenu
        position={menu.state ? { x: menu.state.x, y: menu.state.y } : null}
        groups={menuGroups}
        onClose={menu.close}
      />
    </div>
  );
}
