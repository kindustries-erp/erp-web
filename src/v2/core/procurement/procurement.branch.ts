/**
 * Đặt mục chi nhánh ngay sau mục `afterKey` khi chi nhánh là tùy chọn (Garage).
 * Không có `afterKey` thì đặt cuối. Khi không tùy chọn giữ nguyên thứ tự gốc.
 */
export function placeBranchAfter<T extends { key: string }>(
  items: T[],
  branchKeys: readonly string[],
  afterKey: string,
  branchOptional: boolean,
): T[] {
  if (!branchOptional) return items;
  const branch = items.filter((item) => branchKeys.includes(item.key));
  const rest = items.filter((item) => !branchKeys.includes(item.key));
  const afterIndex = rest.findIndex((item) => item.key === afterKey);
  const insertAt = afterIndex === -1 ? rest.length : afterIndex + 1;
  return [...rest.slice(0, insertAt), ...branch, ...rest.slice(insertAt)];
}

/**
 * Sắp các mục theo thứ tự `orderedKeys` (đơn Garage). Mục không có trong danh sách
 * (ví dụ đề nghị mua khi chưa chọn) giữ nguyên thứ tự gốc và nằm sau các mục đã sắp.
 */
export function orderByKeys<T extends { key: string }>(
  items: T[],
  orderedKeys: readonly string[],
): T[] {
  const rank = (key: string) => {
    const index = orderedKeys.indexOf(key);
    return index === -1 ? orderedKeys.length : index;
  };
  return items
    .map((item, index) => ({ item, index }))
    .sort((a, b) => rank(a.item.key) - rank(b.item.key) || a.index - b.index)
    .map(({ item }) => item);
}

/** Thứ tự field đầu đơn mua Garage (chế độ sửa). */
export const GARAGE_ORDER_EDIT_KEYS = [
  "orderDate",
  "expectedDate",
  "requestId",
  "supplierInvoiceNo",
  "supplierId",
  "branchId",
  "remarks",
] as const;

/** Thứ tự field đầu đơn mua Garage (chế độ xem). */
export const GARAGE_ORDER_VIEW_KEYS = [
  "orderDate",
  "expectedDate",
  "request",
  "supplierInvoiceNo",
  "supplier",
  "branch",
  "remarks",
] as const;
