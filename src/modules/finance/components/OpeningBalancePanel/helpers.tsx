import type { OpeningBalance } from "@/modules/finance/api/financeApi";

export interface SoDuForm {
  fiscal_period: string;
  balance_date: string;
  account_id: string;
  cash_fund_id: string;
  company_bank_account_id: string;
  debit_amount: string;
  credit_amount: string;
  currency: string;
  note: string;
}

export const emptyForm: SoDuForm = {
  fiscal_period: "",
  balance_date: "",
  account_id: "",
  cash_fund_id: "",
  company_bank_account_id: "",
  debit_amount: "",
  credit_amount: "",
  currency: "VND",
  note: "",
};

export const TODAY = new Date().toISOString().split("T")[0];
export const PERIOD_VALUES: string[] = (() => {
  const today = new Date();
  return Array.from({ length: 36 }, (_, i) => {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  });
})();

export function periodFromDate(date: string) { return date.slice(0, 7); }
export function firstDayOfPeriod(period: string) { return `${period}-01`; }
export function periodLabel(period: string, t: any) {
  const [y, m] = period.split("-").map(Number);
  return Number.isFinite(y) && Number.isFinite(m)
    ? t("voucher.openingBalance.monthLabel").replace("{0}", m).replace("{1}", y)
    : period;
}

export function buildForm(b: OpeningBalance): SoDuForm {
  return {
    fiscal_period: b.fiscal_period,
    balance_date: b.balance_date,
    account_id: b.account_id,
    cash_fund_id: b.cash_fund_id ?? "",
    company_bank_account_id: b.company_bank_account_id ?? "",
    debit_amount: b.debit_amount != null ? String(b.debit_amount) : "",
    credit_amount: b.credit_amount != null ? String(b.credit_amount) : "",
    currency: b.currency ?? "VND",
    note: b.note ?? "",
  };
}

export function ErrorBanner({ msg }: { msg: string }) {
  return <div className="text-xs text-[color:var(--warn-fg)] bg-[color:var(--warn-bg)] border border-[color:var(--warn-fg)]/30 rounded-lg px-3 py-2 mt-3">{msg}</div>;
}
export function IconEdit() { return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>; }
export function IconTrash() { return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" /></svg>; }
export function IconPlus() { return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>; }
export const fmt = (v: number | null) => v != null ? Number(v).toLocaleString("vi-VN") : "0";
