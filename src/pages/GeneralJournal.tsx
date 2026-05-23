import { BarChart3, Plus } from "lucide-react";
import { useState, useEffect } from "react";
import { DrawerModal } from "@/shared/components/DrawerModal";
import { DataTable, type DataTableColumn } from "@/shared/components/DataTable";
import { useT } from "@/core/i18n";
import { useAppStore } from "@/core/config/appStore";
import { PageLayout } from "@/shared/components/PageLayout";
import { FilterButton, FilterPanel } from "@/shared/components/FilterPanel";
import { type FilterPanelConfig } from "@/shared/hooks/useFilterPanel";
import {
  useJournalEntries,
  useJournalEntryActions,
  useJournalEntryLookups,
} from "@/modules/accounting/hooks/useJournalEntries";
import { JournalEntryForm } from "@/modules/accounting/components/JournalEntryForm";
import type {
  JournalEntry,
  JournalEntryLine,
} from "@/modules/accounting/types/journalEntry";
import {
  formatMoney,
  getAccountLabel,
  money,
  getPeriodLabel,
} from "@/modules/accounting/utils/journalEntryUtils";
import {
  getPaymentVoucherApi,
  type PaymentVoucher,
} from "@/modules/finance/api/financeApi";

// ─── helpers ──────────────────────────────────────────────────────────────────

interface FlatRow {
  _rowKey: string;
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
    return [
      {
        _rowKey: `${entry.id}-0`,
        entry,
        debitLine: null,
        creditLine: null,
        amount: 0,
        description: entry.description || "",
      },
    ];
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
    rows.push({
      _rowKey: `${entry.id}-${i}`,
      entry,
      debitLine: d,
      creditLine: c,
      amount,
      description,
    });
  }

  return rows;
}

// ─── voucher ref types ─────────────────────────────────────────────────────────

type VoucherDetailState =
  | { kind: "loading" }
  | { kind: "payment"; voucher: PaymentVoucher }
  | { kind: "journal"; entry: JournalEntry }
  | { kind: "error"; msg: string };

// ─── component ────────────────────────────────────────────────────────────────

