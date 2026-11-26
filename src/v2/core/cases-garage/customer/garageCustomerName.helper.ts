/**
 * Tên khách in trên phiếu KGara chỉ đáng hiện khi khác tên khách danh mục
 * (KGara lưu `KhachHangName` và `TenKhachHang` riêng; ERP không gộp hai field).
 */
export function voucherNameIfDiffers(
  customerName: string | null | undefined,
  voucherName: string | null | undefined,
): string | null {
  const voucher = (voucherName ?? "").trim();
  if (!voucher) return null;
  const customer = (customerName ?? "").trim();
  return voucher.localeCompare(customer, "vi", { sensitivity: "base" }) === 0
    ? null
    : voucher;
}
