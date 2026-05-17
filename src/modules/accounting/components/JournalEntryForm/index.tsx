import { useState } from "react";
import type {
  AccountingPeriod,
  JournalEntryAccount,
  SimpleJournalEntryFormLine,
} from "@/modules/accounting/types/journalEntry";
import {
  buildCreatePayloadFromSimple,
  emptySimpleLine,
  formatMoney,
  getAccountLabel,
  money,
} from "@/modules/accounting/utils/journalEntryUtils";
import { useT } from "@/core/i18n";


interface Props {
  accounts: JournalEntryAccount[];
  periods: AccountingPeriod[];
  saving: boolean;
  error?: string;
  onSubmit: (payload: ReturnType<typeof buildCreatePayloadFromSimple>) => Promise<unknown>;
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

export function JournalEntryForm({ accounts, periods, saving, error, onSubmit }: Props) {
  const t = useT();
  const [voucherNo, setVoucherNo] = useState("");
  const [date, setDate] = useState(today());
  const [periodId, setPeriodId] = useState("");
  const [description, setDescription] = useState("");
  const [lines, setLines] = useState<SimpleJournalEntryFormLine[]>([emptySimpleLine()]);
  const [localError, setLocalError] = useState("");

  function updateLine(i: number, field: keyof SimpleJournalEntryFormLine, value: string) {
    setLines((prev) => prev.map((l, idx) => (idx === i ? { ...l, [field]: value } : l)));
  }

  function addLine() {
    setLines((prev) => [...prev, emptySimpleLine()]);
  }

  function removeLine(i: number) {
    setLines((prev) => prev.length > 1 ? prev.filter((_, idx) => idx !== i) : prev);
  }

  const isValid =
    date &&
    description.trim() &&
    lines.length >= 1 &&
    lines.every((l) => l.debit_account_id && l.credit_account_id && money(l.amount) > 0);

  async function submit() {
    setLocalError("");
    if (!isValid) {
      setLocalError(t("journalEntries.form.validationError"));
      return;
    }
    await onSubmit(
      buildCreatePayloadFromSimple({
        voucher_no: voucherNo,
        date,
        period_id: periodId,
        description,
        lines,
      })
    );
    setVoucherNo("");
    setDescription("");
    setLines([emptySimpleLine()]);
  }

  const cls =
    "w-full rounded-lg border border-border bg-surface px-3 py-2 text-xs outline-none focus:border-primary";

  return (
    <div className="space-y-4">
      {(error || localError) && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {error || localError}
        </div>
      )}

      {/* Header fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <label className="space-y-1 text-xs">
          <span className="text-[color:var(--muted-fg)]">{t("journalEntries.form.voucherNo")}</span>
          <input
            value={voucherNo}
            onChange={(e) => setVoucherNo(e.target.value)}
            placeholder={t("journalEntries.form.autoVoucher")}
            className={cls}
          />
        </label>
        <label className="space-y-1 text-xs">
          <span className="text-[color:var(--muted-fg)]">{t("journalEntries.form.date")}</span>
          <input value={date} onChange={(e) => setDate(e.target.value)} type="date" className={cls} />
        </label>
        <label className="space-y-1 text-xs">
          <span className="text-[color:var(--muted-fg)]">{t("journalEntries.form.period")}</span>
          <select value={periodId} onChange={(e) => setPeriodId(e.target.value)} className={cls}>
            <option value="">{t("journalEntries.form.autoPeriod")}</option>
            {periods.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.status})
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-1 text-xs">
          <span className="text-[color:var(--muted-fg)]">Chi nhánh</span>
        </label>
        <label className="space-y-1 text-xs">
          <span className="text-[color:var(--muted-fg)]">{t("journalEntries.form.description")}</span>
          <input value={description} onChange={(e) => setDescription(e.target.value)} className={cls} />
        </label>
      </div>

      {/* Lines table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="border-b border-border text-[color:var(--muted-fg)]">
              <th className="py-2 pr-2 text-left font-medium">{t("journalEntries.form.debitAccount")}</th>
              <th className="py-2 pr-2 text-left font-medium">{t("journalEntries.form.creditAccount")}</th>
              <th className="py-2 pr-2 text-right font-medium w-32">{t("journalEntries.form.amount")}</th>
              <th className="py-2 pr-2 text-left font-medium">{t("journalEntries.form.lineDescription")}</th>
              <th className="py-2 w-8" />
            </tr>
          </thead>
          <tbody>
            {lines.map((line, i) => (
              <tr key={i} className="border-b border-border/50">
                {/* Debit account */}
                <td className="py-1.5 pr-2">
                  <select
                    value={line.debit_account_id}
                    onChange={(e) => updateLine(i, "debit_account_id", e.target.value)}
                    className={cls}
                  >
                    <option value="">{t("journalEntries.form.selectAccount")}</option>
                    {accounts.map((a) => (
                      <option key={a.id} value={a.id}>
                        {getAccountLabel(a)}
                      </option>
                    ))}
                  </select>
                </td>
                {/* Credit account */}
                <td className="py-1.5 pr-2">
                  <select
                    value={line.credit_account_id}
                    onChange={(e) => updateLine(i, "credit_account_id", e.target.value)}
                    className={cls}
                  >
                    <option value="">{t("journalEntries.form.selectAccount")}</option>
                    {accounts.map((a) => (
                      <option key={a.id} value={a.id}>
                        {getAccountLabel(a)}
                      </option>
                    ))}
                  </select>
                </td>
                {/* Amount */}
                <td className="py-1.5 pr-2">
                  <input
                    type="number"
                    min="0"
                    value={line.amount}
                    onChange={(e) => updateLine(i, "amount", e.target.value)}
                    className={`${cls} text-right`}
                  />
                </td>
                {/* Description */}
                <td className="py-1.5 pr-2">
                  <input
                    value={line.description}
                    onChange={(e) => updateLine(i, "description", e.target.value)}
                    className={cls}
                  />
                </td>
                <td className="py-1.5 text-center">
                  <button
                    type="button"
                    onClick={() => removeLine(i)}
                    className="text-[color:var(--muted-fg)] hover:text-red-500 px-1"
                    title="Xóa dòng"
                  >
                    ×
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={2} className="pt-2">
                <button
                  type="button"
                  onClick={addLine}
                  className="text-xs text-primary hover:underline"
                >
                  + {t("journalEntries.form.addLine")}
                </button>
              </td>
              <td className="pt-2 text-right text-xs font-medium pr-2">
                {formatMoney(lines.reduce((s, l) => s + money(l.amount), 0))}
              </td>
              <td colSpan={2} />
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          disabled={!isValid || saving}
          onClick={submit}
          className="rounded-lg bg-primary px-4 py-2 text-xs font-medium text-primary-fg disabled:opacity-50"
        >
          {saving ? t("common.processing") : t("journalEntries.actions.createDraft")}
        </button>
      </div>
    </div>
  );
}
