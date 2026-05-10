import { useMemo, useState } from "react";
import type {
  AccountingPeriod,
  JournalEntryAccount,
  JournalEntryFormLine,
} from "@/modules/accounting/types/journalEntry";
import { JournalEntryLineTable } from "@/modules/accounting/components/JournalEntryLineTable";
import {
  buildCreatePayload,
  emptyJournalLine,
  getLineTotals,
  isBalanced,
} from "@/modules/accounting/utils/journalEntryUtils";
import { useT } from "@/core/i18n";

interface Props {
  accounts: JournalEntryAccount[];
  periods: AccountingPeriod[];
  saving: boolean;
  error?: string;
  onSubmit: (payload: ReturnType<typeof buildCreatePayload>) => Promise<unknown>;
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
  const [lines, setLines] = useState<JournalEntryFormLine[]>([
    emptyJournalLine(),
    emptyJournalLine(),
  ]);
  const [localError, setLocalError] = useState("");

  const totals = useMemo(() => getLineTotals(lines), [lines]);
  const canSubmit =
    date &&
    description.trim() &&
    lines.length >= 2 &&
    lines.every((line) => line.account_id) &&
    isBalanced(lines) &&
    !saving;

  async function submit() {
    setLocalError("");
    if (!canSubmit) {
      setLocalError(t("journalEntries.form.validationError"));
      return;
    }
    await onSubmit(
      buildCreatePayload({
        voucher_no: voucherNo,
        date,
        period_id: periodId,
        description,
        lines,
      }),
    );
    setVoucherNo("");
    setDescription("");
    setLines([emptyJournalLine(), emptyJournalLine()]);
  }

  return (
    <div className="space-y-4">
      {(error || localError) && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {error || localError}
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <label className="space-y-1 text-xs">
          <span className="text-[color:var(--muted-fg)]">{t("journalEntries.form.voucherNo")}</span>
          <input
            value={voucherNo}
            onChange={(e) => setVoucherNo(e.target.value)}
            placeholder={t("journalEntries.form.autoVoucher")}
            className="w-full rounded-lg border border-border bg-surface px-3 py-2 outline-none focus:border-primary"
          />
        </label>
        <label className="space-y-1 text-xs">
          <span className="text-[color:var(--muted-fg)]">{t("journalEntries.form.date")}</span>
          <input
            value={date}
            onChange={(e) => setDate(e.target.value)}
            type="date"
            className="w-full rounded-lg border border-border bg-surface px-3 py-2 outline-none focus:border-primary"
          />
        </label>
        <label className="space-y-1 text-xs">
          <span className="text-[color:var(--muted-fg)]">{t("journalEntries.form.period")}</span>
          <select
            value={periodId}
            onChange={(e) => setPeriodId(e.target.value)}
            className="w-full rounded-lg border border-border bg-surface px-3 py-2 outline-none focus:border-primary"
          >
            <option value="">{t("journalEntries.form.autoPeriod")}</option>
            {periods.map((period) => (
              <option key={period.id} value={period.id}>
                {period.name} ({period.status})
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-1 text-xs">
          <span className="text-[color:var(--muted-fg)]">{t("journalEntries.form.description")}</span>
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-lg border border-border bg-surface px-3 py-2 outline-none focus:border-primary"
          />
        </label>
      </div>

      <JournalEntryLineTable lines={lines} accounts={accounts} onChange={setLines} />

      <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-surface p-3 text-xs">
        <div className="text-[color:var(--muted-fg)]">
          {t("journalEntries.form.difference")}: {(totals.debit - totals.credit).toLocaleString("vi-VN")}
        </div>
        <button
          type="button"
          disabled={!canSubmit}
          onClick={submit}
          className="rounded-lg bg-primary px-4 py-2 text-xs font-medium text-primary-fg disabled:opacity-50"
        >
          {saving ? t("common.processing") : t("journalEntries.actions.createDraft")}
        </button>
      </div>
    </div>
  );
}
