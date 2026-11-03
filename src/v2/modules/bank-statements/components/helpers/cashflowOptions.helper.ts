import {
  CASHFLOW_CLASSIFICATION_VALUES,
  CASHFLOW_PURPOSE_VALUES,
  CASHFLOW_PURPOSES_BY_CLASSIFICATION,
  type CashflowClassification,
  type CashflowPurpose,
} from "../../domain/value-objects/cashflowAttributes";

/** Hàm dịch V2 (`useV2Translation().t`), chỉ cần khóa để tra từ điển */
type Translate = (key: string) => string;

export interface CashflowOption<T extends string> {
  value: T;
  label: string;
}

/** Ô trống khi chưa có giá trị hoặc giá trị không hợp lệ */
const EMPTY_LABEL = "—";

const isClassification = (value: string): value is CashflowClassification =>
  (CASHFLOW_CLASSIFICATION_VALUES as readonly string[]).includes(value);

const isPurpose = (value: string): value is CashflowPurpose =>
  (CASHFLOW_PURPOSE_VALUES as readonly string[]).includes(value);

export const getClassificationLabel = (
  t: Translate,
  value?: string | null,
): string =>
  value && isClassification(value)
    ? t(`v2.bankStatements.cashflow.classification.${value}`)
    : EMPTY_LABEL;

export const getPurposeLabel = (t: Translate, value?: string | null): string =>
  value && isPurpose(value)
    ? t(`v2.bankStatements.cashflow.purpose.${value}`)
    : EMPTY_LABEL;

export const buildClassificationOptions = (
  t: Translate,
): CashflowOption<CashflowClassification>[] =>
  CASHFLOW_CLASSIFICATION_VALUES.map((value) => ({
    value,
    label: getClassificationLabel(t, value),
  }));

/** Chỉ trả các mục đích thuộc phân loại đã chọn; chưa chọn phân loại thì rỗng */
export const buildPurposeOptions = (
  t: Translate,
  classification: CashflowClassification | null | undefined,
): CashflowOption<CashflowPurpose>[] =>
  classification
    ? CASHFLOW_PURPOSES_BY_CLASSIFICATION[classification].map((value) => ({
        value,
        label: getPurposeLabel(t, value),
      }))
    : [];
