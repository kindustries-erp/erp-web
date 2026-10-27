/** Sổ quỹ tiền mặt từ `GET /bank-transactions-core/cash-books` (chỉ trường dùng cho phiếu) */
export interface CashBookDto {
  id: string;
  name: string;
  branchId?: string | null;
  accountingAccountId?: string | null;
}

/** Body `POST /bank-transactions-core/transactions/manual` cho phiếu thu/chi tiền mặt */
export interface CreateCashVoucherDto {
  branchId?: string;
  sourceType: "CASH";
  cashBookId: string;
  transDate: string;
  debitAmount: number;
  creditAmount: number;
  description: string;
  correspondentName: string;
}
