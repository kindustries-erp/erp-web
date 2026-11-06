import type { ProcurementActionKey } from "../procurement.rules";

/**
 * Trạng thái khóa duyệt của một màn/drawer. `configured` = họ có API cấu hình duyệt;
 * không có thì mọi hành động giữ nguyên như trước.
 */
export interface ApprovalGate {
  configured: boolean;
  enabled: boolean;
  currentUserId: string | null;
}

export const NO_APPROVAL_GATE: ApprovalGate = {
  configured: false,
  enabled: true,
  currentUserId: null,
};

/**
 * Lọc hành động theo khóa duyệt. Duyệt/từ chối chỉ hiện khi khóa bật và
 * (chứng từ chưa chỉ định người duyệt, hoặc người đang đăng nhập chính là người được chọn).
 */
export function applyApprovalGate(
  actions: ProcurementActionKey[],
  gate: ApprovalGate,
  approverId: string | null | undefined,
): ProcurementActionKey[] {
  if (!gate.configured) return actions;
  const canDecide =
    gate.enabled && (!approverId || approverId === gate.currentUserId);
  return actions.filter(
    (action) => (action !== "approve" && action !== "reject") || canDecide,
  );
}

/** Gửi duyệt khi khóa bật phải chọn người duyệt (mở modal). Khóa tắt thì gửi thẳng. */
export function requiresApproverPick(
  gate: ApprovalGate,
  action: ProcurementActionKey,
): boolean {
  return gate.configured && gate.enabled && action === "submit";
}
