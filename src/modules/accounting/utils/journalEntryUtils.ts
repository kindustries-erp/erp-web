import type {
  CreateJournalEntryPayload,
  JournalEntry,
  JournalEntryAccount,
  JournalEntryFormLine,
  JournalEntryLine,
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
  return [account.account_code, account.account_name].filter(Boolean).join(" — ");
}

export function getPeriodLabel(period: JournalEntry["period_id"]): string {
  if (!period) return "-";
  return typeof period === "string" ? period : period.name;
}

export function getLineTotals(lines: JournalEntryFormLine[] | JournalEntryLine[]) {
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
