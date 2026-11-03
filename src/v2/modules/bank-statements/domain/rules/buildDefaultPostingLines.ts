import type { CashTransactionDto } from "../../api/dtos/cashTransaction.dto";
import type { PostingDraftLine } from "../entities/cashTransaction";

type IdFactory = () => string;

/**
 * Bút toán mặc định của một giao dịch chưa hạch toán: dòng TK đối ứng (Nợ khi thu, Có khi chi)
 * và dòng TK để trống để người dùng chọn. Không đủ số tiền hoặc TK thì trả về rỗng.
 */
export function buildDefaultPostingLines(
  tx: Pick<
    CashTransactionDto,
    | "sourceType"
    | "creditAmount"
    | "debitAmount"
    | "bankAccount"
    | "cashBook"
    | "correspondentAccountingAccountId"
  >,
  description: string,
  createId: IdFactory,
): PostingDraftLine[] {
  const credit = Number(tx.creditAmount || 0);
  const debit = Number(tx.debitAmount || 0);
  const amount = Math.max(credit, debit);
  const defaultAccount =
    tx.sourceType === "BANK"
      ? tx.bankAccount?.accountingAccountId || ""
      : tx.cashBook?.accountingAccountId || "";
  const partnerAccount =
    defaultAccount || tx.correspondentAccountingAccountId || "";
  if (!amount || !partnerAccount) return [];

  const isReceipt = credit > 0;
  return [
    {
      id: createId(),
      accountId: partnerAccount,
      debit: isReceipt ? amount : 0,
      credit: isReceipt ? 0 : amount,
      description,
    },
    {
      id: createId(),
      accountId: "",
      debit: isReceipt ? 0 : amount,
      credit: isReceipt ? amount : 0,
      description,
    },
  ];
}
