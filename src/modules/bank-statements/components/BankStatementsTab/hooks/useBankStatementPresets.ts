import { useState } from "react";
import { usePageViewPresets } from "@/shared/hooks/usePageViewPresets";
import {
  useUserPreferencesStore,
  type TableViewPreset,
} from "@/shared/hooks/useUserPreferences";
import {
  BANK_STATEMENT_COLUMN_VIEW_PRESETS,
  DEFAULT_BANK_COLUMN_VISIBILITY,
} from "../utils";

export function useBankStatementPresets(tableId: string) {
  const columnViewPresetsHook = usePageViewPresets({
    tableId,
    defaultPresets: BANK_STATEMENT_COLUMN_VIEW_PRESETS,
  });

  const currentTablePref = useUserPreferencesStore((s) => s.tables[tableId]);
  const currentColumnVisibility = currentTablePref?.columnVisibility;

  const [activeColumnPresetKey, setActiveColumnPresetKey] = useState<string>(
    () => {
      const stored = useUserPreferencesStore
        .getState()
        .getTablePreference(tableId);
      return stored?.activeView || "overview";
    },
  );

  const [viewConfigDrawerOpen, setViewConfigDrawerOpen] = useState(false);
  const [editingViewPreset, setEditingViewPreset] =
    useState<TableViewPreset | null>(null);

  const handleColumnPresetChange = (preset: TableViewPreset) => {
    setActiveColumnPresetKey(preset.key);

    const currentPref = useUserPreferencesStore
      .getState()
      .getTablePreference(tableId) || {
      columnOrder: [],
      columnVisibility: {},
    };

    useUserPreferencesStore.getState().setTablePreferences(tableId, {
      ...currentPref,
      columnVisibility:
        preset.columnVisibility || DEFAULT_BANK_COLUMN_VISIBILITY,
      activeView: preset.key,
    });
  };

  const handleOpenCreateView = () => {
    setEditingViewPreset(null);
    setViewConfigDrawerOpen(true);
  };

  const handleOpenEditView = (preset: TableViewPreset) => {
    setEditingViewPreset(preset);
    setViewConfigDrawerOpen(true);
  };

  const handleSaveViewPreset = (data: {
    key?: string;
    label: string;
    columnVisibility: Record<string, boolean>;
  }) => {
    columnViewPresetsHook.saveView(
      data.label,
      {},
      {},
      {},
      data.columnVisibility,
      data.key,
    );

    if (data.key) {
      setActiveColumnPresetKey(data.key);
      const currentPref = useUserPreferencesStore
        .getState()
        .getTablePreference(tableId) || {
        columnOrder: [],
        columnVisibility: {},
      };
      useUserPreferencesStore.getState().setTablePreferences(tableId, {
        ...currentPref,
        columnVisibility: data.columnVisibility,
        activeView: data.key,
      });
    }
  };

  const handleResetViewPreset = (key: string) => {
    columnViewPresetsHook.resetView(key);
    const factoryPreset = BANK_STATEMENT_COLUMN_VIEW_PRESETS.find(
      (p) => p.key === key,
    );
    if (factoryPreset) {
      handleColumnPresetChange(factoryPreset);
    }
  };

  const handleDeleteViewPreset = (key: string) => {
    columnViewPresetsHook.deleteView(key);
    if (activeColumnPresetKey === key) {
      const defaultPreset = BANK_STATEMENT_COLUMN_VIEW_PRESETS[0];
      handleColumnPresetChange(defaultPreset);
    }
  };

  return {
    columnViewPresetsHook,
    currentColumnVisibility,
    activeColumnPresetKey,
    viewConfigDrawerOpen,
    setViewConfigDrawerOpen,
    editingViewPreset,
    handleColumnPresetChange,
    handleOpenCreateView,
    handleOpenEditView,
    handleSaveViewPreset,
    handleResetViewPreset,
    handleDeleteViewPreset,
  };
}
