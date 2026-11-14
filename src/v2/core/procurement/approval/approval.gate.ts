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
  /** Khóa tắt thì "Gửi duyệt" ghi nhận luôn: ẩn khỏi menu, drawer xử lý thay */
  directConfirmWhenOff = false,
): ProcurementActionKey[] {
  const { approverId, createdBy } = subject;
  const isCreator = Boolean(createdBy) && createdBy === gate.currentUserId;
  // Thu hồi chỉ người tạo (khớp backend). Phiếu không có người tạo thì giữ như cũ.
  const canRecall = !createdBy || isCreator;
  if (!gate.configured) {
    return actions.filter((action) => action !== "recall" || canRecall);
  }
  const canDecide =
    gate.enabled &&
    !isCreator &&
    (!approverId || approverId === gate.currentUserId);
  const hideSubmit = directConfirmWhenOff && !gate.enabled;
  return actions.filter((action) => {
    if (action === "approve" || action === "reject") return canDecide;
    if (action === "recall") return canRecall;
    if (action === "submit") return !hideSubmit;
    return true;
  });
}

/** Gửi duyệt khi khóa bật phải chọn người duyệt (mở modal). Khóa tắt thì gửi thẳng. */
export function requiresApproverPick(
  gate: ApprovalGate,
  action: ProcurementActionKey,
): boolean {
  return gate.configured && gate.enabled && action === "submit";
}
