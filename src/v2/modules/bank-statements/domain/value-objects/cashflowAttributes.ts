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

export const isPurposeAllowed = (
  classification: CashflowClassification | null | undefined,
  purpose: CashflowPurpose | null | undefined,
): boolean => {
  if (!purpose) return true;
  if (!classification) return false;
  return CASHFLOW_PURPOSES_BY_CLASSIFICATION[classification].includes(purpose);
};
