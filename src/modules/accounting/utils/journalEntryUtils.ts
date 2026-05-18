import type {
  CreateJournalEntryPayload,
  JournalEntry,
  JournalEntryAccount,
  JournalEntryFormLine,
  JournalEntryLine,
  SimpleJournalEntryFormLine,
} from "@/modules/accounting/types/journalEntry";

export function money(value: number | string | null | undefined): number {
  const n = Number(value ?? 0);
  return Number.isFinite(n) ? n : 0;
}

export function formatMoney(value: number | string | null | undefined): string {
  return money(value).toLocaleString("vi-VN", { maximumFractionDigits: 2 });
}

export function getAccountId(account: string | JournalEntryAccount): string {
  return typeof account === "string" ? account : account.id;
}

export function getAccountLabel(account: string | JournalEntryAccount): string {
  if (typeof account === "string") return account;
  return [account.account_code, account.account_name]
    .filter(Boolean)
    .join(" — ");
}

export function getPeriodLabel(period: JournalEntry["period_id"]): string {
  if (!period) return "-";
  return typeof period === "string" ? period : period.name;
}

export function getLineTotals(
  lines: JournalEntryFormLine[] | JournalEntryLine[],
) {
  return lines.reduce(
    (acc, line) => {
      acc.debit += money(line.debit);
      acc.credit += money(line.credit);
      return acc;
    },
    { debit: 0, credit: 0 },
  );
}

export function isBalanced(lines: JournalEntryFormLine[] | JournalEntryLine[]) {
  const totals = getLineTotals(lines);
  return totals.debit > 0 && Math.abs(totals.debit - totals.credit) < 0.001;
}

export function emptyJournalLine(): JournalEntryFormLine {
  return { account_id: "", debit: "0", credit: "0", description: "" };
}

export function buildCreatePayload(form: {
  voucher_no: string;
  date: string;
  period_id: string;
  description: string;
  lines: JournalEntryFormLine[];
}): CreateJournalEntryPayload {
  return {
    ...(form.voucher_no.trim() ? { voucher_no: form.voucher_no.trim() } : {}),
    date: form.date,
    ...(form.period_id ? { period_id: form.period_id } : {}),
    description: form.description.trim(),
    reference_type: "manual",
    lines: form.lines.map((line, index) => ({
      account_id: line.account_id,
      debit: money(line.debit),
      credit: money(line.credit),
      description: line.description.trim(),
      sort: index,
    })),
  };
}

export function emptySimpleLine(): SimpleJournalEntryFormLine {
  return {
    debit_account_id: "",
    credit_account_id: "",
    amount: "0",
    description: "",
  };
}

/** Build payload from simplified form (1 row → 2 journal lines) */
export function buildCreatePayloadFromSimple(form: {
  voucher_no: string;
  date: string;
  period_id: string;
  description: string;
  lines: SimpleJournalEntryFormLine[];
}): CreateJournalEntryPayload {
  const lines: CreateJournalEntryPayload["lines"] = [];
  form.lines.forEach((sl, i) => {
    const amt = money(sl.amount);
    lines.push(
      {
        account_id: sl.debit_account_id,
        debit: amt,
        credit: 0,
        description: sl.description.trim(),
        sort: i * 2,
      },
      {
        account_id: sl.credit_account_id,
        debit: 0,
        credit: amt,
        description: sl.description.trim(),
        sort: i * 2 + 1,
      },
    );
  });
  return {
    ...(form.voucher_no.trim() ? { voucher_no: form.voucher_no.trim() } : {}),
    date: form.date,
    ...(form.period_id ? { period_id: form.period_id } : {}),
    description: form.description.trim(),
    reference_type: "manual",
    lines,
  };
}
