import { BookOpen, Plus } from "lucide-react";
import { useState } from "react";
import { PageHeader } from "@/shared/components/PageHeader";
import { DrawerModal } from "@/shared/components/DrawerModal";
import { useT } from "@/core/i18n";
import {
  useJournalEntries,
  useJournalEntryActions,
  useJournalEntryLookups,
} from "@/modules/accounting/hooks/useJournalEntries";
import { JournalEntryForm } from "@/modules/accounting/components/JournalEntryForm";
import type { JournalEntry, JournalEntryLine } from "@/modules/accounting/types/journalEntry";
import {
  formatMoney,
  getAccountLabel,
  money,
  getPeriodLabel,
} from "@/modules/accounting/utils/journalEntryUtils";

// ─── helpers ──────────────────────────────────────────────────────────────────

function getJournalLineAmount(line: JournalEntryLine): number {
  const d = money(line.debit);
  return d > 0 ? d : money(line.credit);
}

/**
 * Pair lines by sort order into [debit_line, credit_line] pairs.
 * If pairing fails, return each line as standalone.
 */
function pairLines(lines: JournalEntryLine[]) {
  type Pair = { debit: JournalEntryLine | null; credit: JournalEntryLine | null };
  const pairs: Pair[] = [];
  const sorted = [...lines].sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0));
  let i = 0;
  while (i < sorted.length) {
    const cur = sorted[i];
    const d = money(cur.debit);
    const c = money(cur.credit);
    if (d > 0 && i + 1 < sorted.length && money(sorted[i + 1].credit) > 0) {
      pairs.push({ debit: cur, credit: sorted[i + 1] });
      i += 2;
    } else if (c > 0 && i + 1 < sorted.length && money(sorted[i + 1].debit) > 0) {
      pairs.push({ debit: sorted[i + 1], credit: cur });
      i += 2;
    } else {
      pairs.push({ debit: d > 0 ? cur : null, credit: c > 0 ? cur : null });
      i += 1;
    }
  }
  return pairs;
}

// ─── component ────────────────────────────────────────────────────────────────

