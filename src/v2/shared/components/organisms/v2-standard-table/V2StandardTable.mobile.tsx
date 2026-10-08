import * as React from "react";
import { MoreHorizontal } from "lucide-react";
import { V2Button } from "@/v2/shared/components/atoms/v2-button";
import { V2Dropdown } from "@/v2/shared/components/molecules/v2-dropdown";
import { V2TablePagination } from "@/v2/shared/components/molecules/v2-table-pagination";
import { hasRowActions } from "@/v2/shared/components/molecules/v2-table-row-actions";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { Checkbox } from "@/v2/shared/ui";
import { cn } from "@/v2/shared/utils/cn";
import { useV2TableController } from "./V2StandardTable.controller.hook";
import { resolveMobileSlots } from "./V2StandardTable.mobile-slots";
import { V2TableToolbar } from "./V2StandardTable.toolbar";
import type { V2StandardTableProps } from "./V2StandardTable.type";

export function V2StandardTableMobile<T>(props: V2StandardTableProps<T>) {
  const { columns, getRowKey, rowActions, loading = false } = props;
  const { t } = useV2Translation();
  const { state, view, selection } = useV2TableController(props);
  const slots = React.useMemo(() => resolveMobileSlots(columns), [columns]);
  const selected = React.useMemo(
    () => new Set(selection.keys),
    [selection.keys],
  );
  const { title, subtitle, meta } = slots;

  return (
    <div className={cn("flex min-h-0 flex-col gap-2", props.className)}>
      <V2TableToolbar
        activeFilterCount={state.activeFilterCount}
        onClearAllFilters={state.resetAll}
        selectedCount={selection.selectedCount}
        toolbarExtra={props.toolbarExtra}
        config={props.toolbar && { ...props.toolbar, viewModes: undefined }}
        onClearSelection={() => selection.onRowSelectionChange({})}
        loading={loading}
      />
      {view.rows.length === 0 ? (
        <p className="py-10 text-center text-xs text-muted-fg">
          {loading
            ? t("v2.table.loading", "Đang tải dữ liệu...")
            : (props.emptyLabel ?? t("v2.table.empty", "Không có dữ liệu"))}
        </p>
      ) : (
        <ul className={cn("flex flex-col gap-2", loading && "opacity-60")}>
          {view.rows.map((row, rowIndex) => {
            const key = getRowKey(row);
            const index = view.startIndex + rowIndex + 1;
            const groups = rowActions?.(row) ?? [];
            return (
              <li
                key={key}
                data-state={selected.has(key) ? "selected" : undefined}
                className={cn(
                  "flex flex-col gap-2 rounded-xl border border-border/60 bg-surface p-3 data-[state=selected]:bg-primary/5",
                  props.getRowClassName?.(row, index),
                )}
              >
                <div className="flex items-start gap-2">
                  {props.enableRowSelection && (
                    <Checkbox
                      aria-label={t("v2.table.selectRow", "Chọn dòng")}
                      checked={selected.has(key)}
                      onCheckedChange={(value) =>
                        selection.toggleKey(key, Boolean(value))
                      }
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="text-[10px] tabular-nums text-muted-fg">
                      #{index}
                    </div>
                    <div className="truncate text-sm font-semibold">
                      {title?.cell(row, index)}
                    </div>
                    {subtitle && (
                      <div className="truncate text-xs text-muted-fg">
                        {subtitle.cell(row, index)}
                      </div>
                    )}
                  </div>
                  {hasRowActions(groups) && (
                    <V2Dropdown
                      groups={groups}
                      align="end"
                      trigger={
                        <V2Button
                          variant="ghost"
                          size="icon-xs"
                          aria-label={t(
                            "v2.table.moreActions",
                            "Thao tác khác",
                          )}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </V2Button>
                      }
                    />
                  )}
                </div>
                {meta.length > 0 && (
                  <dl className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
                    {meta.map((column) => (
                      <div key={column.key} className="min-w-0">
                        <dt className="text-muted-fg">{column.label}</dt>
                        <dd className="truncate [&>div]:items-start [&>div]:text-left">
                          {column.cell(row, index)}
                        </dd>
                      </div>
                    ))}
                  </dl>
                )}
              </li>
            );
          })}
        </ul>
      )}
      <V2TablePagination
        page={state.query.page}
        pageSize={state.query.pageSize}
        total={view.total}
        onPageChange={state.setPage}
        onPageSizeChange={state.setPageSize}
        className="mt-2"
      />
    </div>
  );
}
