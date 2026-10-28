import type {
  V2ColumnPreferences,
  V2ColumnPreferencesStorage,
  V2ViewPresetStorage,
} from "@/v2/shared/components";
import { useV2TablePreferencesStore } from "./useV2TablePreferencesStore";
import type { V2TablePreferenceEntry } from "./v2TablePreferences.type";

const EMPTY_COLUMNS: V2ColumnPreferences = {
  visibility: {},
  order: [],
  sizing: {},
};

const patchTable = (tableId: string, patch: V2TablePreferenceEntry) =>
  useV2TablePreferencesStore.getState().patchTable(tableId, patch);

export const v2ColumnPreferencesStorage: V2ColumnPreferencesStorage = {
  load: (tableId) =>
    useV2TablePreferencesStore.getState().tables[tableId]?.columns ?? null,
  save: (tableId, columns) => patchTable(tableId, { columns }),
  clear: (tableId) => patchTable(tableId, { columns: EMPTY_COLUMNS }),
};

export const v2ViewPresetStorage: V2ViewPresetStorage = {
  load: (tableId) =>
    useV2TablePreferencesStore.getState().tables[tableId]?.views ?? null,
  save: (tableId, views) => patchTable(tableId, { views }),
  clear: (tableId) =>
    patchTable(tableId, { views: { customViews: [], activeKey: undefined } }),
};

/** Chọn chế độ xem hệ thống: đổi cột hiển thị và đánh dấu view đang chọn */
export function applyV2SystemView(
  tableId: string,
  key: string,
  visibility: Record<string, boolean>,
) {
  const current = useV2TablePreferencesStore.getState().tables[tableId];
  patchTable(tableId, {
    columns: { ...(current?.columns ?? EMPTY_COLUMNS), visibility },
    views: { customViews: current?.views?.customViews ?? [], activeKey: key },
  });
}
