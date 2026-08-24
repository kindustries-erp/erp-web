import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  type VisibilityState,
  type ColumnSizingState,
} from "@tanstack/react-table";
import { updateUserPreferencesApi } from "@/core/api/appConfigApi";

export interface TableViewPreset {
  key: string;
  label: string;
  filters: Record<string, string>;
  columnFilters?: Record<string, string[]>;
  columnSearch?: Record<string, string>;
  columnVisibility?: Record<string, boolean>;
  isCustom?: boolean;
  isDefault?: boolean;
  isModified?: boolean;
}

export interface TablePreference {
  columnOrder: string[];
  columnVisibility: VisibilityState;
  columnSizing?: ColumnSizingState;
  views?: TableViewPreset[];
  activeView?: string;
}

export interface UserPreferences {
  theme?: string;
  language?: string;
  tables: Record<string, TablePreference>;
}

export interface UserPreferencesStoreState {
  tables: Record<string, TablePreference>;
  getTablePreference: (tableId: string) => TablePreference | undefined;
  setTablePreferences: (tableId: string, pref: TablePreference) => void;
  getTableViewPresets: (tableId: string) => TableViewPreset[];
  saveTableViewPreset: (tableId: string, view: TableViewPreset) => void;
  deleteTableViewPreset: (tableId: string, viewKey: string) => void;
  hydrateFromServer: (tableConfigs?: Record<string, TablePreference>) => void;
}

let syncTimeout: ReturnType<typeof setTimeout> | null = null;
let pendingTableSync: Record<string, TablePreference> = {};

function debouncedSyncToBackend(tableId: string, pref: TablePreference) {
  pendingTableSync[tableId] = pref;
  if (syncTimeout) {
    clearTimeout(syncTimeout);
  }
  syncTimeout = setTimeout(async () => {
    const toSend = { ...pendingTableSync };
    pendingTableSync = {};
    try {
      await updateUserPreferencesApi({ tableConfigs: toSend });
    } catch {
      // Non-blocking sync error
    }
  }, 500);
}

export const useUserPreferencesStore = create<UserPreferencesStoreState>()(
  persist(
    (set, get) => ({
      tables: {},

      getTablePreference: (tableId: string) => {
        const direct = get().tables?.[tableId];
        if (direct) return direct;
        const baseTableId = tableId.replace(/(_2|__\d+)$/, "");
        if (baseTableId !== tableId) {
          return get().tables?.[baseTableId];
        }
        return undefined;
      },

      setTablePreferences: (tableId: string, pref: TablePreference) => {
        const baseTableId = tableId.replace(/(_2|__\d+)$/, "");
        set((state) => ({
          tables: {
            ...(state.tables || {}),
            [tableId]: pref,
            ...(baseTableId !== tableId ? { [baseTableId]: pref } : {}),
            ...(baseTableId === tableId ? { [`${tableId}_2`]: pref } : {}),
          },
        }));
        debouncedSyncToBackend(baseTableId, pref);
      },

      getTableViewPresets: (tableId: string) => {
        const direct = get().tables?.[tableId]?.views;
        if (direct && direct.length > 0) return direct;
        const baseTableId = tableId.replace(/(_2|__\d+)$/, "");
        if (baseTableId !== tableId) {
          return get().tables?.[baseTableId]?.views || [];
        }
        return [];
      },

      saveTableViewPreset: (tableId: string, view: TableViewPreset) => {
        const baseTableId = tableId.replace(/(_2|__\d+)$/, "");
        const current = get().tables?.[tableId] ||
          get().tables?.[baseTableId] || {
            columnOrder: [],
            columnVisibility: {},
          };
        const existingViews = current.views || [];
        const index = existingViews.findIndex((v) => v.key === view.key);
        let nextViews: TableViewPreset[];
        if (index >= 0) {
          nextViews = [...existingViews];
          nextViews[index] = view;
        } else {
          nextViews = [...existingViews, view];
        }

        const nextPref: TablePreference = {
          ...current,
          views: nextViews,
          activeView: view.key,
        };

        set((state) => ({
          tables: {
            ...(state.tables || {}),
            [tableId]: nextPref,
            ...(baseTableId !== tableId ? { [baseTableId]: nextPref } : {}),
            ...(baseTableId === tableId ? { [`${tableId}_2`]: nextPref } : {}),
          },
        }));
        debouncedSyncToBackend(baseTableId, nextPref);
      },

      deleteTableViewPreset: (tableId: string, viewKey: string) => {
        const baseTableId = tableId.replace(/(_2|__\d+)$/, "");
        const current = get().tables?.[tableId] || get().tables?.[baseTableId];
        if (!current || !current.views) return;
        const nextViews = current.views.filter((v) => v.key !== viewKey);
        const nextPref: TablePreference = {
          ...current,
          views: nextViews,
          activeView:
            current.activeView === viewKey ? undefined : current.activeView,
        };
        set((state) => ({
          tables: {
            ...(state.tables || {}),
            [tableId]: nextPref,
            ...(baseTableId !== tableId ? { [baseTableId]: nextPref } : {}),
            ...(baseTableId === tableId ? { [`${tableId}_2`]: nextPref } : {}),
          },
        }));
        debouncedSyncToBackend(baseTableId, nextPref);
      },

      hydrateFromServer: (tableConfigs) => {
        if (!tableConfigs || typeof tableConfigs !== "object") return;
        set((state) => ({
          tables: {
            ...(state.tables || {}),
            ...tableConfigs,
          },
        }));
      },
    }),
    {
      name: "erp_preferences",
    },
  ),
);

// Backward-compatible hook signature for DataTable and existing components
export function useUserPreferences() {
  const tables = useUserPreferencesStore((s) => s.tables);
  const getTablePreference = useUserPreferencesStore(
    (s) => s.getTablePreference,
  );
  const setTablePreferences = useUserPreferencesStore(
    (s) => s.setTablePreferences,
  );
  const getTableViewPresets = useUserPreferencesStore(
    (s) => s.getTableViewPresets,
  );
  const saveTableViewPreset = useUserPreferencesStore(
    (s) => s.saveTableViewPreset,
  );
  const deleteTableViewPreset = useUserPreferencesStore(
    (s) => s.deleteTableViewPreset,
  );

  return {
    preferences: { tables },
    getTablePreference,
    setTablePreferences,
    getTableViewPresets,
    saveTableViewPreset,
    deleteTableViewPreset,
  };
}
