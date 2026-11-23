import type { V2FilterGroup } from "./V2ViewModeCombobox.type";

/** Key mặc định của mục "Tất cả" trong nhóm lọc (khi `allKey` không khai báo) */
export const V2_FILTER_GROUP_ALL_KEY = "all";

/** Filter đang lọc khi key khác "tất cả" */
export const isFilterActive = (group?: V2FilterGroup): boolean =>
  Boolean(group) &&
  group?.activeKey !== (group?.allKey ?? V2_FILTER_GROUP_ALL_KEY);

/**
 * Nhãn trigger: "Tổng quan • Mới" khi có filter; chỉ có filter thì hiện nhãn filter.
 * `presetLabel`: tên bộ lọc tùy chỉnh đang khớp, thay cho nhãn filter hệ thống.
 */
export const getTriggerLabel = (
  viewLabel: string | undefined,
  group?: V2FilterGroup,
  presetLabel?: string,
): string => {
  const systemLabel = group?.items.find(
    (item) => item.key === group.activeKey,
  )?.label;
  const filterLabel = presetLabel ?? systemLabel;
  const filterActive = presetLabel !== undefined || isFilterActive(group);
  if (!viewLabel) return filterLabel ?? "";
  return filterActive && filterLabel
    ? `${viewLabel} • ${filterLabel}`
    : viewLabel;
};
