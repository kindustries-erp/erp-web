import type {
  JournalEntryAccount,
  JournalEntryFormLine,
} from "@/modules/accounting/types/journalEntry";
import { formatMoney, getLineTotals } from "@/modules/accounting/utils/journalEntryUtils";
import { useT } from "@/core/i18n";

interface Props {
  lines: JournalEntryFormLine[];
  accounts: JournalEntryAccount[];
  onChange: (lines: JournalEntryFormLine[]) => void;
}

export function JournalEntryLineTable({ lines, accounts, onChange }: Props) {
  const t = useT();
  const totals = getLineTotals(lines);

  function update(index: number, patch: Partial<JournalEntryFormLine>) {
    onChange(lines.map((line, i) => (i === index ? { ...line, ...patch } : line)));
  }

  function remove(index: number) {
    if (lines.length <= 2) return;
    onChange(lines.filter((_, i) => i !== index));
  }

  return (
    <div className="rounded-xl border border-border overflow-hidden bg-surface">
      <div className="overflow-x-auto">
        <table className="min-w-full text-xs">
          <thead className="bg-surface-hover text-[color:var(--muted-fg)]">
            <tr>
              <th className="text-left font-medium px-3 py-2 w-[30%]">{t("journalEntries.form.account")}</th>
              <th className="text-right font-medium px-3 py-2 w-[15%]">{t("journalEntries.form.debit")}</th>
              <th className="text-right font-medium px-3 py-2 w-[15%]">{t("journalEntries.form.credit")}</th>
              <th className="text-left font-medium px-3 py-2">{t("journalEntries.form.lineDescription")}</th>
              <th className="px-3 py-2 w-12" />
            </tr>
          </thead>
          <tbody>
            {lines.map((line, index) => (
              <tr key={index} className="border-t border-border">
                <td className="px-3 py-2">
                  <select
                    value={line.account_id}
                    onChange={(e) => update(index, { account_id: e.target.value })}
                    className="w-full rounded-lg border border-border bg-surface px-2 py-1.5 outline-none focus:border-primary"
                  >
                    <option value="">{t("journalEntries.form.selectAccount")}</option>
                    {accounts.map((account) => (
                      <option key={account.id} value={account.id}>
                        {[account.account_code, account.account_name].filter(Boolean).join(" — ")}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-3 py-2">
                  <input
                    value={line.debit}
                    onChange={(e) => update(index, { debit: e.target.value, credit: e.target.value === "" || Number(e.target.value) === 0 ? line.credit : "0" })}
                    inputMode="decimal"
                    className="w-full rounded-lg border border-border bg-surface px-2 py-1.5 text-right outline-none focus:border-primary"
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    value={line.credit}
                    onChange={(e) => update(index, { credit: e.target.value, debit: e.target.value === "" || Number(e.target.value) === 0 ? line.debit : "0" })}
                    inputMode="decimal"
                    className="w-full rounded-lg border border-border bg-surface px-2 py-1.5 text-right outline-none focus:border-primary"
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    value={line.description}
                    onChange={(e) => update(index, { description: e.target.value })}
                    className="w-full rounded-lg border border-border bg-surface px-2 py-1.5 outline-none focus:border-primary"
                  />
                </td>
                <td className="px-3 py-2 text-right">
                  <button
                    type="button"
                    disabled={lines.length <= 2}
                    onClick={() => remove(index)}
                    className="text-[color:var(--danger,#dc2626)] disabled:opacity-30"
                  >
                    ×
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-surface-hover border-t border-border font-semibold">
            <tr>
              <td className="px-3 py-2 text-right">{t("journalEntries.form.total")}</td>
              <td className="px-3 py-2 text-right">{formatMoney(totals.debit)}</td>
              <td className="px-3 py-2 text-right">{formatMoney(totals.credit)}</td>
              <td className="px-3 py-2" colSpan={2}>
                {Math.abs(totals.debit - totals.credit) < 0.001
                  ? t("journalEntries.form.balanced")
                  : t("journalEntries.form.unbalanced")}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
      <div className="p-3 border-t border-border">
        <button
          type="button"
          onClick={() => onChange([...lines, { account_id: "", debit: "0", credit: "0", description: "" }])}
          className="rounded-lg border border-border px-3 py-1.5 text-xs hover:bg-surface-hover"
        >
          {t("journalEntries.form.addLine")}
        </button>
      </div>
    </div>
  );
}
