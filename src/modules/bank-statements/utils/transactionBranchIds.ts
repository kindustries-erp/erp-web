/**
 * Danh sách chi nhánh của một giao dịch sao kê.
 * Ưu tiên branchIds; nếu thiếu thì dùng branchId, rồi quan hệ branch.id.
 * Không có chi nhánh nào thì trả về mảng rỗng.
 */
export function resolveTransactionBranchIds(
  transaction:
    | {
        branchIds?: string[] | null;
        branchId?: string | null;
        branch?: { id?: string | null } | null;
      }
    | null
    | undefined,
): string[] {
  if (!transaction) return [];
  if (transaction.branchIds?.length) return transaction.branchIds;
  if (transaction.branchId) return [transaction.branchId];
  if (transaction.branch?.id) return [transaction.branch.id];
  return [];
}

/** So sánh hai danh sách chi nhánh không phụ thuộc thứ tự */
export function isSameBranchIds(a: string[], b: string[]): boolean {
  return (
    a.length === b.length && [...a].sort().join(",") === [...b].sort().join(",")
  );
}