export function NhatKyChung() {
  const t = useT();
  const list = useJournalEntries();
  const lookups = useJournalEntryLookups();
  const actions = useJournalEntryActions(list.load);
  const [createOpen, setCreateOpen] = useState(false);
  const [reverseReason, setReverseReason] = useState("");
  const [detailEntry, setDetailEntry] = useState<JournalEntry | null>(null);

  function openDetail(entry: JournalEntry) {
    setDetailEntry(entry);
    // Also fetch full detail in background to ensure lines are populated
    if (!entry.lines || entry.lines.length === 0) {
      actions.openDetail(entry.id);
    } else {
      actions.setSelected(entry);
    }
  }

  const displayEntry = actions.selected ?? detailEntry;

  return (
    <div className="p-5 space-y-4">
      <PageHeader
        title={t("journalEntries.title")}
        desc={t("journalEntries.desc")}
        icon={<BookOpen className="w-5 h-5" />}
        actions={
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-fg"
          >
            <Plus className="w-4 h-4" /> {t("journalEntries.actions.new")}
          </button>
        }
      />

      {/* Filters */}
      <div className="rounded-2xl border border-border bg-surface p-4 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-3">
          <input
            value={list.search}
            onChange={(e) => { list.setSearch(e.target.value); list.setPage(1); }}
            placeholder={t("journalEntries.filters.search")}
            className="rounded-lg border border-border bg-surface px-3 py-2 text-xs outline-none focus:border-primary"
          />
          <select
            value={list.accountId}
            onChange={(e) => { list.setAccountId(e.target.value); list.setPage(1); }}
            className="rounded-lg border border-border bg-surface px-3 py-2 text-xs outline-none focus:border-primary"
          >
            <option value="">{t("journalEntries.filters.account")}</option>
            {lookups.accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {[a.account_code, a.account_name].filter(Boolean).join(" — ")}
              </option>
            ))}
          </select>
          <select
            value={list.periodId}
            onChange={(e) => { list.setPeriodId(e.target.value); list.setPage(1); }}
            className="rounded-lg border border-border bg-surface px-3 py-2 text-xs outline-none focus:border-primary"
          >
            <option value="">{t("journalEntries.filters.period")}</option>
            {lookups.periods.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <input
            value={list.dateFrom}
            onChange={(e) => { list.setDateFrom(e.target.value); list.setPage(1); }}
            type="date"
            className="rounded-lg border border-border bg-surface px-3 py-2 text-xs outline-none focus:border-primary"
          />
          <input
            value={list.dateTo}
            onChange={(e) => { list.setDateTo(e.target.value); list.setPage(1); }}
            type="date"
            className="rounded-lg border border-border bg-surface px-3 py-2 text-xs outline-none focus:border-primary"
          />
        </div>
        <div className="flex items-center justify-between text-xs text-[color:var(--muted-fg)]">
          <span>{t("journalEntries.total")}: {list.total}</span>
          <button type="button" onClick={list.resetFilters} className="hover:text-foreground">
            {t("journalEntries.filters.reset")}
          </button>
        </div>
      </div>

      {list.error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">{list.error}</div>
      )}

      {/* Journal Table — 1 row per journal line, grouped by voucher */}
      <div className="rounded-2xl border border-border bg-surface overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-xs">
            <thead className="bg-surface-hover text-[color:var(--muted-fg)]">
              <tr>
                <th className="px-3 py-2 text-left font-medium">{t("journalEntries.columns.voucherNo")}</th>
                <th className="px-3 py-2 text-left font-medium">{t("journalEntries.columns.date")}</th>
                <th className="px-3 py-2 text-left font-medium">{t("journalEntries.form.debitAccount")}</th>
                <th className="px-3 py-2 text-left font-medium">{t("journalEntries.form.creditAccount")}</th>
                <th className="px-3 py-2 text-right font-medium">{t("journalEntries.form.amount")}</th>
                <th className="px-3 py-2 text-left font-medium">{t("journalEntries.form.lineDescription")}</th>
              </tr>
            </thead>
            <tbody>
              {list.loading ? (
                <tr>
                  <td colSpan={6} className="px-3 py-8 text-center text-[color:var(--muted-fg)]">
                    {t("journalEntries.loading")}
                  </td>
                </tr>
              ) : list.items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-3 py-8 text-center text-[color:var(--muted-fg)]">
                    {t("common.noData")}
                  </td>
                </tr>
              ) : (
                list.items.flatMap((entry) => {
                  const lines = entry.lines ?? [];
                  const pairs = pairLines(lines);

                  if (pairs.length === 0) {
                    // No lines yet — show one placeholder row
                    return [
                      <tr
                        key={entry.id}
                        onClick={() => openDetail(entry)}
                        className="border-t border-border cursor-pointer hover:bg-surface-hover"
                      >
                        <td className="px-3 py-2 font-medium">{entry.voucher_no || entry.id.slice(0, 8)}</td>
                        <td className="px-3 py-2">{entry.date}</td>
                        <td className="px-3 py-2 text-[color:var(--muted-fg)]" colSpan={4}>
                          {entry.description || "-"}
                        </td>
                      </tr>,
                    ];
                  }

                  return pairs.map((pair, pi) => (
                    <tr
                      key={`${entry.id}-${pi}`}
                      onClick={() => openDetail(entry)}
                      className="border-t border-border cursor-pointer hover:bg-surface-hover"
                    >
                      {/* Voucher info only on first pair row */}
                      {pi === 0 ? (
                        <>
                          <td
                            className="px-3 py-2 font-medium align-top"
                            rowSpan={pairs.length}
                          >
                            {entry.voucher_no || entry.id.slice(0, 8)}
                          </td>
                          <td
                            className="px-3 py-2 align-top"
                            rowSpan={pairs.length}
                          >
                            {entry.date}
                          </td>
                        </>
                      ) : null}
                      <td className="px-3 py-2">{pair.debit ? getAccountLabel(pair.debit.account_id) : "-"}</td>
                      <td className="px-3 py-2">{pair.credit ? getAccountLabel(pair.credit.account_id) : "-"}</td>
                      <td className="px-3 py-2 text-right">
                        {pair.debit ? formatMoney(money(pair.debit.debit)) : pair.credit ? formatMoney(money(pair.credit.credit)) : "-"}
                      </td>
                      <td className="px-3 py-2 max-w-[200px] truncate">
                        {(pair.debit ?? pair.credit)?.description || entry.description || "-"}
                      </td>
                    </tr>
                  ));
                })
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between gap-3 border-t border-border px-3 py-2 text-xs">
          <button
            type="button"
            disabled={list.page <= 1}
            onClick={() => list.setPage(Math.max(1, list.page - 1))}
            className="rounded-lg border border-border px-3 py-1.5 disabled:opacity-40"
          >
            {t("journalEntries.pagination.prev")}
          </button>
          <span>{list.page} / {Math.max(1, list.totalPages)}</span>
          <button
            type="button"
            disabled={list.page >= Math.max(1, list.totalPages)}
            onClick={() => list.setPage(list.page + 1)}
            className="rounded-lg border border-border px-3 py-1.5 disabled:opacity-40"
          >
            {t("journalEntries.pagination.next")}
          </button>
        </div>
      </div>

      {/* Create modal */}
      <DrawerModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title={t("journalEntries.form.title")}
        subtitle={t("journalEntries.form.subtitle")}
        panelClassName="max-w-[980px]"
      >
        <JournalEntryForm
          accounts={lookups.accounts}
          periods={lookups.periods}
          saving={actions.saving}
          error={actions.error}
          onSubmit={async (payload) => {
            await actions.create(payload);
            setCreateOpen(false);
          }}
        />
      </DrawerModal>

      {/* Detail modal */}
      <DrawerModal
        open={!!(displayEntry || actions.detailLoading)}
        onClose={() => {
          actions.setSelected(null);
          actions.setError("");
          setDetailEntry(null);
          setReverseReason("");
        }}
        title={displayEntry?.voucher_no || t("journalEntries.detail.title")}
        subtitle={displayEntry?.description || undefined}
        panelClassName="max-w-[860px]"
      >
        {actions.error && (
          <div className="mb-3 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">
            {actions.error}
          </div>
        )}
        {actions.detailLoading && !displayEntry ? (
          <div className="p-6 text-center text-xs text-[color:var(--muted-fg)]">{t("journalEntries.loading")}</div>
        ) : displayEntry ? (
          <div className="space-y-4 text-xs">
            {/* Header info */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 rounded-xl border border-border p-3">
              <div>
                <div className="text-[color:var(--muted-fg)]">{t("journalEntries.columns.date")}</div>
                <div>{displayEntry.date}</div>
              </div>
              <div>
                <div className="text-[color:var(--muted-fg)]">{t("journalEntries.columns.period")}</div>
                <div>{getPeriodLabel(displayEntry.period_id)}</div>
              </div>
              <div>
                <div className="text-[color:var(--muted-fg)]">{t("journalEntries.form.total")}</div>
                <div>{formatMoney(displayEntry.total_debit)}</div>
              </div>
            </div>

            {/* Lines table — simplified 4-column view */}
            <div className="rounded-xl border border-border overflow-hidden">
              <table className="min-w-full">
                <thead className="bg-surface-hover text-[color:var(--muted-fg)]">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium">{t("journalEntries.form.debitAccount")}</th>
                    <th className="px-3 py-2 text-left font-medium">{t("journalEntries.form.creditAccount")}</th>
                    <th className="px-3 py-2 text-right font-medium">{t("journalEntries.form.amount")}</th>
                    <th className="px-3 py-2 text-left font-medium">{t("journalEntries.form.lineDescription")}</th>
                  </tr>
                </thead>
                <tbody>
                  {pairLines(displayEntry.lines ?? []).map((pair, pi) => (
                    <tr key={pi} className="border-t border-border">
                      <td className="px-3 py-2">{pair.debit ? getAccountLabel(pair.debit.account_id) : "-"}</td>
                      <td className="px-3 py-2">{pair.credit ? getAccountLabel(pair.credit.account_id) : "-"}</td>
                      <td className="px-3 py-2 text-right">
                        {pair.debit
                          ? formatMoney(money(pair.debit.debit))
                          : pair.credit
                          ? formatMoney(money(pair.credit.credit))
                          : "-"}
                      </td>
                      <td className="px-3 py-2">
                        {(pair.debit ?? pair.credit)?.description || displayEntry.description || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Reverse action */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <input
                value={reverseReason}
                onChange={(e) => setReverseReason(e.target.value)}
                placeholder={t("journalEntries.actions.reverseReason")}
                className="min-w-[260px] flex-1 rounded-lg border border-border bg-surface px-3 py-2 outline-none focus:border-primary"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={displayEntry.status !== "posted" || actions.saving}
                  onClick={() => actions.reverse(displayEntry.id, { reason: reverseReason })}
                  className="rounded-lg border border-border px-3 py-2 disabled:opacity-40"
                >
                  {t("journalEntries.actions.reverse")}
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </DrawerModal>
    </div>
  );
}
