import { useCallback, useMemo, useState } from "react";
import type { V2HeaderFilters } from "../hooks/V2StandardTable.filter.hook";

interface UseV2FilterCardsParams<C extends { key: string; label: string }> {
  columns: C[];
  filters: V2HeaderFilters;
  /** Chỉ cột có spec filter và có nguồn options mới lọc được (giống header) */
  canFilter: (column: C) => boolean;
  /** Tìm trong cột đã cam kết (đã áp dụng), dùng khi mở card */
  committedSearchOf: (columnKey: string) => string;
}

/** Trạng thái danh sách card lọc theo cột: một card mở một lúc, ô tìm cột, cột hiển thị.
 *  Dùng chung cho panel lọc bên phải và editor trong hộp thoại bộ lọc. */
export function useV2FilterCardsState<
  C extends { key: string; label: string },
>({
  columns,
  filters,
  canFilter,
  committedSearchOf,
}: UseV2FilterCardsParams<C>) {
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
    expandedKey,
    setExpanded,
    colSearch,
    setColSearch,
    visibleColumns,
  };
}
