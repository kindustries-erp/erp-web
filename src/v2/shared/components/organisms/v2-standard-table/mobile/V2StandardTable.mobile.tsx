import * as React from "react";
import { V2TablePagination } from "@/v2/shared/components/molecules/v2-table-pagination";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { V2Text } from "@/v2/shared/components/atoms/v2-text";
import { cn } from "@/v2/shared/utils/cn";
import { useV2TableController } from "../hooks/V2StandardTable.controller.hook";
import { useV2ViewPresets } from "../hooks/V2StandardTable.views.hook";
import { resolveMobileSlots } from "./V2StandardTable.mobile-slots";
import { V2StandardTableMobileCard } from "./V2StandardTable.mobile-card";
import { V2TableSkeletonCards } from "../skeleton";
import { V2TableToolbar } from "../toolbar/V2StandardTable.toolbar";
import { V2Modal } from "@/v2/shared/components/molecules/v2-modal";
import { useV2ToolbarPortal } from "@/v2/shared/components/molecules/v2-tab-panel";
import { useV2HeaderFilters } from "../hooks/V2StandardTable.filter.hook";
import { useV2FilterPanelToolbar } from "../filterpanel/V2StandardTable.filterpanel.hook";
import { V2TableFilterPanel } from "../filterpanel/V2StandardTable.filterpanel";
import type { V2StandardTableProps } from "../V2StandardTable.type";

export function V2StandardTableMobile<T>(props: V2StandardTableProps<T>) {
  const { columns, getRowKey, rowActions, loading = false } = props;
  const { t } = useV2Translation();
  const { state, view, selection, columnsByKey } = useV2TableController(props);
  const filters = useV2HeaderFilters({
    tableId: props.tableId,
    columnsByKey,
    fetchOptionsFor: view.fetchOptionsFor,
    filtersStrFor: view.filtersStrFor,
  });
  const { panel, toolbarConfig } = useV2FilterPanelToolbar({
    toolbar: props.toolbar
      ? {
          ...props.toolbar,
          filterPanel: props.toolbar.filterPanel ?? {},
        }
      : undefined,
    columns,
    filters,
    canFilter: (column) =>
      Boolean(column.filter && view.fetchOptionsFor(column)),
    committedSearchOf: (key) => state.query.columnSearch[key] ?? "",
  });
  // Mobile chỉ có nhóm lọc (không có chế độ xem tùy chỉnh): vẫn nhớ filter đã chọn
  useV2ViewPresets({
    tableId: props.tableId,
    filterGroup: toolbarConfig?.filterGroup,
    storage: props.viewPresetStorage,
  });
  const slots = React.useMemo(() => resolveMobileSlots(columns), [columns]);
  const selected = React.useMemo(
    () => new Set(selection.keys),
    [selection.keys],
  );
  const slot = useV2ToolbarPortal();

  return (
    <div className={cn("flex h-full min-h-0 flex-col gap-2", props.className)}>
      <V2TableToolbar
        activeFilterCount={state.activeFilterCount}
        onClearAllFilters={state.resetAll}
        selectedCount={selection.selectedCount}
        toolbarExtra={props.toolbarExtra}
        config={toolbarConfig && { ...toolbarConfig, viewModes: undefined }}
        portalTarget={slot}
        onClearSelection={() => selection.onRowSelectionChange({})}
        loading={loading}
        search={{ value: state.query.search ?? "", onChange: state.setSearch }}
      />
      <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto">
        {view.rows.length === 0 && loading ? (
          <V2TableSkeletonCards
            loadingLabel={t("v2.table.loading", "Đang tải dữ liệu...")}
          />
        ) : view.rows.length === 0 ? (
          <V2Text
            as="p"
            variant="body-sm"
            color="muted"
            className="py-10 text-center"
          >
            {props.emptyLabel ?? t("v2.table.empty", "Không có dữ liệu")}
          </V2Text>
        ) : (
          <ul className={cn("flex flex-col gap-2", loading && "opacity-60")}>
            {view.rows.map((row, rowIndex) => {
              const key = getRowKey(row);
              return (
                <V2StandardTableMobileCard
                  key={key}
                  row={row}
                  rowIndex={rowIndex}
                  rowKey={key}
                  startIndex={view.startIndex}
                  slots={slots}
                  isSelected={selected.has(key)}
                  enableRowSelection={props.enableRowSelection}
                  rowActions={rowActions}
                  getRowClassName={props.getRowClassName}
                  onToggleSelect={selection.toggleKey}
                />
              );
            })}
          </ul>
        )}
      </div>
      <V2TablePagination
        page={state.query.page}
        pageSize={state.query.pageSize}
        total={view.total}
        onPageChange={state.setPage}
        onPageSizeChange={state.setPageSize}
        className="mt-2 shrink-0 pb-12 sm:pb-0"
      />
      <V2Modal
        open={panel.open}
        onOpenChange={panel.setOpen}
        title={t("v2.table.filter", "Bộ lọc")}
        size="full"
        bodyClassName="p-0"
      >
        <V2TableFilterPanel
          panel={panel}
          columns={columns}
          state={state}
          filters={filters}
          extraContent={props.toolbar?.filterPanel?.extraContent}
        />
      </V2Modal>
    </div>
  );
}
