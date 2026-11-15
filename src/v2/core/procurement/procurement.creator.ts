import type { ProcurementActionKey } from "./procurement.rules";

/** Hành động chỉ người tạo được thực hiện, kèm khóa i18n và lý do mặc định */
export const CREATOR_ONLY_ACTION_REASON: Partial<
  Record<ProcurementActionKey, { key: string; fallback: string }>
> = {
  submit: {
    key: "v2.procurement.actions.submitNotCreatorReason",
    fallback: "Chỉ người tạo mới được gửi duyệt",
  },
};

/** Thông tin người tạo của chứng từ (đề nghị hoặc đơn mua). */
export interface ProcurementCreatorRef {
  createdBy?: string | null;
  createdByEmail?: string | null;
}

/**
 * Chỉ người tạo chứng từ mới được gửi duyệt (khớp luật API).
 * Hủy và xóa không kiểm người tạo: quyền do ma trận RBAC quyết định.
 * Chứng từ không có thông tin người tạo thì không chặn.
 * So khớp theo id hoặc email (không phân biệt hoa thường).
 */
export function isProcurementCreator(
  doc: ProcurementCreatorRef,
  currentUserId?: string | null,
  currentUserEmail?: string | null,
): boolean {
  const hasCreatorInfo = Boolean(doc.createdBy || doc.createdByEmail);
  if (!hasCreatorInfo) return true;
  const idMatch = Boolean(
    doc.createdBy && currentUserId && doc.createdBy === currentUserId,
  );
  const emailMatch = Boolean(
    doc.createdByEmail &&
    currentUserEmail &&
    doc.createdByEmail.toLowerCase() === currentUserEmail.toLowerCase(),
  );
  return idMatch || emailMatch;
}
