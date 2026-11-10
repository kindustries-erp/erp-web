import type { V2TableQuery } from "@/v2/shared/types/v2-table";
import {
  parseV2TableQuery,
  writeV2TableQuery,
} from "@/v2/shared/utils/v2TableUrl";
import type {
  V2FilterPreset,
  V2FilterPresetQuery,
} from "../toolbar/V2StandardTable.toolbar.type";

/** Giới hạn bộ lọc tùy chỉnh mỗi bảng (khớp `customFiltersMax` ở API) */
export const V2_FILTER_PRESETS_MAX = 50;

export const createFilterPresetKey = (): string => `cf_${Date.now()}`;

const QUERY_FIELDS = ["sort", "q", "cf", "cs", "co", "dr"] as const;
/** Các trường tạo thành điều kiện lọc (sort không tính là điều kiện) */
const CONDITION_FIELDS = ["q", "cf", "cs", "co", "dr"] as const;

/** Chụp điều kiện đang áp dụng của bảng thành chuỗi query (bỏ page/size) */
export const toPresetQuery = (query: V2TableQuery): V2FilterPresetQuery => {
  const params = new URLSearchParams();
  writeV2TableQuery(params, query);
  const out: V2FilterPresetQuery = {};
  for (const field of QUERY_FIELDS) {
    const value = params.get(field);
    if (value) out[field] = value;
  }
  return out;
};

/** Dựng lại phần query bảng từ snapshot đã lưu (chỉ các trường điều kiện và sort) */
export const fromPresetQuery = (
  presetQuery: V2FilterPresetQuery,
): Partial<V2TableQuery> => {
  const params = new URLSearchParams();
  for (const field of QUERY_FIELDS) {
    const value = presetQuery[field];
    if (value) params.set(field, value);
  }
  return parseV2TableQuery(params);
};

/** Có ít nhất một điều kiện lọc (không tính sắp xếp) */
export const hasConditions = (presetQuery: V2FilterPresetQuery): boolean =>
  CONDITION_FIELDS.some((field) => Boolean(presetQuery[field]));

/** Hai snapshot có cùng điều kiện và sắp xếp hay không */
export const isSameConditions = (
  a: V2FilterPresetQuery,
  b: V2FilterPresetQuery,
): boolean =>
  QUERY_FIELDS.every((field) => (a[field] ?? "") === (b[field] ?? ""));

/**
 * Bộ lọc tùy chỉnh đang khớp với điều kiện hiện tại của bảng (cùng nhóm, cùng điều kiện).
 * Bộ lọc không có điều kiện không bao giờ khớp, để không trùng mục có sẵn.
 */
export const findMatchingPreset = (
  presets: V2FilterPreset[],
  current: V2FilterPresetQuery,
  activeGroupKey: string | undefined,
): V2FilterPreset | undefined =>
  presets.find(
    (preset) =>
      hasConditions(preset.query) &&
      preset.groupKey === activeGroupKey &&
      isSameConditions(preset.query, current),
  );
