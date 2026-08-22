import { useMemo, useCallback } from "react";
import {
  useUserPreferencesStore,
  type TableViewPreset,
} from "./useUserPreferences";

export interface UsePageViewPresetsOptions {
  tableId: string;
  defaultPresets?: TableViewPreset[];
  activeView?: string;
  onViewChange?: (preset: TableViewPreset) => void;
}

export interface UsePageViewPresetsReturn {
  presets: TableViewPreset[];
  activePreset: TableViewPreset | undefined;
  selectView: (key: string) => void;
  saveView: (
    label: string,
    filters: Record<string, string>,
    columnFilters?: Record<string, string[]>,
    columnSearch?: Record<string, string>,
    columnVisibility?: Record<string, boolean>,
  ) => void;
  deleteView: (key: string) => void;
}

export function usePageViewPresets({
  tableId,
  defaultPresets = [],
  activeView = "all",
  onViewChange,
}: UsePageViewPresetsOptions): UsePageViewPresetsReturn {
  const customPresets = useUserPreferencesStore(
    (s) => s.tables?.[tableId]?.views || [],
  );
  const saveTableViewPreset = useUserPreferencesStore(
    (s) => s.saveTableViewPreset,
  );
  const deleteTableViewPreset = useUserPreferencesStore(
    (s) => s.deleteTableViewPreset,
  );

  const presets = useMemo(() => {
    // Map default presets
    const standard = defaultPresets.map((p) => ({
      ...p,
      isCustom: false,
    }));

    // Filter out duplicate keys if custom view overrides a default view
    const customKeys = new Set(customPresets.map((c) => c.key));
    const merged = [
      ...standard.filter((s) => !customKeys.has(s.key)),
      ...customPresets.map((c) => ({ ...c, isCustom: true })),
    ];

    return merged;
  }, [defaultPresets, customPresets]);

  const activePreset = useMemo(() => {
    return presets.find((p) => p.key === activeView) || presets[0];
  }, [presets, activeView]);

  const selectView = useCallback(
    (key: string) => {
      const target = presets.find((p) => p.key === key);
      if (target && onViewChange) {
        onViewChange(target);
      }
    },
    [presets, onViewChange],
  );

  const saveView = useCallback(
    (
      label: string,
      filters: Record<string, string>,
      columnFilters?: Record<string, string[]>,
      columnSearch?: Record<string, string>,
      columnVisibility?: Record<string, boolean>,
    ) => {
      const key = `custom_${Date.now()}`;
      const newPreset: TableViewPreset = {
        key,
        label,
        filters,
        columnFilters,
        columnSearch,
        columnVisibility,
        isCustom: true,
      };
      saveTableViewPreset(tableId, newPreset);
      if (onViewChange) {
        onViewChange(newPreset);
      }
    },
    [tableId, saveTableViewPreset, onViewChange],
  );

  const deleteView = useCallback(
    (key: string) => {
      deleteTableViewPreset(tableId, key);
      if (activeView === key && defaultPresets[0] && onViewChange) {
        onViewChange(defaultPresets[0]);
      }
    },
    [tableId, deleteTableViewPreset, activeView, defaultPresets, onViewChange],
  );

  return {
    presets,
    activePreset,
    selectView,
    saveView,
    deleteView,
  };
}
