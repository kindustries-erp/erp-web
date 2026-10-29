import type {
  CashflowClassification,
  CashflowPurpose,
} from "../../../domain/value-objects/cashflowAttributes";
import type { CashDetailTranslate } from "../cash-voucher-summary/CashVoucherSummary.type";

export interface CashClassificationFieldsProps {
  classification: CashflowClassification | null;
  purpose: CashflowPurpose | null;
  editMode: boolean;
  onClassificationChange: (value: CashflowClassification | null) => void;
  onPurposeChange: (value: CashflowPurpose | null) => void;
  t: CashDetailTranslate;
}
