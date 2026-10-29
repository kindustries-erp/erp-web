/**
 * Danh sách chi nhánh của một bản ghi (hóa đơn, sao kê).
 * `branchIds` là nguồn chuẩn; dữ liệu cũ chỉ có `branchId` thì dùng `branchId`;
 * chỉ có quan hệ `branch` thì dùng `branch.id`. Không có thì trả về mảng rỗng.
 */
export function resolveBranchIds(
  record:
    | {
        branchIds?: string[] | null;
        branchId?: string | null;
        branch?: { id?: string | null } | null;
      }
    | null
    | undefined,
): string[] {
  if (!record) return [];
  if (record.branchIds?.length) return record.branchIds;
  if (record.branchId) return [record.branchId];
  if (record.branch?.id) return [record.branch.id];
  return [];
}

/** So sánh hai danh sách chi nhánh không phụ thuộc thứ tự */
export function isSameBranchIds(a: string[], b: string[]): boolean {
  return (
    a.length === b.length && [...a].sort().join(",") === [...b].sort().join(",")
  );
}
