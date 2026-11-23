/** Hành động duyệt và chuyển trạng thái của họ procurement (PR và PO dùng chung kiểu). */
export type ProcurementActionKey =
  | "submit"
  | "recall"
  | "approve"
  | "reject"
  | "issue"
  | "cancel"
  | "close";

/** Hành động bắt buộc nhập lý do (khớp PROCUREMENT_ORDER_ACTIONS_REQUIRING_REASON ở API). */
export const PROCUREMENT_REASON_ACTIONS: readonly ProcurementActionKey[] = [
  "reject",
  "cancel",
  "close",
];

/** Hành động cần người duyệt khác người tạo (API trả 403 nếu tự duyệt). */
export const PROCUREMENT_APPROVER_ACTIONS: readonly ProcurementActionKey[] = [
  "approve",
  "reject",
];

/** Bảng từ trạng thái nguồn tới các hành động khả dụng, khớp transition ở API. */
export const PROCUREMENT_ORDER_FROM: Partial<
  Record<ProcurementActionKey, readonly string[]>
> = {
  submit: ["DRAFT"],
  recall: ["PENDING_APPROVAL"],
  approve: ["PENDING_APPROVAL"],
  reject: ["PENDING_APPROVAL"],
  issue: ["APPROVED"],
  cancel: ["APPROVED", "ISSUED"],
  close: ["ISSUED"],
};

export const PROCUREMENT_REQUEST_FROM: Partial<
  Record<ProcurementActionKey, readonly string[]>
> = {
  submit: ["DRAFT"],
  recall: ["PENDING_APPROVAL"],
  approve: ["PENDING_APPROVAL"],
  reject: ["PENDING_APPROVAL"],
  cancel: ["PENDING_APPROVAL", "APPROVED"],
  close: ["APPROVED"],
};

/** Các hành động khả dụng theo trạng thái; `from` là bảng transition của họ. */
export function availableProcurementActions(
  from: Partial<Record<ProcurementActionKey, readonly string[]>>,
  status: string,
  isDeleted = false,
): ProcurementActionKey[] {
  if (isDeleted) return [];
  return (Object.keys(from) as ProcurementActionKey[]).filter((action) =>
    from[action]?.includes(status),
  );
}

/** PO chỉ sửa, xóa mềm được khi còn nháp. */
export function isProcurementDraft(status: string): boolean {
  return status === "DRAFT";
}

/** Lý do không được để trống; trả về chuỗi đã cắt khoảng trắng hoặc null. */
export function cleanProcurementReason(reason: string): string | null {
  const trimmed = reason.trim();
  return trimmed ? trimmed : null;
}

/** Ngày hôm nay theo giờ máy, dạng yyyy-MM-dd cho ô ngày. */
export function todayIsoDate(now: Date = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Số tiền hiển thị theo locale vi-VN; rỗng thì "—". */
export function formatProcurementMoney(
  value: string | number | null | undefined,
): string {
  if (value === null || value === undefined || value === "") return "—";
  return Number(value).toLocaleString("vi-VN", { maximumFractionDigits: 3 });
}
