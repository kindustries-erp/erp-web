import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  type VisibilityState,
  type ColumnSizingState,
} from "@tanstack/react-table";
import { updateUserPreferencesApi } from "@/core/api/appConfigApi";

export interface TablePreference {
  columnOrder: string[];
  columnVisibility: VisibilityState;
  columnSizing?: ColumnSizingState;
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
        return get().tables?.[tableId];
      },

      setTablePreferences: (tableId: string, pref: TablePreference) => {
        set((state) => ({
          tables: {
            ...(state.tables || {}),
            [tableId]: pref,
          },
        }));
        debouncedSyncToBackend(tableId, pref);
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

  return {
    preferences: { tables },
    getTablePreference,
    setTablePreferences,
  };
}
