import type { V2FilterGroup } from "./V2ViewModeCombobox.type";

const DEFAULT_ALL_KEY = "all";

/** Filter đang lọc khi key khác "tất cả" */
export const isFilterActive = (group?: V2FilterGroup): boolean =>
  Boolean(group) && group?.activeKey !== (group?.allKey ?? DEFAULT_ALL_KEY);

/** Nhãn trigger: "Tổng quan • Mới" khi có filter; chỉ có filter thì hiện nhãn filter */
export const getTriggerLabel = (
  viewLabel: string | undefined,
  group?: V2FilterGroup,
): string => {
  const filterLabel = group?.items.find(
    (item) => item.key === group.activeKey,
  )?.label;
  if (!viewLabel) return filterLabel ?? "";
  return isFilterActive(group) && filterLabel
    ? `${viewLabel} • ${filterLabel}`
    : viewLabel;
};
