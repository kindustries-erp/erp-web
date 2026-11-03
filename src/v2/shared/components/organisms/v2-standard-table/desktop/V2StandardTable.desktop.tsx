import * as React from "react";
import { V2TablePagination } from "@/v2/shared/components/molecules/v2-table-pagination";
import { V2TableContextMenu } from "@/v2/shared/components/molecules/v2-table-row-actions";
import { cn } from "@/v2/shared/utils/cn";
import { V2TableGrid } from "../grid/V2StandardTable.grid";
import { V2TableFilterPanel } from "../filterpanel/V2StandardTable.filterpanel";
import { V2TableToolbar } from "../toolbar/V2StandardTable.toolbar";
import type { V2StandardTableProps } from "../V2StandardTable.type";
import { useV2DesktopTable } from "./V2StandardTable.desktop.hook";

export function V2StandardTableDesktop<T>(props: V2StandardTableProps<T>) {
  const { loading = false } = props;
  const {
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
    emptyLabel,
    loadingLabel,
  } = useV2DesktopTable(props);

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
              "relative flex min-h-0 w-full flex-1 flex-col overflow-auto rounded-xl border border-border/20 dark:border-transparent bg-surface shadow-[var(--card-shadow)] transition-shadow duration-150",
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
              emptyLabel={emptyLabel}
              loadingLabel={loadingLabel}
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
                      totalRows: view.total,
                      pageSize: state.query.pageSize,
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
