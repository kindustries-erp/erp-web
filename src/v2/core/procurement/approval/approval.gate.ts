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

/** Thông tin người duyệt và người tạo của một chứng từ, dùng để quyết định quyền duyệt. */
export interface ApprovalSubject {
  approverId: string | null | undefined;
  createdBy: string | null | undefined;
}

/**
 * Lọc hành động theo khóa duyệt. Duyệt/từ chối hiện khi khóa bật và:
 * - người đang đăng nhập không phải người tạo chứng từ (khớp backend `assertNotSelfApproval`), và
 * - chứng từ chưa chỉ định người duyệt (giữ như cũ), hoặc người đăng nhập chính là người được chọn.
 */
export function applyApprovalGate(
  actions: ProcurementActionKey[],
  gate: ApprovalGate,
  subject: ApprovalSubject,
): ProcurementActionKey[] {
  if (!gate.configured) return actions;
  const { approverId, createdBy } = subject;
  const isCreator = Boolean(createdBy) && createdBy === gate.currentUserId;
  const canDecide =
    gate.enabled &&
    !isCreator &&
    (!approverId || approverId === gate.currentUserId);
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
