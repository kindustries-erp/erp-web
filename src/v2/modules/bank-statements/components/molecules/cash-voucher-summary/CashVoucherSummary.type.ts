import type { CashTransactionDto } from "../../../api/dtos/cashTransaction.dto";

/** Hàm dịch V2, chỉ cần khóa để tra từ điển */
export type CashDetailTranslate = (
  key: string,
  options?: Record<string, unknown>,
) => string;

export interface CashVoucherSummaryProps {
  transaction: CashTransactionDto;
  t: CashDetailTranslate;
}
