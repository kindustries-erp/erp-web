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
