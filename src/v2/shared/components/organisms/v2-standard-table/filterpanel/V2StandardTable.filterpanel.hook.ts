import { useCallback, useMemo, useState } from "react";
import type { V2HeaderFilters } from "../hooks/V2StandardTable.filter.hook";
import type {
  V2Column,
  V2TableFilterPanelConfig,
  V2TableToolbarConfig,
} from "../V2StandardTable.type";
import { useV2FilterCardsState } from "./V2StandardTable.filtercards.hook";

interface UseV2FilterPanelParams<T> {
  config?: V2TableFilterPanelConfig;
  columns: V2Column<T>[];
  filters: V2HeaderFilters;
  /** Chỉ cột có spec filter và có nguồn options mới lọc được (giống header) */
  canFilter: (column: V2Column<T>) => boolean;
  committedSearchOf: (columnKey: string) => string;
}

export function useV2FilterPanel<T>({
  config,
  columns,
  filters,
  canFilter,
  committedSearchOf,
}: UseV2FilterPanelParams<T>) {
  const enabled = config !== undefined;
  const [innerOpen, setInnerOpen] = useState(config?.defaultOpen ?? false);
  const open = enabled && (config?.open ?? innerOpen);
  const cards = useV2FilterCardsState({
    columns,
    filters,
    canFilter,
    committedSearchOf,
  });
  const { expandedKey, setExpanded } = cards;

  const setOpen = useCallback(
    (next: boolean) => {
      if (!next && expandedKey) setExpanded(expandedKey, false);
      if (config?.open === undefined) setInnerOpen(next);
      config?.onOpenChange?.(next);
    },
    [config, expandedKey, setExpanded],
  );

  const reveal = useCallback(
    (key: string) => {
      if (!open) setOpen(true);
      setExpanded(key, true);
      window.requestAnimationFrame(() =>
        document
          .getElementById(`filter-card-${key}`)
          ?.scrollIntoView?.({ behavior: "smooth", block: "nearest" }),
      );
    },
    [open, setOpen, setExpanded],
  );

  return {
    enabled,
    open,
    setOpen,
    toggle: () => setOpen(!open),
    close: () => setOpen(false),
    expandedKey: cards.expandedKey,
    setExpanded,
    reveal,
    colSearch: cards.colSearch,
    setColSearch: cards.setColSearch,
    visibleColumns: cards.visibleColumns,
  };
}

export type V2FilterPanelController<T = unknown> = ReturnType<
  typeof useV2FilterPanel<T>
>;

interface UseV2FilterPanelToolbarParams<T> extends Omit<
  UseV2FilterPanelParams<T>,
  "config"
> {
  toolbar?: V2TableToolbarConfig;
}

/** Panel + cấu hình toolbar đã gắn nút Lọc mở/đóng panel (vẫn gọi `onFilterToggle` nếu có) */
export function useV2FilterPanelToolbar<T>({
  toolbar,
  ...params
}: UseV2FilterPanelToolbarParams<T>) {
  const panel = useV2FilterPanel({ ...params, config: toolbar?.filterPanel });
  const { enabled, toggle } = panel;
  const toolbarConfig = useMemo(
    () =>
      toolbar && {
        ...toolbar,
        onFilterToggle: enabled
          ? () => {
              toggle();
              toolbar.onFilterToggle?.();
            }
          : toolbar.onFilterToggle,
      },
    [toolbar, enabled, toggle],
  );
  return { panel, toolbarConfig };
}
