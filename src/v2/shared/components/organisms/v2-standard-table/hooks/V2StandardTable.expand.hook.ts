import * as React from "react";

interface UseV2RowExpansionParams {
  expandedRowKeys?: string[];
  onExpandedRowsChange?: (keys: string[]) => void;
}

export interface V2RowExpansionApi {
  expandedSet: Set<string>;
  isExpanded: (rowKey: string) => boolean;
  toggleExpand: (rowKey: string) => void;
}

/**
 * Quản lý trạng thái mở rộng dòng (hỗ trợ cả controlled qua `expandedRowKeys` và uncontrolled nội bộ).
 */
export function useV2RowExpansion({
  expandedRowKeys,
  onExpandedRowsChange,
}: UseV2RowExpansionParams): V2RowExpansionApi {
  const [internalKeys, setInternalKeys] = React.useState<string[]>([]);
  const isControlled = expandedRowKeys !== undefined;
  const activeKeys = isControlled ? expandedRowKeys : internalKeys;

  const expandedSet = React.useMemo(() => new Set(activeKeys), [activeKeys]);

  const isExpanded = React.useCallback(
    (rowKey: string) => expandedSet.has(rowKey),
    [expandedSet],
  );

  const toggleExpand = React.useCallback(
    (rowKey: string) => {
      const next = expandedSet.has(rowKey)
        ? activeKeys.filter((k) => k !== rowKey)
        : [...activeKeys, rowKey];

      if (!isControlled) {
        setInternalKeys(next);
      }
      onExpandedRowsChange?.(next);
    },
    [activeKeys, expandedSet, isControlled, onExpandedRowsChange],
  );

  return { expandedSet, isExpanded, toggleExpand };
}
