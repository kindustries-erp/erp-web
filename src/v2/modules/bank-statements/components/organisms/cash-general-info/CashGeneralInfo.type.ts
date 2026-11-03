import type { CashTransactionDto } from "../../../api/dtos/cashTransaction.dto";
import type { BranchOptionDto } from "../../../api/dtos/partnerStats.dto";
import type {
  CashflowClassification,
  CashflowPurpose,
} from "../../../domain/value-objects/cashflowAttributes";
import type { CashDetailTranslate } from "../../molecules/cash-voucher-summary/CashVoucherSummary.type";

/** Trạng thái sửa được của phần thông tin chung (chi nhánh, đối tượng, ghi chú, phân loại) */
export interface CashGeneralDraft {
  branchIds: string[];
  partnerValue: string | null;
  partnerLabel: string | null;
  description: string;
  classification: CashflowClassification | null;
  purpose: CashflowPurpose | null;
}

export interface CashGeneralInfoProps {
  transaction: CashTransactionDto;
  editMode: boolean;
  draft: CashGeneralDraft;
  branchOptions: BranchOptionDto[];
  onBranchChange: (ids: string[]) => void;
  onPartnerChange: (value: string | null, label: string | null) => void;
  onDescriptionChange: (value: string) => void;
  onClassificationChange: (value: CashflowClassification | null) => void;
  onPurposeChange: (value: CashflowPurpose | null) => void;
  t: CashDetailTranslate;
}
