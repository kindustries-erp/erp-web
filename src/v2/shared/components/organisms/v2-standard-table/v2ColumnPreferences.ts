import type {
  V2ColumnPreferences,
  V2ColumnPreferencesStorage,
} from "./V2StandardTable.type";

const STORAGE_PREFIX = "erp_v2_table_prefs:";

export const createEmptyPreferences = (): V2ColumnPreferences => ({
  visibility: {},
  order: [],
  sizing: {},
});

const filterRecord = <T>(
  value: unknown,
  guard: (item: unknown) => item is T,
): Record<string, T> => {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return {};
  }
  return Object.fromEntries(
    Object.entries(value).filter(([, item]) => guard(item)),
  ) as Record<string, T>;
};

export const parsePreferences = (raw: unknown): V2ColumnPreferences | null => {
  if (typeof raw !== "object" || raw === null) return null;
  const { visibility, order, sizing } = raw as Record<string, unknown>;
  return {
    visibility: filterRecord(
      visibility,
      (item): item is boolean => typeof item === "boolean",
    ),
    order: Array.isArray(order)
      ? order.filter((key): key is string => typeof key === "string")
      : [],
    sizing: filterRecord(
      sizing,
      (item): item is number =>
        typeof item === "number" && Number.isFinite(item) && item > 0,
    ),
  };
};

export const resolveColumnOrder = (
  saved: string[],
  columnKeys: string[],
): string[] => {
  const known = new Set(columnKeys);
  const kept = saved.filter((key) => known.has(key));
  const keptSet = new Set(kept);
  return [...kept, ...columnKeys.filter((key) => !keptSet.has(key))];
};

export const localStorageColumnPreferences: V2ColumnPreferencesStorage = {
  load: (tableId) => {
    try {
      const raw = window.localStorage.getItem(STORAGE_PREFIX + tableId);
      return raw ? parsePreferences(JSON.parse(raw)) : null;
    } catch {
      return null;
    }
  },
  save: (tableId, preferences) => {
    try {
      window.localStorage.setItem(
        STORAGE_PREFIX + tableId,
        JSON.stringify(preferences),
      );
    } catch {
      // storage unavailable (private mode, quota): preferences stay in memory
    }
  },
  clear: (tableId) => {
    try {
      window.localStorage.removeItem(STORAGE_PREFIX + tableId);
    } catch {
      // nothing to clear when storage is unavailable
    }
  },
};
