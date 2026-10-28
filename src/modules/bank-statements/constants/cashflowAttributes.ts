export const CASHFLOW_CLASSIFICATION_VALUES = [
  "OPERATING",
  "INVESTING",
  "FINANCING",
  "OTHER",
] as const;

export type CashflowClassification =
  (typeof CASHFLOW_CLASSIFICATION_VALUES)[number];

export const CASHFLOW_PURPOSE_VALUES = [
  "CUSTOMER_PAYMENT",
  "SUPPLIER_PAYMENT",
  "SALARY",
  "TAX",
  "SOCIAL_INSURANCE",
  "BANK_FEE",
  "RENT",
  "INSURANCE_CLAIM",
  "ADVANCE",
  "REFUND",
  "LOAN",
  "OPEX",
  "ASSET_PURCHASE",
  "ASSET_DISPOSAL",
  "INVESTMENT",
  "INTEREST_INCOME",
  "CAPITAL",
  "INTERNAL_TRANSFER",
  "OTHER",
] as const;

export type CashflowPurpose = (typeof CASHFLOW_PURPOSE_VALUES)[number];

// Mirror của API: CASHFLOW_PURPOSES_BY_CLASSIFICATION.
export const CASHFLOW_PURPOSES_BY_CLASSIFICATION: Record<
  CashflowClassification,
  readonly CashflowPurpose[]
> = {
  OPERATING: [
    "CUSTOMER_PAYMENT",
    "SUPPLIER_PAYMENT",
    "SALARY",
    "TAX",
    "SOCIAL_INSURANCE",
    "BANK_FEE",
    "RENT",
    "INSURANCE_CLAIM",
    "ADVANCE",
    "REFUND",
    "OPEX",
    "OTHER",
  ],
  INVESTING: [
    "ASSET_PURCHASE",
    "ASSET_DISPOSAL",
    "INVESTMENT",
    "INTEREST_INCOME",
    "OTHER",
  ],
  FINANCING: ["LOAN", "CAPITAL", "OTHER"],
  OTHER: ["INTERNAL_TRANSFER", "OTHER"],
};

// Nhãn tiếng Việt dùng làm defaultValue; nhãn thật đi qua i18n key bên dưới.
export const CASHFLOW_CLASSIFICATION_LABELS: Record<
  CashflowClassification,
  string
> = {
  OPERATING: "Hoạt động kinh doanh",
  INVESTING: "Đầu tư",
  FINANCING: "Tài chính",
  OTHER: "Khác",
};

export const CASHFLOW_PURPOSE_LABELS: Record<CashflowPurpose, string> = {
  CUSTOMER_PAYMENT: "Khách hàng thanh toán",
  SUPPLIER_PAYMENT: "Thanh toán nhà cung cấp",
  SALARY: "Lương",
  TAX: "Thuế",
  SOCIAL_INSURANCE: "BHXH",
  BANK_FEE: "Phí ngân hàng",
  RENT: "Thuê mặt bằng / kho",
  INSURANCE_CLAIM: "Bồi thường bảo hiểm",
  ADVANCE: "Tạm ứng / Hoàn ứng",
  REFUND: "Hoàn tiền khách",
  LOAN: "Vay / Trả nợ",
  OPEX: "Chi phí vận hành",
  ASSET_PURCHASE: "Mua sắm tài sản",
  ASSET_DISPOSAL: "Thanh lý tài sản",
  INVESTMENT: "Đầu tư / Thu hồi đầu tư",
  INTEREST_INCOME: "Lãi tiền gửi",
  CAPITAL: "Góp vốn / Chia lợi nhuận",
  INTERNAL_TRANSFER: "Chuyển nội bộ",
  OTHER: "Khác",
};

type Translate = (key: string, options: { defaultValue: string }) => string;

export const getClassificationLabel = (
  t: Translate,
  value?: string | null,
): string =>
  value && value in CASHFLOW_CLASSIFICATION_LABELS
    ? t(`bankStatement.cashflowClassificationOptions.${value}`, {
        defaultValue:
          CASHFLOW_CLASSIFICATION_LABELS[value as CashflowClassification],
      })
    : "—";

export const getPurposeLabel = (t: Translate, value?: string | null): string =>
  value && value in CASHFLOW_PURPOSE_LABELS
    ? t(`bankStatement.cashflowPurposeOptions.${value}`, {
        defaultValue: CASHFLOW_PURPOSE_LABELS[value as CashflowPurpose],
      })
    : "—";

export const buildClassificationOptions = (t: Translate) =>
  CASHFLOW_CLASSIFICATION_VALUES.map((value) => ({
    value,
    label: getClassificationLabel(t, value),
  }));

// Chỉ trả các Mục đích thuộc Phân loại đã chọn; chưa chọn Phân loại thì rỗng.
export const buildPurposeOptions = (
  t: Translate,
  classification: CashflowClassification | null | undefined,
) =>
  classification
    ? CASHFLOW_PURPOSES_BY_CLASSIFICATION[classification].map((value) => ({
        value,
        label: getPurposeLabel(t, value),
      }))
    : [];

export const isPurposeAllowed = (
  classification: CashflowClassification | null | undefined,
  purpose: CashflowPurpose | null | undefined,
): boolean => {
  if (!purpose) return true;
  if (!classification) return false;
  return CASHFLOW_PURPOSES_BY_CLASSIFICATION[classification].includes(purpose);
};
