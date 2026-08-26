import { useState, useEffect, useCallback } from "react";
import type {
  VisibilityState,
  ColumnSizingState,
  Table as TanstackTable,
  Updater,
} from "@tanstack/react-table";
import {
  useUserPreferences,
  useUserPreferencesStore,
} from "@/shared/hooks/useUserPreferences";
import { sanitizeActionColumnSizing } from "../utils";

interface UseDataTablePreferencesParams {
  tableId?: string;
  defaultColumnVisibility?: VisibilityState;
  defaultColumnOrder?: string[];
}

export function useDataTablePreferences({
  tableId,
  defaultColumnVisibility,
  defaultColumnOrder,
}: UseDataTablePreferencesParams) {
  const { getTablePreference, setTablePreferences } = useUserPreferences();

  const [internalVisibility, setInternalVisibility] = useState<VisibilityState>(
    () => {
      if (tableId) {
        const pref = getTablePreference(tableId)?.columnVisibility;
        if (pref && Object.keys(pref).length > 0) {
          return {
            ...(defaultColumnVisibility || {}),
            ...pref,
          };
        }
      }
      return defaultColumnVisibility || {};
    },
  );

  const [internalColumnOrder, setInternalColumnOrder] = useState<string[]>(
    () => {
      if (tableId) {
        let pref = getTablePreference(tableId)?.columnOrder;

        // Force override if defaultColumnOrder explicitly sets __actions first but pref doesn't have it
        if (
          pref &&
          defaultColumnOrder &&
          defaultColumnOrder[0] === "__actions" &&
          pref[0] !== "__actions"
        ) {
          pref = [
            "__actions",
            "__expand",
            "__selection",
            ...pref.filter(
              (c) => !["__actions", "__expand", "__selection"].includes(c),
            ),
          ];
        }

        if (pref && pref.length > 0) return pref;
      }
      return defaultColumnOrder || [];
    },
  );

  const [internalColumnSizing, setInternalColumnSizing] =
    useState<ColumnSizingState>(() =>
      tableId
        ? sanitizeActionColumnSizing(
            getTablePreference(tableId)?.columnSizing || {},
          )
        : {},
    );

  const storePref = useUserPreferencesStore((s) =>
    tableId ? s.tables[tableId] : undefined,
  );

  useEffect(() => {
    if (!tableId || !storePref) return;
    if (storePref.columnVisibility) {
      setInternalVisibility((prev) => {
        const next = {
          ...(defaultColumnVisibility || {}),
          ...storePref.columnVisibility,
        };
        const prevKeys = Object.keys(prev);
        const nextKeys = Object.keys(next);
        if (
          prevKeys.length !== nextKeys.length ||
          prevKeys.some((k) => prev[k] !== next[k])
        ) {
          return next;
        }
        return prev;
      });
    }
    if (storePref.columnOrder && storePref.columnOrder.length > 0) {
      setInternalColumnOrder((prev) => {
        if (
          prev.length !== storePref.columnOrder!.length ||
          prev.some((col, i) => col !== storePref.columnOrder![i])
        ) {
          return storePref.columnOrder!;
        }
        return prev;
      });
    }
    if (storePref.columnSizing) {
      setInternalColumnSizing((prev) => {
        const sanitized = sanitizeActionColumnSizing(
          storePref.columnSizing || {},
        );
        const prevKeys = Object.keys(prev);
        const nextKeys = Object.keys(sanitized);
        if (
          prevKeys.length !== nextKeys.length ||
          prevKeys.some((k) => prev[k] !== sanitized[k])
        ) {
          return sanitized;
        }
        return prev;
      });
    }
  }, [tableId, storePref, defaultColumnVisibility]);

  const handleColumnVisibilityChange = (
    updaterOrValue: Updater<VisibilityState>,
  ) => {
    setInternalVisibility(updaterOrValue);
    if (tableId) {
      const newState =
        typeof updaterOrValue === "function"
          ? updaterOrValue(internalVisibility)
          : updaterOrValue;
      setTablePreferences(tableId, {
        columnOrder: internalColumnOrder,
        columnVisibility: newState,
        columnSizing: internalColumnSizing,
      });
    }
  };

  const handleColumnOrderChange = (updaterOrValue: Updater<string[]>) => {
    setInternalColumnOrder(updaterOrValue);
    if (tableId) {
      const newState =
        typeof updaterOrValue === "function"
          ? updaterOrValue(internalColumnOrder)
          : updaterOrValue;
      setTablePreferences(tableId, {
        columnOrder: newState,
        columnVisibility: internalVisibility,
        columnSizing: internalColumnSizing,
      });
    }
  };

  const handleColumnSizingChange = (
    updaterOrValue: Updater<ColumnSizingState>,
  ) => {
    const newState = sanitizeActionColumnSizing(
      typeof updaterOrValue === "function"
        ? updaterOrValue(internalColumnSizing)
        : updaterOrValue,
    );

    setInternalColumnSizing(newState);

    if (tableId) {
      setTablePreferences(tableId, {
        columnOrder: internalColumnOrder,
        columnVisibility: internalVisibility,
        columnSizing: newState,
      });
    }
  };

  const handleResetTableLayout = useCallback(
    (table?: TanstackTable<any>) => {
      // 1. Reset sizing state
      setInternalColumnSizing({});

      // 2. Reset visibility to default
      const defaultVis = defaultColumnVisibility || {};
      setInternalVisibility(defaultVis);
      if (table) table.setColumnVisibility(defaultVis);

      // 3. Reset order to default
      const defaultOrder = defaultColumnOrder || [];
      setInternalColumnOrder(defaultOrder);
      if (table) {
        if (defaultOrder.length > 0) {
          table.setColumnOrder(defaultOrder);
        } else {
          table.resetColumnOrder();
        }
      }

      // 4. Update user preferences
      if (tableId) {
        setTablePreferences(tableId, {
          columnOrder: defaultOrder,
          columnVisibility: defaultVis,
          columnSizing: undefined,
        });
      }
    },
    [tableId, defaultColumnVisibility, defaultColumnOrder, setTablePreferences],
  );

  useEffect(() => {
    if (!tableId) return;
    const handleResetEvent = () => {
      handleResetTableLayout();
    };
    window.addEventListener(`reset-column-sizing-${tableId}`, handleResetEvent);
    return () => {
      window.removeEventListener(
        `reset-column-sizing-${tableId}`,
        handleResetEvent,
      );
    };
  }, [tableId, handleResetTableLayout]);

  return {
    internalVisibility,
    internalColumnOrder,
    internalColumnSizing,
    handleColumnVisibilityChange,
    handleColumnOrderChange,
    handleColumnSizingChange,
    handleResetTableLayout,
  };
}
