import * as React from "react";
import { getCoreRowModel, useReactTable } from "@tanstack/react-table";
import type { ColumnSizingState, Updater } from "@tanstack/react-table";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { useV2TableColumns } from "../hooks/V2StandardTable.hook";
import { useV2TableController } from "../hooks/V2StandardTable.controller.hook";
import { useV2FilterPanelToolbar } from "../filterpanel/V2StandardTable.filterpanel.hook";
import { useV2DesktopToolbar } from "../toolbar/V2StandardTable.toolbar.hook";
import { useV2TableScroll } from "../hooks/V2StandardTable.scroll.hook";
import { useV2TableSummary } from "../summary/V2StandardTable.summary.hook";
import { useV2HeaderFilters } from "../hooks/V2StandardTable.filter.hook";
import { useV2RowMenu } from "../hooks/V2StandardTable.menu.hook";
import { useV2ColumnPreferences } from "../hooks/V2StandardTable.preferences.hook";
import type { V2StandardTableProps } from "../V2StandardTable.type";

/** Toàn bộ state và bảng TanStack của bản desktop; component chỉ lo JSX */
export function useV2DesktopTable<T>(props: V2StandardTableProps<T>) {
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

  return {
    columns,
    rowActions,
    state,
    selection,
    view,
    scroll,
    table,
    columnsByKey,
    filters,
    layoutKey,
    menuRowKey,
    menu,
    menuGroups,
    summaryValues,
    hasSummary,
    totalPages,
    panel,
    toolbarProps,
    isFullscreen,
    emptyLabel: props.emptyLabel ?? t("v2.table.empty", "Không có dữ liệu"),
    loadingLabel: t("v2.table.loading", "Đang tải dữ liệu..."),
  };
}
