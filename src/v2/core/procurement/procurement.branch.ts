/**
 * Đặt mục chi nhánh xuống ngay trước ghi chú khi chi nhánh là tùy chọn (Garage).
 * Khi không tùy chọn (luồng thường) giữ nguyên thứ tự gốc. Các mục khác giữ thứ tự tương đối.
 */
export function placeBranchField<T extends { key: string }>(
  items: T[],
  branchKeys: readonly string[],
  branchOptional: boolean,
): T[] {
  if (!branchOptional) return items;
  const branch = items.filter((item) => branchKeys.includes(item.key));
  const rest = items.filter((item) => !branchKeys.includes(item.key));
  const remarksAt = rest.findIndex((item) => item.key === "remarks");
  const insertAt = remarksAt === -1 ? rest.length : remarksAt;
  return [...rest.slice(0, insertAt), ...branch, ...rest.slice(insertAt)];
}