export function NhatKyChung() {
  const t = useT();
  const list = useJournalEntries();
  const lookups = useJournalEntryLookups();
  const actions = useJournalEntryActions(list.load);
  const [createOpen, setCreateOpen] = useState(false);
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);

  // Unified detail modal state
  const [detailState, setDetailState] = useState<VoucherDetailState | null>(
    null,
  );

  const { setCustomBreadcrumbs } = useAppStore();

  useEffect(() => {
    setCustomBreadcrumbs([
      ["breadcrumb.accounting"],
      ["breadcrumb.report"],
      ["breadcrumb.reportJournal"],
    ]);
    return () => setCustomBreadcrumbs(null);
  }, [setCustomBreadcrumbs]);

  // FilterPanel config — search + period (date range) + account (channel) + status (custom)
  const accountOpts = lookups.accounts.map((a) => ({
    value: a.id,
    label: [a.account_code, a.account_name].filter(Boolean).join(" — "),
  }));
  const periodOpts = lookups.periods.map((p) => ({
    value: p.id,
    label: p.name,
  }));

  const filterConfig: FilterPanelConfig = {
    search: true,
    custom: [
      {
        key: "account",
        label: t("journalEntries.filters.account"),
        placeholder: t("journalEntries.filters.account"),
        options: accountOpts,
      },
      {
        key: "period",
        label: t("journalEntries.filters.period"),
        placeholder: t("journalEntries.filters.period"),
        options: periodOpts,
      },
    ],
  };

  const activeFilterCount = [
    !!list.search,
    !!list.accountId,
    !!list.periodId,
    !!list.dateFrom || !!list.dateTo,
  ].filter(Boolean).length;

  async function handleRowClick(entry: JournalEntry) {
    const refType = entry.reference_type;

    if (refType === "payment_vouchers" && entry.reference_id) {
      setDetailState({ kind: "loading" });
      try {
        const v = await getPaymentVoucherApi(entry.reference_id);
        setDetailState({ kind: "payment", voucher: v });
      } catch {
        setDetailState({
          kind: "error",
          msg: `Không tải được phiếu tiền: ${entry.reference_id}`,
        });
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
  }

  // Build flat rows for display
  const flatRows = list.items.flatMap(flattenEntry);

  const journalColumns: DataTableColumn<FlatRow>[] = [
    {
      key: "voucher_no",
      header: t("journalEntries.columns.voucherNo"),
      cell: (row) => row.entry.voucher_no || row.entry.id.slice(0, 8),
      className: "font-medium",
    },
    {
      key: "date",
      header: t("journalEntries.columns.date"),
      cell: (row) => row.entry.date,
    },
    {
      key: "debit_account",
      header: t("journalEntries.form.debitAccount"),
      cell: (row) =>
        row.debitLine ? getAccountLabel(row.debitLine.account_id) : "—",
    },
    {
      key: "credit_account",
      header: t("journalEntries.form.creditAccount"),
      cell: (row) =>
        row.creditLine ? getAccountLabel(row.creditLine.account_id) : "—",
    },
    {
      key: "amount",
      header: t("journalEntries.form.amount"),
      cell: (row) => (row.amount > 0 ? formatMoney(row.amount) : "—"),
      className: "text-right",
      headerClassName: "text-right",
    },
    {
      key: "description",
      header: t("journalEntries.form.lineDescription"),
      cell: (row) => row.description || "—",
      className: "max-w-[200px] truncate",
    },
  ];

  return (
    <>
      <PageLayout
        title={t("journalEntries.title")}
        desc={t("journalEntries.desc")}
        icon={<BarChart3 className="h-4 w-4" />}
        actions={
          <>
            <FilterButton
              onClick={() => setFilterPanelOpen((v) => !v)}
              activeCount={activeFilterCount}
            />
            <button
              type="button"
              onClick={() => setCreateOpen(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-fg"
            >
              <Plus className="w-4 h-4" /> {t("journalEntries.actions.new")}
            </button>
          </>
        }
      >
        <div className="flex gap-5 items-start">
          <div className="flex-1 min-w-0 space-y-4">
            {list.error && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                {list.error}
              </div>
            )}

            {/* Journal Table — 1 row per line pair, all rows show full voucher info */}
            <DataTable<FlatRow>
              items={flatRows}
              columns={journalColumns}
              getRowKey={(row) => row._rowKey}
              loading={list.loading}
              emptyLabel={t("common.noData")}
              onRowClick={(row) => handleRowClick(row.entry)}
              page={list.page}
              pageSize={list.pageSize}
              total={list.total}
              totalPages={Math.max(1, list.totalPages)}
              onPage={list.setPage}
              onPageSize={(ps) => {
                list.setPageSize(ps);
                list.setPage(1);
              }}
              elevated={false}
              containerClassName="rounded-2xl"
            />
          </div>
          {/* Filter sidebar */}
          <FilterPanel
            config={filterConfig}
            filter={{
              state: {
                period: "",
                dateFrom: list.dateFrom,
                dateTo: list.dateTo,
                channel: "",
                search: list.search,
                amountMin: "",
                amountMax: "",
                status: "",
                counterpartySource: "",
                custom: { account: list.accountId, period: list.periodId },
              },
              inputs: {
                search: list.search,
                amountMin: "",
                amountMax: "",
              },
              panelOpen: filterPanelOpen,
              openPanel: () => setFilterPanelOpen(true),
              closePanel: () => setFilterPanelOpen(false),
              togglePanel: () => setFilterPanelOpen((v) => !v),
              setPeriod: () => {},
              setDateFrom: (v: string) => {
                list.setDateFrom(v);
                list.setPage(1);
              },
              setDateTo: (v: string) => {
                list.setDateTo(v);
                list.setPage(1);
              },
              setChannel: () => {},
              setSearchInput: (v: string) => {
                list.setSearch(v);
                list.setPage(1);
              },
              setAmountMinInput: () => {},
              setAmountMaxInput: () => {},
              setStatus: () => {},
              setCounterpartySource: () => {},
              setCustom: (key: string, v: string) => {
                if (key === "account") {
                  list.setAccountId(v);
                  list.setPage(1);
                }
                if (key === "period") {
                  list.setPeriodId(v);
                  list.setPage(1);
                }
              },
              resetAll: list.resetFilters,
              hasActiveFilter: activeFilterCount > 0,
              activeFilterCount,
            }}
          />
        </div>
      </PageLayout>

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
        title={
          detailState?.kind === "payment"
            ? `Phiếu tiền ${detailState.voucher.voucher_no}`
            : detailState?.kind === "journal"
              ? detailState.entry.voucher_no || t("journalEntries.detail.title")
              : t("journalEntries.detail.title")
        }
        subtitle={
          detailState?.kind === "payment"
            ? detailState.voucher.description
            : detailState?.kind === "journal"
              ? (detailState.entry.description ?? undefined)
              : undefined
        }
        panelClassName="max-w-[860px]"
      >
        {detailState?.kind === "loading" && (
          <div className="p-6 text-center text-xs text-[color:var(--muted-fg)]">
            {t("journalEntries.loading")}
          </div>
        )}

        {detailState?.kind === "error" && (
          <div className="p-4 rounded-lg border border-red-200 bg-red-50 text-xs text-red-700">
            {detailState.msg}
          </div>
        )}

        {/* Payment Voucher (TienMat / TienGui) — read-only summary */}
        {detailState?.kind === "payment" && (
          <PaymentVoucherReadOnly voucher={detailState.voucher} />
        )}

        {/* AR Document — read-only summary: removed (AR legacy decommissioned) */}

        {/* Journal Entry (created in Nhật Ký Chung) */}
        {detailState?.kind === "journal" &&
          (() => {
            const entry = detailState.entry;
            return (
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 rounded-xl border border-border p-3">
                  <div>
                    <div className="text-[color:var(--muted-fg)]">
                      {t("journalEntries.columns.date")}
                    </div>
                    <div>{entry.date}</div>
                  </div>
                  <div>
                    <div className="text-[color:var(--muted-fg)]">
                      {t("journalEntries.columns.period")}
                    </div>
                    <div>{getPeriodLabel(entry.period_id)}</div>
                  </div>
                  <div>
                    <div className="text-[color:var(--muted-fg)]">
                      {t("journalEntries.form.total")}
                    </div>
                    <div>{formatMoney(entry.total_debit)}</div>
                  </div>
                </div>

                <div className="rounded-xl border border-border overflow-hidden">
                  <table className="min-w-full">
                    <thead className="bg-surface-hover text-[color:var(--muted-fg)]">
                      <tr>
                        <th className="px-3 py-2 text-left font-medium">
                          {t("journalEntries.form.debitAccount")}
                        </th>
                        <th className="px-3 py-2 text-left font-medium">
                          {t("journalEntries.form.creditAccount")}
                        </th>
                        <th className="px-3 py-2 text-right font-medium">
                          {t("journalEntries.form.amount")}
                        </th>
                        <th className="px-3 py-2 text-left font-medium">
                          {t("journalEntries.form.lineDescription")}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {flattenEntry(entry).map((row, ri) => (
                        <tr key={ri} className="border-t border-border">
                          <td className="px-3 py-2">
                            {row.debitLine
                              ? getAccountLabel(row.debitLine.account_id)
                              : "—"}
                          </td>
                          <td className="px-3 py-2">
                            {row.creditLine
                              ? getAccountLabel(row.creditLine.account_id)
                              : "—"}
                          </td>
                          <td className="px-3 py-2 text-right">
                            {row.amount > 0 ? formatMoney(row.amount) : "—"}
                          </td>
                          <td className="px-3 py-2">
                            {row.description || "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })()}
      </DrawerModal>
    </>
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
    [
      "Số tiền",
      v.amount != null
        ? new Intl.NumberFormat("vi-VN").format(Number(v.amount))
        : "—",
    ],
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
