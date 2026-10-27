import type { JournalEntryLineDto } from "../../api/accountingLookupApi";

export interface AccountTotal {
  accountId: string;
  debit: number;
  credit: number;
}

export interface JournalEntrySummary {
  accounts: AccountTotal[];
  totalDebit: number;
  totalCredit: number;
  balanced: boolean;
}

/** Gộp dòng bút toán theo tài khoản và tính tổng Nợ/Có; lệch dưới 1 xu coi là cân bằng */
export function summarizeJournalEntry(
  lines: Pick<JournalEntryLineDto, "accountId" | "debit" | "credit">[],
): JournalEntrySummary {
  const byAccount = new Map<string, AccountTotal>();
  for (const line of lines) {
    const current = byAccount.get(line.accountId) ?? {
      accountId: line.accountId,
      debit: 0,
      credit: 0,
    };
    current.debit += Number(line.debit || 0);
    current.credit += Number(line.credit || 0);
    byAccount.set(line.accountId, current);
  }
  const accounts = [...byAccount.values()];
  const totalDebit = accounts.reduce((sum, a) => sum + a.debit, 0);
  const totalCredit = accounts.reduce((sum, a) => sum + a.credit, 0);
  return {
    accounts,
    totalDebit,
    totalCredit,
    balanced: Math.abs(totalDebit - totalCredit) < 0.01,
  };
}
