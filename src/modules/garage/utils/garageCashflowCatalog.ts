/**
 * Danh mục phiếu thu chi garage. Bản đối ứng của
 * erp-api/src/kgara-api-core/helpers/garage-cashflow-catalog.ts, đổi danh mục thì sửa cả hai.
 * Chuỗi là dữ liệu đang lưu trong DB: không đổi tên, không đánh số lại.
 */
export const GARAGE_RECEIPT_CONTENTS: readonly string[] = [
  "1. KH thanh toán",
  "2. Tất toán",
  "3. BH thanh toán",
  "8. Cấn trừ",
  "12. Hoàn ứng",
  "13. Khác",
];

export const GARAGE_PAYMENT_CONTENTS: readonly string[] = [
  "4. HHBH",
  "5. HH Bán hàng",
  "6. HH Xưởng",
  "7. Ứng trước",
  "8. Cấn trừ",
  "9. Phụ tùng / vật tư",
  "10. Vật tư tiêu hao",
  "11. Chi phí vận hành",
  "13. Khác",
];

/** Nội dung hệ thống tự gán cho phiếu thu dự thu, người dùng không chọn được. */
export const GARAGE_FORECAST_RECEIPT_CONTENT = "Dự thu hoàn tất phiếu dịch vụ";

/** Nội dung phải gắn phiếu dịch vụ; không gắn thì ghi chú lý do. */
export const GARAGE_CONTENTS_REQUIRING_CASE: readonly string[] = [
  "1. KH thanh toán",
  "3. BH thanh toán",
  "8. Cấn trừ",
];

export const GARAGE_PAYMENT_METHODS: readonly string[] = [
  "Tiền mặt",
  "Chuyển khoản",
  "Chuyển khoản khác",
  "Thẻ tín dụng",
  "Khác",
];

export const requiresCase = (content?: string | null): boolean =>
  !!content && GARAGE_CONTENTS_REQUIRING_CASE.includes(content);

export const getGarageContentsForType = (
  voucherType?: string | null,
): readonly string[] =>
  (voucherType || "").toUpperCase() === "PAYMENT"
    ? GARAGE_PAYMENT_CONTENTS
    : GARAGE_RECEIPT_CONTENTS;
