import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  createEmptyPreferences,
  localStorageColumnPreferences,
  resolveColumnOrder,
} from "./v2ColumnPreferences";
import type {
  V2ColumnPreferences,
  V2ColumnPreferencesStorage,
} from "./V2StandardTable.type";

export interface UseV2ColumnPreferencesOptions {
  tableId: string;
  columnKeys: string[];
  storage?: V2ColumnPreferencesStorage;
}

export interface V2ColumnPreferencesApi {
  orderedKeys: string[];
  sizing: Record<string, number>;
  isCustomized: boolean;
  isVisible: (columnKey: string) => boolean;
  toggleColumn: (columnKey: string) => void;
  setOrder: (keys: string[]) => void;
  setSizing: (sizing: Record<string, number>) => void;
  reset: () => void;
}

export const useV2ColumnPreferences = ({
  tableId,
  columnKeys,
  storage = localStorageColumnPreferences,
}: UseV2ColumnPreferencesOptions): V2ColumnPreferencesApi => {
  const [prefs, setPrefs] = useState<V2ColumnPreferences>(
    () => storage.load(tableId) ?? createEmptyPreferences(),
  );
  const lastSaved = useRef(prefs);

  useEffect(() => {
    if (lastSaved.current === prefs) return;
    lastSaved.current = prefs;
    storage.save(tableId, prefs);
  }, [prefs, storage, tableId]);

  const orderedKeys = useMemo(
    () => resolveColumnOrder(prefs.order, columnKeys),
    [prefs.order, columnKeys],
  );

  const isVisible = useCallback(
    (columnKey: string) => prefs.visibility[columnKey] !== false,
    [prefs.visibility],
  );

  const toggleColumn = useCallback(
    (columnKey: string) =>
      setPrefs((current) => {
        const visibleCount = columnKeys.filter(
          (key) => current.visibility[key] !== false,
        ).length;
        const currentlyVisible = current.visibility[columnKey] !== false;
        if (currentlyVisible && visibleCount <= 1) return current;
        return {
          ...current,
          visibility: { ...current.visibility, [columnKey]: !currentlyVisible },
        };
      }),
    [columnKeys],
  );

  const setOrder = useCallback(
    (order: string[]) => setPrefs((current) => ({ ...current, order })),
    [],
  );

  const setSizing = useCallback(
    (sizing: Record<string, number>) =>
      setPrefs((current) => ({ ...current, sizing })),
    [],
  );

  const reset = useCallback(() => {
    const empty = createEmptyPreferences();
    lastSaved.current = empty;
    setPrefs(empty);
    storage.clear(tableId);
  }, [storage, tableId]);

  const isCustomized =
    prefs.order.length > 0 ||
    Object.keys(prefs.visibility).length > 0 ||
    Object.keys(prefs.sizing).length > 0;

  return {
    orderedKeys,
    sizing: prefs.sizing,
    isCustomized,
    isVisible,
    toggleColumn,
    setOrder,
    setSizing,
    reset,
  };
};
