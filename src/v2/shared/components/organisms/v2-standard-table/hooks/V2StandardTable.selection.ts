import { useCallback, useMemo, useState } from "react";
import type { RowSelectionState, Updater } from "@tanstack/react-table";

/** Chọn dòng theo key: controlled khi có `selectedKeys`, ngược lại tự giữ state */
export const useV2RowSelection = (
  selectedKeys: string[] | undefined,
  onSelectionChange?: (keys: string[]) => void,
) => {
  const [internalKeys, setInternalKeys] = useState<string[]>([]);
  const keys = selectedKeys ?? internalKeys;

  const rowSelection = useMemo<RowSelectionState>(
    () => Object.fromEntries(keys.map((key) => [key, true])),
    [keys],
  );

  const onRowSelectionChange = useCallback(
    (updater: Updater<RowSelectionState>) => {
      const next =
        typeof updater === "function" ? updater(rowSelection) : updater;
      const nextKeys = Object.keys(next).filter((key) => next[key]);
      if (selectedKeys === undefined) setInternalKeys(nextKeys);
      onSelectionChange?.(nextKeys);
    },
    [rowSelection, selectedKeys, onSelectionChange],
  );

  const toggleKey = useCallback(
    (key: string, checked: boolean) => {
      const nextKeys = checked
        ? Array.from(new Set([...keys, key]))
        : keys.filter((item) => item !== key);
      if (selectedKeys === undefined) setInternalKeys(nextKeys);
      onSelectionChange?.(nextKeys);
    },
    [keys, selectedKeys, onSelectionChange],
  );

  return {
    rowSelection,
    onRowSelectionChange,
    keys,
    toggleKey,
    selectedCount: keys.length,
  };
};
