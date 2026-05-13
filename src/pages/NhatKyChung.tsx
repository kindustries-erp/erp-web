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
import {
  getPaymentVoucherApi,
  type PaymentVoucher,
  type ArDocument,
  getArDocumentsApi,
} from "@/modules/finance/api/financeApi";

// ─── helpers ──────────────────────────────────────────────────────────────────

interface FlatRow {
  entry: JournalEntry;
  debitLine: JournalEntryLine | null;
  creditLine: JournalEntryLine | null;
  amount: number;
  description: string;
}

/**
 * Flatten journal entry lines into display rows.
 * Each item = 1 row in table, showing debit account / credit account / amount / description.
 * A single entry with N debit lines + N credit lines → N rows (paired by sort order).
 * Unpaired lines also get their own row (debit-only or credit-only).
 */
function flattenEntry(entry: JournalEntry): FlatRow[] {
  const lines = entry.lines ?? [];
  if (lines.length === 0) {
    return [{ entry, debitLine: null, creditLine: null, amount: 0, description: entry.description || "" }];
  }

  const sorted = [...lines].sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0));
  const debits = sorted.filter((l) => money(l.debit) > 0);
  const credits = sorted.filter((l) => money(l.credit) > 0);
  const rows: FlatRow[] = [];

  // Pair by index
  const maxLen = Math.max(debits.length, credits.length);
  for (let i = 0; i < maxLen; i++) {
    const d = debits[i] ?? null;
    const c = credits[i] ?? null;
    const amount = d ? money(d.debit) : c ? money(c.credit) : 0;
    const description = (d ?? c)?.description || entry.description || "";
    rows.push({ entry, debitLine: d, creditLine: c, amount, description });
  }

  return rows;
}

// ─── voucher ref types ─────────────────────────────────────────────────────────

type VoucherDetailState =
  | { kind: "loading" }
  | { kind: "payment"; voucher: PaymentVoucher }
  | { kind: "ar"; doc: ArDocument }
  | { kind: "journal"; entry: JournalEntry }
  | { kind: "error"; msg: string };

// ─── component ────────────────────────────────────────────────────────────────

