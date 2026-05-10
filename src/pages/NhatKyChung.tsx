import { BookOpen, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { PageHeader } from "@/shared/components/PageHeader";
import { DrawerModal } from "@/shared/components/DrawerModal";
import { useT } from "@/core/i18n";
import {
  useJournalEntries,
  useJournalEntryActions,
  useJournalEntryLookups,
} from "@/modules/accounting/hooks/useJournalEntries";
import { JournalEntryForm } from "@/modules/accounting/components/JournalEntryForm";
import { JOURNAL_ENTRY_STATUS_OPTIONS } from "@/modules/accounting/types/journalEntry";
import type { JournalEntryStatus } from "@/modules/accounting/types/journalEntry";
import {
  formatMoney,
  getAccountLabel,
  getLineTotals,
  getPeriodLabel,
} from "@/modules/accounting/utils/journalEntryUtils";

export function NhatKyChung() {
  const t = useT();
  const list = useJournalEntries();
  const lookups = useJournalEntryLookups();
  const actions = useJournalEntryActions(list.load);
  const [createOpen, setCreateOpen] = useState(false);
  const [reverseReason, setReverseReason] = useState("");

  const selectedTotals = useMemo(
    () => getLineTotals(actions.selected?.lines ?? []),
    [actions.selected?.lines],
  );

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

      <div className="rounded-2xl border border-border bg-surface p-4 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-3">
          <input
            value={list.search}
            onChange={(e) => {
              list.setSearch(e.target.value);
              list.setPage(1);
            }}
            placeholder={t("journalEntries.filters.search")}
            className="rounded-lg border border-border bg-surface px-3 py-2 text-xs outline-none focus:border-primary"
          />
          <select
            value={list.status}
            onChange={(e) => {
              list.setStatus(e.target.value as JournalEntryStatus | "");
              list.setPage(1);
            }}
            className="rounded-lg border border-border bg-surface px-3 py-2 text-xs outline-none focus:border-primary"
          >
            {JOURNAL_ENTRY_STATUS_OPTIONS.map((option) => (
              <option key={option.value || "all"} value={option.value}>
                {t(option.labelKey)}
              </option>
            ))}
          </select>
          <select
            value={list.accountId}
            onChange={(e) => {
              list.setAccountId(e.target.value);
              list.setPage(1);
            }}
            className="rounded-lg border border-border bg-surface px-3 py-2 text-xs outline-none focus:border-primary"
          >
            <option value="">{t("journalEntries.filters.account")}</option>
            {lookups.accounts.map((account) => (
              <option key={account.id} value={account.id}>
                {[account.account_code, account.account_name].filter(Boolean).join(" — ")}
              </option>
            ))}
          </select>
          <select
            value={list.periodId}
            onChange={(e) => {
              list.setPeriodId(e.target.value);
              list.setPage(1);
            }}
            className="rounded-lg border border-border bg-surface px-3 py-2 text-xs outline-none focus:border-primary"
          >
            <option value="">{t("journalEntries.filters.period")}</option>
            {lookups.periods.map((period) => (
              <option key={period.id} value={period.id}>{period.name}</option>
            ))}
          </select>
          <input
            value={list.dateFrom}
            onChange={(e) => {
              list.setDateFrom(e.target.value);
              list.setPage(1);
            }}
            type="date"
            className="rounded-lg border border-border bg-surface px-3 py-2 text-xs outline-none focus:border-primary"
          />
          <input
            value={list.dateTo}
            onChange={(e) => {
              list.setDateTo(e.target.value);
              list.setPage(1);
            }}
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

      {list.error && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">{list.error}</div>}

      <div className="rounded-2xl border border-border bg-surface overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-xs">
            <thead className="bg-surface-hover text-[color:var(--muted-fg)]">
              <tr>
                <th className="px-3 py-2 text-left font-medium">{t("journalEntries.columns.voucherNo")}</th>
                <th className="px-3 py-2 text-left font-medium">{t("journalEntries.columns.date")}</th>
                <th className="px-3 py-2 text-left font-medium">{t("journalEntries.columns.period")}</th>
                <th className="px-3 py-2 text-left font-medium">{t("journalEntries.columns.description")}</th>
                <th className="px-3 py-2 text-right font-medium">{t("journalEntries.columns.debit")}</th>
                <th className="px-3 py-2 text-right font-medium">{t("journalEntries.columns.credit")}</th>
                <th className="px-3 py-2 text-left font-medium">{t("journalEntries.columns.status")}</th>
              </tr>
            </thead>
            <tbody>
              {list.loading ? (
                <tr><td colSpan={7} className="px-3 py-8 text-center text-[color:var(--muted-fg)]">{t("journalEntries.loading")}</td></tr>
              ) : list.items.length === 0 ? (
                <tr><td colSpan={7} className="px-3 py-8 text-center text-[color:var(--muted-fg)]">{t("common.noData")}</td></tr>
              ) : (
                list.items.map((entry) => (
                  <tr
                    key={entry.id}
                    onClick={() => actions.openDetail(entry.id)}
                    className="border-t border-border cursor-pointer hover:bg-surface-hover"
                  >
                    <td className="px-3 py-2 font-medium">{entry.voucher_no || entry.id.slice(0, 8)}</td>
                    <td className="px-3 py-2">{entry.date}</td>
                    <td className="px-3 py-2">{getPeriodLabel(entry.period_id)}</td>
                    <td className="px-3 py-2 max-w-[320px] truncate">{entry.description || "-"}</td>
                    <td className="px-3 py-2 text-right">{formatMoney(entry.total_debit)}</td>
                    <td className="px-3 py-2 text-right">{formatMoney(entry.total_credit)}</td>
                    <td className="px-3 py-2">
                      <span className="rounded-full bg-surface-hover px-2 py-1">
                        {t(`journalEntries.status.${entry.status}`)}
                      </span>
                    </td>
                  </tr>
                ))
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

      <DrawerModal
        open={!!actions.selected || actions.detailLoading}
        onClose={() => {
          actions.setSelected(null);
          actions.setError("");
          setReverseReason("");
        }}
        title={actions.selected?.voucher_no || t("journalEntries.detail.title")}
        subtitle={actions.selected?.description || undefined}
        panelClassName="max-w-[860px]"
      >
        {actions.error && <div className="mb-3 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">{actions.error}</div>}
        {actions.detailLoading || !actions.selected ? (
          <div className="p-6 text-center text-xs text-[color:var(--muted-fg)]">{t("journalEntries.loading")}</div>
        ) : (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 rounded-xl border border-border p-3">
              <div><div className="text-[color:var(--muted-fg)]">{t("journalEntries.columns.date")}</div><div>{actions.selected.date}</div></div>
              <div><div className="text-[color:var(--muted-fg)]">{t("journalEntries.columns.period")}</div><div>{getPeriodLabel(actions.selected.period_id)}</div></div>
              <div><div className="text-[color:var(--muted-fg)]">{t("journalEntries.columns.status")}</div><div>{t(`journalEntries.status.${actions.selected.status}`)}</div></div>
              <div><div className="text-[color:var(--muted-fg)]">{t("journalEntries.form.total")}</div><div>{formatMoney(selectedTotals.debit)}</div></div>
            </div>
            <div className="rounded-xl border border-border overflow-hidden">
              <table className="min-w-full">
                <thead className="bg-surface-hover text-[color:var(--muted-fg)]">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium">{t("journalEntries.form.account")}</th>
                    <th className="px-3 py-2 text-right font-medium">{t("journalEntries.form.debit")}</th>
                    <th className="px-3 py-2 text-right font-medium">{t("journalEntries.form.credit")}</th>
                    <th className="px-3 py-2 text-left font-medium">{t("journalEntries.form.lineDescription")}</th>
                  </tr>
                </thead>
                <tbody>
                  {(actions.selected.lines ?? []).map((line) => (
                    <tr key={line.id} className="border-t border-border">
                      <td className="px-3 py-2">{getAccountLabel(line.account_id)}</td>
                      <td className="px-3 py-2 text-right">{formatMoney(line.debit)}</td>
                      <td className="px-3 py-2 text-right">{formatMoney(line.credit)}</td>
                      <td className="px-3 py-2">{line.description || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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
                  disabled={actions.selected.status !== "posted" || actions.saving}
                  onClick={() => actions.reverse(actions.selected!.id, { reason: reverseReason })}
                  className="rounded-lg border border-border px-3 py-2 disabled:opacity-40"
                >
                  {t("journalEntries.actions.reverse")}
                </button>
              </div>
            </div>
          </div>
        )}
      </DrawerModal>
    </div>
  );
}
