/**
 * Hành động "Thông tin tra cứu" trên dòng danh sách: chỉ cho HĐ mua vào chưa có PDF,
 * để người dùng mở thẻ tra cứu và tự tải PDF từ cổng nhà cung cấp.
 */
export function shouldShowLookupAction(
  direction: "IN" | "OUT",
  invoice: { pdfFileKey?: string | null },
  hasPdf: boolean,
): boolean {
  return direction === "IN" && !hasPdf && !invoice.pdfFileKey;
}
