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
    key?: string,
  ) => void;
  deleteView: (key: string) => void;
  resetView: (key: string) => void;
}

export function usePageViewPresets({
  tableId,
  defaultPresets = [],
  activeView = "overview",
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

  const defaultPresetMap = useMemo(() => {
    const map = new Map<string, TableViewPreset>();
    defaultPresets.forEach((p) => map.set(p.key, p));
    return map;
  }, [defaultPresets]);

  const presets = useMemo(() => {
    const customMap = new Map<string, TableViewPreset>();
    customPresets.forEach((c) => customMap.set(c.key, c));

    // 1. Process default presets: if customized in customPresets, merge overrides but keep as default
    const mergedDefaults = defaultPresets.map((def) => {
      const customOverride = customMap.get(def.key);
      if (customOverride) {
        return {
          ...def,
          ...customOverride,
          isDefault: true,
          isCustom: false,
          isModified: true,
        };
      }
      return {
        ...def,
        isDefault: true,
        isCustom: false,
        isModified: false,
      };
    });

    // 2. Process purely custom presets (not matching any defaultPreset key)
    const pureCustomPresets = customPresets
      .filter((c) => !defaultPresetMap.has(c.key))
      .map((c) => ({
        ...c,
        isDefault: false,
        isCustom: true,
      }));

    return [...mergedDefaults, ...pureCustomPresets];
  }, [defaultPresets, customPresets, defaultPresetMap]);

  const activePreset = useMemo(() => {
    return (
      presets.find((p) => p.key === activeView) ||
      presets.find((p) => p.key === "overview") ||
      presets[0]
    );
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
      existingKey?: string,
    ) => {
      const isDefault = existingKey ? defaultPresetMap.has(existingKey) : false;
      const key = existingKey || `custom_${Date.now()}`;
      const newPreset: TableViewPreset = {
        key,
        label,
        filters,
        columnFilters,
        columnSearch,
        columnVisibility,
        isDefault,
        isCustom: !isDefault,
        isModified: isDefault,
      };
      saveTableViewPreset(tableId, newPreset);
      if (onViewChange) {
        onViewChange(newPreset);
      }
    },
    [tableId, saveTableViewPreset, onViewChange, defaultPresetMap],
  );

  const deleteView = useCallback(
    (key: string) => {
      // Guard: Never delete default presets
      if (defaultPresetMap.has(key)) {
        return;
      }
      deleteTableViewPreset(tableId, key);
      if (activeView === key && defaultPresets[0] && onViewChange) {
        onViewChange(defaultPresets[0]);
      }
    },
    [
      tableId,
      deleteTableViewPreset,
      activeView,
      defaultPresets,
      onViewChange,
      defaultPresetMap,
    ],
  );

  const resetView = useCallback(
    (key: string) => {
      const defaultOriginal = defaultPresetMap.get(key);
      if (!defaultOriginal) return;

      // Delete custom override from store
      deleteTableViewPreset(tableId, key);

      const standardPreset: TableViewPreset = {
        ...defaultOriginal,
        isDefault: true,
        isCustom: false,
        isModified: false,
      };

      if (onViewChange) {
        onViewChange(standardPreset);
      }
    },
    [tableId, deleteTableViewPreset, defaultPresetMap, onViewChange],
  );

  return {
    presets,
    activePreset,
    selectView,
    saveView,
    deleteView,
    resetView,
  };
}
