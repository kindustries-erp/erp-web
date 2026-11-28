export type CashflowTranslate = (key: string, def?: string) => string;

export interface CashflowFilterOption {
  label: string;
  value: string;
}

const OPTION_KEY = "garage.cashflow.optionLabels";

/**
 * Giá trị lọc (value) giữ nguyên để khớp dữ liệu DB và API;
 * chỉ nhãn hiển thị đi qua i18n.
 */
const CONTENT_OPTIONS: ReadonlyArray<readonly [string, string]> = [
  ["c1", "1. KH thanh toán"],
  ["c2", "2. Tất toán"],
  ["c3", "3. BH thanh toán"],
  ["c4", "4. HHBH"],
  ["c5", "5. HH Bán hàng"],
  ["c6", "6. HH Xưởng"],
  ["c7", "7. Ứng trước"],
  ["c8", "8. Cấn trừ"],
  ["c9", "9. Phụ tùng / vật tư"],
  ["c10", "10. Vật tư tiêu hao"],
  ["c11", "11. Chi phí vận hành"],
  ["c12", "12. Hoàn ứng"],
  ["c13", "13. Khác"],
];

/** Tab Dự thu/Dự chi: Dự thu, Dự chi, Đã duyệt. Tab Thu/Chi: Đã thu, Đã chi. */
export const getPaymentStatusOptions = (
  isForecast: boolean,
  tr: CashflowTranslate,
): CashflowFilterOption[] => {
  if (isForecast) {
    return [
      {
        label: tr(`${OPTION_KEY}.status.expected`, "Dự thu"),
        value: "EXPECTED",
      },
      {
        label: tr(`${OPTION_KEY}.status.pending`, "Dự chi"),
        value: "PENDING",
      },
      {
        label: tr(`${OPTION_KEY}.status.approved`, "Đã duyệt"),
        value: "APPROVED",
      },
    ];
  }
  return [
    {
      label: tr(`${OPTION_KEY}.status.receiptPaid`, "Đã thu"),
      value: "RECEIPT_PAID",
    },
    {
      label: tr(`${OPTION_KEY}.status.paymentPaid`, "Đã chi"),
      value: "PAYMENT_PAID",
    },
  ];
};

export const getPaymentMethodOptions = (
  tr: CashflowTranslate,
): CashflowFilterOption[] => [
  { label: tr(`${OPTION_KEY}.method.cash`, "Tiền mặt"), value: "Tiền mặt" },
  {
    label: tr(`${OPTION_KEY}.method.transfer`, "Chuyển khoản"),
    value: "Chuyển khoản",
  },
  {
    label: tr(`${OPTION_KEY}.method.transferOther`, "Chuyển khoản khác"),
    value: "Chuyển khoản khác",
  },
  {
    label: tr(`${OPTION_KEY}.method.card`, "Thẻ tín dụng"),
    value: "Thẻ tín dụng",
  },
  { label: tr(`${OPTION_KEY}.method.other`, "Khác"), value: "Khác" },
];

export const getPaymentContentOptions = (
  tr: CashflowTranslate,
): CashflowFilterOption[] =>
  CONTENT_OPTIONS.map(([key, value]) => ({
    label: tr(`${OPTION_KEY}.content.${key}`, value),
    value,
  }));
