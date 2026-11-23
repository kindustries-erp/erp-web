import type { V2ViewPreset } from "../toolbar/V2StandardTable.toolbar.type";

/** Cột hiển thị theo thứ tự các cột đang có; cột không chọn thì tắt */
export const buildViewVisibility = (
  orderedKeys: string[],
  visibleKeys: string[],
): Record<string, boolean> =>
  Object.fromEntries(
    orderedKeys.map((key) => [key, visibleKeys.includes(key)]),
  );

interface BuildViewInput {
  name: string;
  visibility: Record<string, boolean>;
  order: string[];
  filterKey?: string;
}

/** Sửa view: giữ key và baseKey; filterKey bỏ trống thì giữ nguyên của view cũ */
export const buildEditedView = (
  view: V2ViewPreset,
  input: BuildViewInput,
): V2ViewPreset => {
  const filterKey = input.filterKey ?? view.filterKey;
  return {
    ...view,
    label: input.name,
    visibility: input.visibility,
    order: input.order,
    ...(filterKey !== undefined && { filterKey }),
  };
};

/** Tạo view mới từ nền `baseKey` */
export const buildNewView = (
  baseKey: string,
  input: BuildViewInput,
): V2ViewPreset => ({
  key: `custom_${Date.now()}`,
  label: input.name,
  baseKey,
  visibility: input.visibility,
  order: input.order,
  ...(input.filterKey !== undefined && { filterKey: input.filterKey }),
});
