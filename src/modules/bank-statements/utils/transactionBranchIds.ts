import { isSameBranchIds, resolveBranchIds } from "@/shared/utils/branchIds";

/** Danh sách chi nhánh của một giao dịch sao kê (dùng chung logic với hóa đơn). */
export const resolveTransactionBranchIds = resolveBranchIds;

export { isSameBranchIds };
