import * as React from "react";
import { getCoreRowModel, useReactTable } from "@tanstack/react-table";
import type { ColumnSizingState, Updater } from "@tanstack/react-table";
import type { V2ColumnToggleItem } from "@/v2/shared/components/molecules/v2-column-toggle";
import { V2TablePagination } from "@/v2/shared/components/molecules/v2-table-pagination";
import { V2TableContextMenu } from "@/v2/shared/components/molecules/v2-table-row-actions";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { cn } from "@/v2/shared/utils/cn";
import { V2TableBodyRows } from "./V2StandardTable.body";
import { useV2TableColumns } from "./V2StandardTable.hook";
import {
  V2TableHeaderRows,
  V2_ROW_ACTIONS_COLUMN_WIDTH,
} from "./V2StandardTable.header";
import { useV2TableController } from "./V2StandardTable.controller.hook";
import { useV2TableScroll } from "./V2StandardTable.scroll.hook";
import { useV2HeaderFilters } from "./V2StandardTable.filter.hook";
import { useV2RowMenu } from "./V2StandardTable.menu.hook";
import { useV2ColumnPreferences } from "./V2StandardTable.preferences.hook";
import { V2TableToolbar } from "./V2StandardTable.toolbar";
import type { V2StandardTableProps } from "./V2StandardTable.type";

export function V2StandardTableDesktop<T>(props: V2StandardTableProps<T>) {
  const { tableId, columns, getRowKey, rowActions, loading = false } = props;
  const enableRowSelection = props.enableRowSelection ?? false;
  const { t } = useV2Translation();
  const { state, columnsByKey, view, selection } = useV2TableController(props);
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
  const toggleItems = React.useMemo<V2ColumnToggleItem[]>(
    () =>
      prefs.orderedKeys.flatMap((key) => {
        const column = columnsByKey.get(key);
        return column
          ? [
              {
                key,
                label: column.label,
                visible: prefs.isVisible(key),
                canHide: column.enableHiding !== false,
              },
            ]
          : [];
      }),
    [prefs, columnsByKey],
  );

  const visibleColumnCount = table.getVisibleLeafColumns().length;

  return (
    <div className={cn("flex h-full min-h-0 flex-col gap-2", props.className)}>
      <V2TableToolbar
        activeFilterCount={state.activeFilterCount}
        onClearAllFilters={state.resetAll}
        selectedCount={selection.selectedCount}
        toolbarExtra={props.toolbarExtra}
        columnToggle={{
          columns: toggleItems,
          onToggle: prefs.toggleColumn,
          onReorder: prefs.setOrder,
          onReset: prefs.reset,
          isCustomized: prefs.isCustomized,
        }}
      />
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
        <table
          className="w-full table-fixed border-collapse border-spacing-0 text-xs"
          style={{
            minWidth: table.getTotalSize() + V2_ROW_ACTIONS_COLUMN_WIDTH,
          }}
        >
          <colgroup>
            {table.getVisibleLeafColumns().map((column) => (
              <col key={column.id} style={{ width: column.getSize() }} />
            ))}
            <col />
          </colgroup>
          <V2TableHeaderRows
            table={table}
            columnsByKey={columnsByKey}
            state={state}
            fetchOptionsFor={view.fetchOptionsFor}
            filters={filters}
          />
          <V2TableBodyRows
            table={table}
            layoutKey={layoutKey}
            columnsByKey={columnsByKey}
            colSpan={visibleColumnCount + 1}
            loading={loading}
            emptyLabel={
              props.emptyLabel ?? t("v2.table.empty", "Không có dữ liệu")
            }
            loadingLabel={t("v2.table.loading", "Đang tải dữ liệu...")}
            menuRowKey={menuRowKey}
            rowActions={rowActions}
            getRowClassName={props.getRowClassName}
            onRowContextMenu={menu.open}
          />
        </table>
      </div>
      <V2TablePagination
        page={state.query.page}
        pageSize={state.query.pageSize}
        total={view.total}
        onPageChange={state.setPage}
        onPageSizeChange={state.setPageSize}
        className="mt-2 shrink-0"
      />
      <V2TableContextMenu
        position={menu.state ? { x: menu.state.x, y: menu.state.y } : null}
        groups={menuGroups}
        onClose={menu.close}
      />
    </div>
  );
}
