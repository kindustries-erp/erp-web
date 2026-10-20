import { useEffect, useState } from "react";
import type { V2OperatorFilter } from "@/v2/shared/types/v2-table";
import { useDebouncedValue } from "./V2ColumnHeaderFilter.field";
import {
  hasSameValues,
  syncAllMatching,
} from "./V2ColumnHeaderFilter.selection";
import type { V2ColumnHeaderFilterPanelProps } from "./V2ColumnHeaderFilter.type";

type DraftParams = Pick<
  V2ColumnHeaderFilterPanelProps,
  | "selected"
  | "search"
  | "operator"
  | "onSelectedChange"
  | "onSearchChange"
  | "onOperatorChange"
  | "onOptionsSearchChange"
  | "onClear"
  | "onClose"
>;

const sameOperator = (
  a: V2OperatorFilter | null,
  b: V2OperatorFilter | null,
): boolean => JSON.stringify(a) === JSON.stringify(b);

/**
 * Trạng thái chờ của popup filter giống V1: chọn xong mới commit khi bấm Áp dụng.
 * Panel chỉ mount khi popup mở nên mỗi lần mở đều khởi tạo lại từ giá trị đã áp dụng.
 */
export const useHeaderFilterDraft = (params: DraftParams) => {
  const { selected, search, operator, onOptionsSearchChange } = params;
  const [pendingSelected, setPendingSelected] = useState(selected);
  const [pendingOperator, setPendingOperator] =
    useState<V2OperatorFilter | null>(operator ?? null);
  const [draftSearch, setDraftSearch] = useState(search);
  const debouncedSearch = useDebouncedValue(draftSearch);

  useEffect(() => {
    onOptionsSearchChange?.(debouncedSearch);
  }, [debouncedSearch, onOptionsSearchChange]);

  useEffect(() => {
    const next = syncAllMatching(pendingSelected, draftSearch);
    if (next) setPendingSelected(next);
  }, [pendingSelected, draftSearch]);

  const apply = () => {
    const trimmed = draftSearch.trim();
    if (!hasSameValues(pendingSelected, selected)) {
      params.onSelectedChange(pendingSelected);
    }
    if (trimmed !== search) params.onSearchChange(trimmed);
    if (!sameOperator(pendingOperator, operator ?? null)) {
      params.onOperatorChange(pendingOperator);
    }
    params.onClose();
  };

  const clear = () => {
    params.onClear();
    params.onClose();
  };

  return {
    pendingSelected,
    setPendingSelected,
    pendingOperator,
    setPendingOperator,
    draftSearch,
    setDraftSearch,
    apply,
    clear,
  };
};
