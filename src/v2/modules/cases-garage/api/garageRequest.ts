/** Header chi nhánh ERP của API garage v2: không bắt buộc, không gửi thì backend trả mọi chi nhánh. */
export const ERP_BRANCH_HEADER = "x-erp-branch-id";

/** Cấu hình request kèm chi nhánh ERP khi có chọn; không chọn thì rỗng. */
export const branchHeaders = (
  branchId?: string,
): { headers?: Record<string, string> } =>
  branchId ? { headers: { [ERP_BRANCH_HEADER]: branchId } } : {};

/** Bỏ các khóa rỗng để query string gọn và backend dùng giá trị mặc định. */
export function compactParams<T extends object>(params: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(params).filter(
      ([, v]) => v !== undefined && v !== null && v !== "",
    ),
  ) as Partial<T>;
}
