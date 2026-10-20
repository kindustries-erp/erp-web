import { create } from "zustand";
import { persist } from "zustand/middleware";
import { scheduleTablePreferenceSync } from "./v2TablePreferences.sync";
import {
  mapV1TablePreference,
  readV1TablePreferences,
} from "./v2TablePreferences.migrate";
import type { V2TablePreferenceEntry } from "./v2TablePreferences.type";

export const V2_PREFERENCES_STORAGE_KEY = "v2_table_preferences";
/** Tăng khi cần chạy lại migration từ V1 cho mọi bảng */
export const V2_PREFERENCES_MIGRATION_VERSION = 1;

export interface V2TablePreferencesState {
  tables: Record<string, V2TablePreferenceEntry>;
  migrationVersion: number;
  /** Ghi đè một phần cấu hình bảng, lưu local và đồng bộ server nền */
  patchTable: (tableId: string, patch: V2TablePreferenceEntry) => void;
  /** Áp cấu hình V2 đã lưu trên server; server ghi đè local cùng key */
  applyServerTables: (remote: Record<string, V2TablePreferenceEntry>) => void;
}

export const useV2TablePreferencesStore = create<V2TablePreferencesState>()(
  persist(
    (set, get) => ({
      tables: {},
      migrationVersion: 0,
      patchTable: (tableId, patch) => {
        const next = { ...get().tables[tableId], ...patch };
        set((state) => ({ tables: { ...state.tables, [tableId]: next } }));
        scheduleTablePreferenceSync(tableId, next);
      },
      applyServerTables: (remote) =>
        set((state) => ({ tables: { ...state.tables, ...remote } })),
    }),
    { name: V2_PREFERENCES_STORAGE_KEY },
  ),
);

/**
 * Chép cấu hình bảng từ V1 sang V2 đúng một lần. Bảng đã có cấu hình V2 được giữ nguyên;
 * alias `_2` / `__n` của V1 bị bỏ qua để không nhân bản dữ liệu.
 */
export function migrateV1TablePreferences(): void {
  const state = useV2TablePreferencesStore.getState();
  if (state.migrationVersion >= V2_PREFERENCES_MIGRATION_VERSION) return;

  const migrated = Object.fromEntries(
    Object.entries(readV1TablePreferences())
      .filter(([tableId]) => !/(_2|__\d+)$/.test(tableId))
      .filter(([tableId]) => !state.tables[tableId])
      .map(([tableId, legacy]) => [tableId, mapV1TablePreference(legacy)]),
  );

  useV2TablePreferencesStore.setState({
    tables: { ...state.tables, ...migrated },
    migrationVersion: V2_PREFERENCES_MIGRATION_VERSION,
  });
}

migrateV1TablePreferences();
