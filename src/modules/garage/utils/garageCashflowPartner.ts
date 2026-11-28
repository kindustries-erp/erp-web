/**
 * Đối tác hiển thị của phiếu thu chi: chỉ phiếu THU được lấy tên khách của phiếu dịch vụ
 * khi để trống. Cùng quy tắc với API (garage-cashflow-partner.ts).
 */
export const isReceiptType = (voucherType?: string | null): boolean =>
  (voucherType || "").toUpperCase() === "RECEIPT";

export const getVoucherPartnerName = (voucher?: {
  voucherType?: string | null;
  partnerName?: string | null;
  case?: { khachHangName?: string | null } | null;
}): string =>
  voucher?.partnerName ||
  (isReceiptType(voucher?.voucherType) ? voucher?.case?.khachHangName : "") ||
  "";
