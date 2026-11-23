import type { V2FilterPresetQuery } from "../toolbar/V2StandardTable.toolbar.type";

/**
 * Snapshot chờ áp sau khi bảng remount (đổi bộ lọc gốc làm tab dựng lại).
 * Đọc một lần: consume xong thì xóa, tránh áp lại khi mount lại sau.
 */
const pending = new Map<string, V2FilterPresetQuery>();

export const setPendingFilterPreset = (
  tableId: string,
  query: V2FilterPresetQuery,
): void => {
  pending.set(tableId, query);
};

export const consumePendingFilterPreset = (
  tableId: string,
): V2FilterPresetQuery | undefined => {
  const query = pending.get(tableId);
  pending.delete(tableId);
  return query;
};
