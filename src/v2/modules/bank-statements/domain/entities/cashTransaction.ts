import type {
  CashflowClassification,
  CashflowPurpose,
} from "../value-objects/cashflowAttributes";

/** Dòng bút toán đang soạn trong ô hạch toán (id là khóa React phía client) */
export interface PostingDraftLine {
  id: string;
  accountId: string;
  debit: number;
  credit: number;
  description: string;
}

/** Trạng thái form phân loại dòng tiền */
export interface CashClassificationDraft {
  classification: CashflowClassification | null;
  purpose: CashflowPurpose | null;
}

/** Mã lỗi nghiệp vụ của hạch toán; UI map sang chuỗi i18n */
export type PostingValidationError =
  | "MISSING_POSTING_DATE"
  | "NO_LINES"
  | "MISSING_ACCOUNT"
  | "UNBALANCED";

export interface PostingValidationResult {
  ok: boolean;
  error?: PostingValidationError;
}
