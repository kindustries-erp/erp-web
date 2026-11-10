import * as React from "react";
import {
  V2_FILTER_GROUP_ALL_KEY,
  type V2FilterGroup,
} from "@/v2/shared/components/molecules/v2-view-mode-combobox";
import type { V2FetchOptions, V2TableQuery } from "@/v2/shared/types/v2-table";
import type {
  V2FilterPreset,
  V2FilterPresetQuery,
} from "../toolbar/V2StandardTable.toolbar.type";
import type { V2FilterColumn } from "../filterpanel/V2StandardTable.filtercards";
import {
  V2_FILTER_PRESETS_MAX,
  createFilterPresetKey,
  findMatchingPreset,
  fromPresetQuery,
  toPresetQuery,
} from "../utils/v2FilterPresets";
import {
  consumePendingFilterPreset,
  setPendingFilterPreset,
} from "../utils/v2PendingFilterPreset";

/** Nội dung bộ lọc do hộp thoại gửi lên: tên, nhóm gốc và điều kiện đã dựng trong editor */
export interface V2FilterPresetDraft {
  label: string;
  groupKey?: string;
  query: V2FilterPresetQuery;
}

/** Nguồn dữ liệu để dựng editor điều kiện trong hộp thoại (lấy từ bảng, không gọi API riêng) */
export interface V2FilterPresetEditorSource {
  /** Khóa bảng: dùng cho khóa cache options của bản nháp */
  tableId: string;
  /** Cột lọc được (đã lọc theo `filter` và có nguồn options) */
  columns: V2FilterColumn[];
  /** Nguồn options theo khóa cột; undefined khi cột không lọc được */
  fetchOptionsForKey: (columnKey: string) => V2FetchOptions | undefined;
  /** Khóa cache options cho một bản query nháp */
  filtersStrForQuery: (
    query: V2TableQuery,
    columnKey: string,
  ) => string | undefined;
  /** Điều kiện đang áp dụng trên bảng: điều kiện khởi tạo khi tạo mới */
  tableQuery: V2TableQuery;
}

export interface UseV2FilterPresetsOptions {
  tableId: string;
  presets: V2FilterPreset[];
  /** Cập nhật danh sách bộ lọc tùy chỉnh (lưu qua chế độ xem của bảng) */
  setPresets: (update: (current: V2FilterPreset[]) => V2FilterPreset[]) => void;
  filterGroup?: V2FilterGroup;
  query: V2TableQuery;
  applyQuery: (next: Partial<V2TableQuery>) => void;
  editorSource: V2FilterPresetEditorSource;
}

/** Bộ lọc tùy chỉnh: lưu/chọn/sửa/xóa; nội dung lưu do hộp thoại dựng */
export function useV2FilterPresets({
  tableId,
  presets,
  setPresets,
  filterGroup,
  query,
  applyQuery,
  editorSource,
}: UseV2FilterPresetsOptions) {
  const currentQuery = React.useMemo(() => toPresetQuery(query), [query]);
  const activeGroupKey = filterGroup?.activeKey;
  const activeKey = findMatchingPreset(
    presets,
    currentQuery,
    activeGroupKey,
  )?.key;

  // Snapshot chờ từ lần chọn trước (đổi bộ lọc gốc làm tab dựng lại): áp sau khi bảng mount
  React.useEffect(() => {
    const pending = consumePendingFilterPreset(tableId);
    if (pending !== undefined) applyQuery(fromPresetQuery(pending));
  }, [tableId, activeGroupKey, applyQuery]);

  const select = (key: string) => {
    const preset = presets.find((item) => item.key === key);
    if (!preset) return;
    const groupKey = preset.groupKey;
    const groupExists =
      groupKey !== undefined &&
      Boolean(filterGroup?.items.some((item) => item.key === groupKey));
    if (filterGroup && groupExists && groupKey !== activeGroupKey) {
      // Đổi bộ lọc gốc: bảng dựng lại, snapshot được áp ở effect khi mount
      setPendingFilterPreset(tableId, preset.query);
      filterGroup.onChange(groupKey);
      return;
    }
    applyQuery(fromPresetQuery(preset.query));
  };

  const isNameTaken = (label: string, exceptKey?: string) =>
    presets.some(
      (item) =>
        item.key !== exceptKey &&
        item.label.trim().toLowerCase() === label.trim().toLowerCase(),
    );

  /** Lưu bộ lọc mới từ bản nháp. Trả false khi đã đủ giới hạn */
  const create = (draft: V2FilterPresetDraft): boolean => {
    if (presets.length >= V2_FILTER_PRESETS_MAX) return false;
    setPresets((current) => [
      ...current,
      { key: createFilterPresetKey(), ...normalizeDraft(draft) },
    ]);
    return true;
  };

  const update = (key: string, draft: V2FilterPresetDraft) =>
    setPresets((current) =>
      current.map((item) =>
        item.key === key ? { ...item, ...normalizeDraft(draft) } : item,
      ),
    );

  const remove = (key: string) =>
    setPresets((current) => current.filter((item) => item.key !== key));

  return {
    presets,
    activeKey,
    baseGroupKey: activeGroupKey,
    /** Bộ lọc gốc mặc định cho bản nháp mới: nhóm đang chọn, hoặc "Tất cả" */
    defaultGroupKey: activeGroupKey ?? V2_FILTER_GROUP_ALL_KEY,
    editorSource,
    canCreate: presets.length < V2_FILTER_PRESETS_MAX,
    isNameTaken,
    select,
    create,
    update,
    remove,
  };
}

/** Chuẩn hóa nội dung lưu: tên bỏ khoảng trắng đầu cuối; điều kiện giữ nguyên định dạng snapshot */
const normalizeDraft = (draft: V2FilterPresetDraft) => ({
  label: draft.label.trim(),
  groupKey: draft.groupKey,
  query: draft.query,
});

export type V2FilterPresetsApi = ReturnType<typeof useV2FilterPresets>;
