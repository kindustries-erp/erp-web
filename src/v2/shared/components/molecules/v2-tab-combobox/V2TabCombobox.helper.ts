import type { V2TabComboboxItem } from "./V2TabCombobox.type";

/** Trích xuất khóa định danh duy nhất của tab (ưu tiên value -> key -> id) */
export const getItemKey = (item: V2TabComboboxItem): string =>
  item.value ?? item.key ?? item.id ?? "";

/** Tìm kiếm tab đang được chọn dựa theo activeKey, fallback về tab đầu tiên */
export const getActiveItem = (
  items: V2TabComboboxItem[] | undefined,
  activeKey?: string,
): V2TabComboboxItem | undefined => {
  if (!items || items.length === 0) return undefined;
  return items.find((i) => getItemKey(i) === activeKey) ?? items[0];
};
