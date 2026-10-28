export function formatTaxInvoiceStatus(
  val?: number | null,
  t?: (key: string, fallback: string) => string,
) {
  const translate = t || ((_k: string, fb: string) => fb);
  switch (val) {
    case 1:
      return translate("taxStatusNew", "Mới");
    case 2:
      return translate("taxStatusReplaced", "Thay thế");
    case 3:
      return translate("taxStatusAdjusted", "Điều chỉnh");
    case 4:
      return translate("taxStatusWasReplaced", "Bị thay thế");
    case 5:
      return translate("taxStatusWasAdjusted", "Bị điều chỉnh");
    case 6:
      return translate("taxStatusCancelled", "Bị hủy");
    default:
      return val?.toString() || "—";
  }
}

export function formatTaxProcessStatus(val?: number | null) {
  switch (val) {
    case 0:
      return "Cục Thuế đã nhận";
    case 1:
      return "Đang tiến hành kiểm tra điều kiện cấp mã";
    case 2:
      return "CQT từ chối hóa đơn theo từng lần phát sinh";
    case 3:
      return "Hóa đơn đủ điều kiện cấp mã";
    case 4:
      return "Hóa đơn không đủ điều kiện cấp mã";
    case 5:
      return "Đã cấp mã hóa đơn";
    case 6:
      return "Cục Thuế đã nhận không mã";
    case 7:
      return "Đã kiểm tra định kỳ HĐĐT không có mã";
    case 8:
      return "Cục Thuế đã nhận hóa đơn có mã khởi tạo từ máy tính tiền";
    default:
      return val?.toString() || "—";
  }
}
