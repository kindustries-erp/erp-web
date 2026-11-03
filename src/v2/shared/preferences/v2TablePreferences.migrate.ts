import type {
  V1TablePreference,
  V2TablePreferenceEntry,
} from "./v2TablePreferences.type";

export const V1_PREFERENCES_STORAGE_KEY = "erp_preferences";

/** Key preset hệ thống của V1 đổi tên trong V2 */
const V1_SYSTEM_VIEW_KEYS: Record<string, string> = {
  overview: "overview",
  legal_tax: "legal",
  all_columns: "all",
};

const V2_SYSTEM_BASE_VIEW = "overview";

/** Đọc toàn bộ bảng từ localStorage V1 (chỉ đọc, không import code V1) */
export function readV1TablePreferences(): Record<string, V1TablePreference> {
  try {
    const raw = localStorage.getItem(V1_PREFERENCES_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as {
      state?: { tables?: unknown };
    };
    const tables = parsed.state?.tables;
    const isObject =
      typeof tables === "object" && tables !== null && !Array.isArray(tables);
    return isObject ? (tables as Record<string, V1TablePreference>) : {};
  } catch {
    return {};
  }
}

export function mapV1TablePreference(
  legacy: V1TablePreference,
): V2TablePreferenceEntry {
  const order = Array.isArray(legacy.columnOrder) ? legacy.columnOrder : [];
  const legacyViews = Array.isArray(legacy.views) ? legacy.views : [];
  const activeKey =
    typeof legacy.activeView === "string"
      ? (V1_SYSTEM_VIEW_KEYS[legacy.activeView] ?? legacy.activeView)
      : undefined;

  return {
    columns: {
      visibility: legacy.columnVisibility ?? {},
      order,
      sizing: legacy.columnSizing ?? {},
    },
    views: {
      customViews: legacyViews
        .filter(
          (view) =>
            view?.isCustom &&
            typeof view.key === "string" &&
            typeof view.label === "string",
        )
        .map((view) => ({
          key: view.key,
          label: view.label,
          baseKey: V2_SYSTEM_BASE_VIEW,
          visibility: view.columnVisibility ?? {},
          order,
        })),
      activeKey,
    },
  };
}