export function NhatKyChung() {
  const t = useT();
  const list = useJournalEntries();
  const lookups = useJournalEntryLookups();
  const actions = useJournalEntryActions(list.load);
  const [createOpen, setCreateOpen] = useState(false);
  const [reverseReason, setReverseReason] = useState("");

  // Unified detail modal state
  const [detailState, setDetailState] = useState<VoucherDetailState | null>(null);

  async function handleRowClick(entry: JournalEntry) {
    const refType = entry.reference_type;

    if (refType === "payment_vouchers" && entry.reference_id) {
      setDetailState({ kind: "loading" });
      try {
        const v = await getPaymentVoucherApi(entry.reference_id);
        setDetailState({ kind: "payment", voucher: v });
      } catch {
        setDetailState({ kind: "error", msg: `Không tải được phiếu tiền: ${entry.reference_id}` });
      }
      return;
    }

    if ((refType === "ar_documents" || refType === "ar_documents_reversal") && entry.reference_id) {
      setDetailState({ kind: "loading" });
      try {
        const res = await getArDocumentsApi({ page: 1, pageSize: 1 });
        const doc = (res.items as ArDocument[] | undefined)?.find?.((d) => d.id === entry.reference_id);
        if (doc) {
          setDetailState({ kind: "ar", doc });
        } else {
          await openJournalDetail(entry);
        }
      } catch {
        await openJournalDetail(entry);
      }
      return;
    }

    // manual / journal_entries / unknown → show journal entry detail
    await openJournalDetail(entry);
  }

  async function openJournalDetail(entry: JournalEntry) {
    if (entry.lines && entry.lines.length > 0) {
      setDetailState({ kind: "journal", entry });
    } else {
      setDetailState({ kind: "loading" });
      try {
        await actions.openDetail(entry.id);
        const full = actions.selected;
        setDetailState({ kind: "journal", entry: full ?? entry });
      } catch {
        setDetailState({ kind: "journal", entry });
      }
    }
  }

  function closeDetail() {
    setDetailState(null);
    actions.setSelected(null);
    actions.setError("");
    setReverseReason("");
  }

  // Build flat rows for display
  const flatRows = list.items.flatMap(flattenEntry);

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

      {/* Journal Table — 1 row per line pair, all rows show full voucher info */}
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
              ) : flatRows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-3 py-8 text-center text-[color:var(--muted-fg)]">
                    {t("common.noData")}
                  </td>
                </tr>
              ) : (
                flatRows.map((row, idx) => (
                  <tr
                    key={`${row.entry.id}-${idx}`}
                    onClick={() => handleRowClick(row.entry)}
                    className="border-t border-border cursor-pointer hover:bg-surface-hover"
                  >
                    <td className="px-3 py-2 font-medium">
                      {row.entry.voucher_no || row.entry.id.slice(0, 8)}
                    </td>
                    <td className="px-3 py-2">{row.entry.date}</td>
                    <td className="px-3 py-2">
                      {row.debitLine ? getAccountLabel(row.debitLine.account_id) : "—"}
                    </td>
                    <td className="px-3 py-2">
                      {row.creditLine ? getAccountLabel(row.creditLine.account_id) : "—"}
                    </td>
                    <td className="px-3 py-2 text-right">
                      {row.amount > 0 ? formatMoney(row.amount) : "—"}
                    </td>
                    <td className="px-3 py-2 max-w-[200px] truncate">{row.description || "—"}</td>
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

      {/* Detail modal — routing by reference_type */}
      <DrawerModal
        open={!!detailState}
        onClose={closeDetail}
        title={detailState?.kind === "payment"
          ? `Phiếu tiền ${detailState.voucher.voucher_no}`
          : detailState?.kind === "ar"
          ? `Phiếu AR ${detailState.doc.document_no ?? detailState.doc.id}`
          : detailState?.kind === "journal"
          ? (detailState.entry.voucher_no || t("journalEntries.detail.title"))
          : t("journalEntries.detail.title")}
        subtitle={
          detailState?.kind === "payment"
            ? detailState.voucher.description
            : detailState?.kind === "journal"
            ? detailState.entry.description ?? undefined
            : undefined
        }
        panelClassName="max-w-[860px]"
      >
        {detailState?.kind === "loading" && (
          <div className="p-6 text-center text-xs text-[color:var(--muted-fg)]">{t("journalEntries.loading")}</div>
        )}

        {detailState?.kind === "error" && (
          <div className="p-4 rounded-lg border border-red-200 bg-red-50 text-xs text-red-700">{detailState.msg}</div>
        )}

        {/* Payment Voucher (TienMat / TienGui) — read-only summary */}
        {detailState?.kind === "payment" && (
          <PaymentVoucherReadOnly voucher={detailState.voucher} />
        )}

        {/* AR Document — read-only summary */}
        {detailState?.kind === "ar" && (
          <ArDocumentReadOnly doc={detailState.doc} />
        )}

        {/* Journal Entry (created in Nhật Ký Chung) */}
        {detailState?.kind === "journal" && (() => {
          const entry = detailState.entry;
          return (
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 rounded-xl border border-border p-3">
                <div>
                  <div className="text-[color:var(--muted-fg)]">{t("journalEntries.columns.date")}</div>
                  <div>{entry.date}</div>
                </div>
                <div>
                  <div className="text-[color:var(--muted-fg)]">{t("journalEntries.columns.period")}</div>
                  <div>{getPeriodLabel(entry.period_id)}</div>
                </div>
                <div>
                  <div className="text-[color:var(--muted-fg)]">{t("journalEntries.form.total")}</div>
                  <div>{formatMoney(entry.total_debit)}</div>
                </div>
              </div>

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
                    {flattenEntry(entry).map((row, ri) => (
                      <tr key={ri} className="border-t border-border">
                        <td className="px-3 py-2">{row.debitLine ? getAccountLabel(row.debitLine.account_id) : "—"}</td>
                        <td className="px-3 py-2">{row.creditLine ? getAccountLabel(row.creditLine.account_id) : "—"}</td>
                        <td className="px-3 py-2 text-right">{row.amount > 0 ? formatMoney(row.amount) : "—"}</td>
                        <td className="px-3 py-2">{row.description || "—"}</td>
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
                <button
                  type="button"
                  disabled={entry.status !== "posted" || actions.saving}
                  onClick={() => actions.reverse(entry.id, { reason: reverseReason })}
                  className="rounded-lg border border-border px-3 py-2 disabled:opacity-40"
                >
                  {t("journalEntries.actions.reverse")}
                </button>
              </div>
            </div>
          );
        })()}
      </DrawerModal>
    </div>
  );
}

// ─── Read-only modals ──────────────────────────────────────────────────────────

function PaymentVoucherReadOnly({ voucher: v }: { voucher: PaymentVoucher }) {
  const fields: [string, string][] = [
    ["Số phiếu", v.voucher_no],
    ["Loại", v.voucher_type],
    ["Ngày chứng từ", v.document_date],
    ["Ngày hạch toán", v.posting_date],
    ["Diễn giải", v.description],
    ["Đối tác", v.counterparty_name_snapshot || "—"],
    ["Người thực thu/chi", v.actual_person_name || "—"],
    ["Số tiền", v.amount != null ? new Intl.NumberFormat("vi-VN").format(Number(v.amount)) : "—"],
    ["Trạng thái", v.status],
  ];
  return (
    <div className="space-y-3 text-xs">
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 rounded-xl border border-border p-3">
        {fields.map(([label, val]) => (
          <div key={label}>
            <div className="text-[color:var(--muted-fg)]">{label}</div>
            <div>{val}</div>
          </div>
        ))}
      </div>
      <p className="text-[color:var(--muted-fg)] italic">
        Xem chi tiết đầy đủ tại mục Tiền Mặt / Tiền Gửi.
      </p>
    </div>
  );
}

function ArDocumentReadOnly({ doc: d }: { doc: ArDocument }) {
  return (
    <div className="space-y-3 text-xs">
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 rounded-xl border border-border p-3">
        <div><div className="text-[color:var(--muted-fg)]">Số phiếu</div><div>{d.document_no ?? d.id}</div></div>
        <div><div className="text-[color:var(--muted-fg)]">Ngày hạch toán</div><div>{d.posting_date ?? "—"}</div></div>
        <div><div className="text-[color:var(--muted-fg)]">Loại</div><div>{d.document_type ?? "—"}</div></div>
        <div><div className="text-[color:var(--muted-fg)]">Trạng thái</div><div>{d.status ?? "—"}</div></div>
        <div className="col-span-2"><div className="text-[color:var(--muted-fg)]">Diễn giải</div><div>{d.description ?? "—"}</div></div>
      </div>
      <p className="text-[color:var(--muted-fg)] italic">
        Xem chi tiết đầy đủ tại mục Phải Thu.
      </p>
    </div>
  );
}
