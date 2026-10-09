import { useCallback, useMemo, useState } from "react";
import type { V2HeaderFilters } from "./V2StandardTable.filter.hook";
import type {
  V2Column,
  V2TableFilterPanelConfig,
  V2TableToolbarConfig,
} from "./V2StandardTable.type";

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
  const [expandedKey, setExpandedKeyState] = useState<string | null>(null);
  const [colSearch, setColSearch] = useState("");

  const setExpanded = useCallback(
    (key: string, expanded: boolean) => {
      if (expanded) {
        if (expandedKey && expandedKey !== key) {
          filters.onOpenChange(expandedKey, false, "");
        }
        filters.onOpenChange(key, true, committedSearchOf(key));
        setExpandedKeyState(key);
      } else {
        filters.onOpenChange(key, false, "");
        setExpandedKeyState((current) => (current === key ? null : current));
      }
    },
    [expandedKey, filters, committedSearchOf],
  );

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

  const visibleColumns = useMemo(() => {
    const q = colSearch.trim().toLowerCase();
    return columns.filter(
      (c) =>
        canFilter(c) &&
        (q === "" ||
          c.label.toLowerCase().includes(q) ||
          c.key.toLowerCase().includes(q)),
    );
  }, [columns, canFilter, colSearch]);

  return {
    enabled,
    open,
    setOpen,
    toggle: () => setOpen(!open),
    close: () => setOpen(false),
    expandedKey,
    setExpanded,
    reveal,
    colSearch,
    setColSearch,
    visibleColumns,
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
