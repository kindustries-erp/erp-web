import type { CashTransactionDto } from "../../../api/dtos/cashTransaction.dto";

export interface BankVoucherPreviewProps {
  transaction: CashTransactionDto;
  t?: (key: string, options?: Record<string, unknown>) => string;
}

export interface BankTheme {
  code: string;
  bankLabel: string;
  paperTone: string;
  titleColor: string;
  accentBorder: string;
  accentBox: string;
  stripe: string;
}
