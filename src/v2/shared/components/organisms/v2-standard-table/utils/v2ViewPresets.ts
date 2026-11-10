import type {
  V2FilterPreset,
  V2FilterPresetQuery,
  V2ViewPreset,
  V2ViewPresetState,
  V2ViewPresetStorage,
} from "../toolbar/V2StandardTable.toolbar.type";
import type { V2ViewModeItem } from "@/v2/shared/components/molecules/v2-view-mode-combobox";

const STORAGE_PREFIX = "erp_v2_table_views:";

export const createEmptyViewPresetState = (): V2ViewPresetState => ({
  customViews: [],
});

const isStringRecordOfBooleans = (
  value: unknown,
): value is Record<string, boolean> =>
  typeof value === "object" &&
  value !== null &&
  !Array.isArray(value) &&
  Object.values(value).every((item) => typeof item === "boolean");

const parseView = (raw: unknown): V2ViewPreset | null => {
  if (typeof raw !== "object" || raw === null) return null;
  const { key, label, baseKey, visibility, order, filterKey } = raw as Record<
    string,
    unknown
  >;
  if (
    typeof key !== "string" ||
    typeof label !== "string" ||
    typeof baseKey !== "string" ||
    !isStringRecordOfBooleans(visibility)
  ) {
    return null;
  }
  const view: V2ViewPreset = {
    key,
    label,
    baseKey,
    visibility,
    order: Array.isArray(order)
      ? order.filter((item): item is string => typeof item === "string")
      : [],
  };
  // View cũ không có filterKey: chỉ gắn khóa khi là chuỗi hợp lệ
  if (typeof filterKey === "string") view.filterKey = filterKey;
  return view;
};

const FILTER_QUERY_KEYS = ["sort", "q", "cf", "cs", "co", "dr"] as const;

/** Bộ lọc tùy chỉnh sai kiểu (thiếu key/label/query) bị bỏ qua, không làm hỏng cả danh sách */
const parseFilterPreset = (raw: unknown): V2FilterPreset | null => {
  if (typeof raw !== "object" || raw === null) return null;
  const { key, label, groupKey, query } = raw as Record<string, unknown>;
  if (typeof key !== "string" || typeof label !== "string") return null;
  if (typeof query !== "object" || query === null) return null;

  const presetQuery: V2FilterPresetQuery = {};
  for (const field of FILTER_QUERY_KEYS) {
    const value = (query as Record<string, unknown>)[field];
    if (typeof value === "string") presetQuery[field] = value;
  }
  const preset: V2FilterPreset = { key, label, query: presetQuery };
  if (typeof groupKey === "string") preset.groupKey = groupKey;
  return preset;
};

/** Đọc dữ liệu lưu thô; sai kiểu thì bỏ qua từng phần, không ném lỗi */
export const parseViewPresetState = (
  raw: unknown,
): V2ViewPresetState | null => {
  if (typeof raw !== "object" || raw === null) return null;
  const { customViews, customFilters, activeKey, filterKey } = raw as Record<
    string,
    unknown
  >;
  return {
    customViews: Array.isArray(customViews)
      ? customViews
          .map(parseView)
          .filter((view): view is V2ViewPreset => view !== null)
      : [],
    // Dữ liệu cũ không có customFilters: để undefined, coi như rỗng
    customFilters: Array.isArray(customFilters)
      ? customFilters
          .map(parseFilterPreset)
          .filter((preset): preset is V2FilterPreset => preset !== null)
      : undefined,
    activeKey: typeof activeKey === "string" ? activeKey : undefined,
    filterKey: typeof filterKey === "string" ? filterKey : undefined,
  };
};

export const localStorageViewPresets: V2ViewPresetStorage = {
  load: (tableId) => {
    try {
      const raw = window.localStorage.getItem(STORAGE_PREFIX + tableId);
      return raw ? parseViewPresetState(JSON.parse(raw)) : null;
    } catch {
      return null;
    }
  },
  save: (tableId, state) => {
    try {
      window.localStorage.setItem(
        STORAGE_PREFIX + tableId,
        JSON.stringify(state),
      );
    } catch {
      // storage unavailable (private mode, quota): views stay in memory
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

/** Trạng thái view đã lưu của bảng, dùng để trang khôi phục initial state trước khi bảng mount */
export const readV2ViewState = (
  tableId: string,
  storage: V2ViewPresetStorage = localStorageViewPresets,
): V2ViewPresetState => storage.load(tableId) ?? createEmptyViewPresetState();

/** Danh sách hiển thị: view hệ thống trước, rồi view tùy chỉnh */
export const buildViewItems = (
  systemItems: V2ViewModeItem[],
  customViews: V2ViewPreset[],
): V2ViewModeItem[] => [
  ...systemItems,
  ...customViews.map((view) => ({ key: view.key, label: view.label })),
];

/** View đang chọn: lựa chọn đã lưu nếu còn tồn tại, không thì theo view của trang */
export const resolveActiveViewKey = (
  state: V2ViewPresetState,
  items: V2ViewModeItem[],
  pageKey?: string,
): string =>
  state.activeKey !== undefined &&
  items.some((item) => item.key === state.activeKey)
    ? state.activeKey
    : (pageKey ?? "");

/** Tên trùng (không phân biệt hoa thường, bỏ khoảng trắng đầu cuối), bỏ qua chính view đang sửa */
export const isViewNameTaken = (
  items: V2ViewModeItem[],
  name: string,
  exceptKey?: string,
): boolean =>
  items.some(
    (item) =>
      item.key !== exceptKey &&
      item.label.trim().toLowerCase() === name.trim().toLowerCase(),
  );
