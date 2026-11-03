import type { CashTransactionDto } from "../../../api/dtos/cashTransaction.dto";
import type {
  CashflowClassification,
  CashflowPurpose,
} from "../../../domain/value-objects/cashflowAttributes";

export interface BankGeneralDraft {
  branchIds: string[];
  partnerValue: string | null;
  partnerLabel: string | null;
  description: string;
  classification: CashflowClassification | null;
  purpose: CashflowPurpose | null;
}

export interface BankGeneralInfoProps {
  transaction: CashTransactionDto;
  draft: BankGeneralDraft;
  branchOptions: { value: string; label: string }[];
  editMode: boolean;
  onBranchChange: (branchIds: string[]) => void;
  onPartnerChange: (value: string | null, label: string | null) => void;
  onDescriptionChange: (value: string) => void;
  onClassificationChange: (value: CashflowClassification | null) => void;
  onPurposeChange: (value: CashflowPurpose | null) => void;
  t: (key: string, options?: Record<string, unknown>) => string;
}
