import { useState, useEffect, useCallback, useMemo } from "react";
import { FileText } from "lucide-react";
import { useT } from "@/core/i18n";
import { useUIStore } from "@/core/config/uiStore";
import { useHasPermission } from "@/shared/hooks/useHasPermission";
import { PageHeader } from "@/shared/components/PageHeader";
import { KpiCard } from "@/shared/components/KpiCard";
import { ConfirmModal } from "@/shared/components/ConfirmModal";
import { BtnPrimary } from "@/shared/components/BtnPrimary";
import { Combobox } from "@/shared/components/Combobox";
import { SearchInput } from "@/shared/components/SearchInput";
import { TablePagination } from "@/shared/components/TablePagination";
import {
  DrawerModal,
  DrawerSection,
  DrawerField,
  inputCls,
} from "@/shared/components/DrawerModal";
import { Skeleton } from "@/shared/components/Skeleton";
import { cn } from "@/shared/utils";
import { extractApiError } from "@/shared/utils/apiError";
import { todayIsoDate } from "@/modules/finance/utils/financeHelpers";
import {
  getChartOfAccountsApi,
  type ChartOfAccount,
} from "@/modules/accounting/api/catalogApi";
import {
  getPaymentVoucherLookupBusinessPartnersApi,
  getPaymentVouchersPagedApi,
  type PaymentVoucher,
  type VoucherType,
} from "@/modules/finance/api/financeApi";
import type { BusinessPartner } from "@/modules/partners/api/partnerApi";
import {
  getPartnerLedgerItemsApi,
  getPartnerLedgerSummaryApi,
  createPartnerLedgerItemApi,
  updatePartnerLedgerItemApi,
  deletePartnerLedgerItemApi,
  createPartnerLedgerSettlementApi,
  type PartnerLedgerItem,
  type PartnerLedgerItemType,
  type PartnerLedgerStatus,
  type PartnerLedgerSourceType,
  type CreatePartnerLedgerItemDto,
  type PartnerLedgerSummary,
} from "@/modules/finance/api/financeApi";

// ─── Constants ────────────────────────────────────────────────────────────────

const CURRENCY_OPTS = [
  { value: "VND", label: "VND" },
  { value: "USD", label: "USD" },
  { value: "EUR", label: "EUR" },
];

const SOURCE_TYPE_OPTS: { value: PartnerLedgerSourceType; label: string }[] = [
  { value: "OPENING", label: "Số dư đầu kỳ" },
  { value: "MANUAL", label: "Thủ công" },
  { value: "SALES_DOC", label: "Bán hàng" },
  { value: "PURCHASE_DOC", label: "Mua hàng" },
  { value: "ADJUSTMENT", label: "Điều chỉnh" },
];

const STATUS_OPTS: { value: PartnerLedgerStatus; label: string }[] = [
  { value: "OPEN", label: "Chưa TT" },
  { value: "PARTIAL", label: "Thanh toán một phần" },
  { value: "SETTLED", label: "Đã tất toán" },
  { value: "CANCELLED", label: "Đã hủy" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtAmt(n: number) {
  return n.toLocaleString("vi-VN");
}

function StatusBadge({ status }: { status: PartnerLedgerStatus }) {
  const cls: Record<PartnerLedgerStatus, string> = {
    OPEN: "bg-warn-bg text-warn-fg",
    PARTIAL: "bg-[#e8f0fd] text-[#2a6dd9]",
    SETTLED: "bg-approve-bg text-approve-fg",
    CANCELLED: "bg-[color:var(--muted)] text-[color:var(--muted-fg)]",
  };
  const labels: Record<PartnerLedgerStatus, string> = {
    OPEN: "Chưa TT",
    PARTIAL: "Một phần",
    SETTLED: "Tất toán",
    CANCELLED: "Đã hủy",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-[2px] rounded-full text-[11px] font-medium",
        cls[status],
      )}
    >
      {labels[status]}
    </span>
  );
}

// ─── Empty form factory ───────────────────────────────────────────────────────

function emptyForm(itemType: PartnerLedgerItemType): CreatePartnerLedgerItemDto {
  const today = todayIsoDate();
  return {
    item_no: "",
    item_type: itemType,
    source_type: "MANUAL",
    business_partner_id: "",
    accounting_account_id: "",
    document_date: today,
    posting_date: today,
    due_date: "",
    reference_no: "",
    description: "",
    currency: "VND",
    original_amount: 0,
    note: "",
  };
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface PartnerLedgerPageProps {
  itemType: PartnerLedgerItemType;
  title: string;
  desc: string;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function PartnerLedgerPage({
  itemType,
  title,
  desc,
}: PartnerLedgerPageProps) {
  const t = useT();
  const showToast = useUIStore((s) => s.showToast);

  // ── Permissions ──────────────────────────────────────────────────────────
  const canCreate = useHasPermission("partner_ledger_items", "create");
  const canUpdate = useHasPermission("partner_ledger_items", "update");
  const canDelete = useHasPermission("partner_ledger_items", "delete");
  const canSettle = useHasPermission("partner_ledger_settlements", "create");

  // ── Catalog data ─────────────────────────────────────────────────────────
  const [partners, setPartners] = useState<BusinessPartner[]>([]);
  const [accounts, setAccounts] = useState<ChartOfAccount[]>([]);

  useEffect(() => {
    Promise.all([
      getPaymentVoucherLookupBusinessPartnersApi(),
      getChartOfAccountsApi(),
    ])
      .then(([bps, coa]) => {
        setPartners(bps ?? []);
        setAccounts(coa ?? []);
      })
      .catch(() => {});
  }, []);

  // ── Filter state ─────────────────────────────────────────────────────────
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [partnerFilter, setPartnerFilter] = useState("");
  const [accountFilter, setAccountFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<PartnerLedgerStatus | "">("");
  const [dueFrom, setDueFrom] = useState("");
  const [dueTo, setDueTo] = useState("");
  const [overdueOnly, setOverdueOnly] = useState(false);

  // ── Pagination ───────────────────────────────────────────────────────────
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // ── Items list ───────────────────────────────────────────────────────────
  const [items, setItems] = useState<PartnerLedgerItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // ── Summary ──────────────────────────────────────────────────────────────
  const [summary, setSummary] = useState<PartnerLedgerSummary | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);

  // ── Create/Edit drawer ───────────────────────────────────────────────────
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PartnerLedgerItem | null>(null);
  const [form, setForm] = useState<CreatePartnerLedgerItemDto>(() =>
    emptyForm(itemType),
  );
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // ── Settlement drawer ────────────────────────────────────────────────────
  const [settleOpen, setSettleOpen] = useState(false);
  const [settleItem, setSettleItem] = useState<PartnerLedgerItem | null>(null);
  const [voucherOpts, setVoucherOpts] = useState<PaymentVoucher[]>([]);
  const [vouchersLoading, setVouchersLoading] = useState(false);
  const [settleForm, setSettleForm] = useState({
    payment_voucher_id: "",
    settlement_date: todayIsoDate(),
    amount: 0,
    note: "",
  });
  const [settleLoading, setSettleLoading] = useState(false);
  const [settleError, setSettleError] = useState<string | null>(null);

  // ── Cancel confirm ───────────────────────────────────────────────────────
  const [cancelTarget, setCancelTarget] = useState<PartnerLedgerItem | null>(null);
  const [cancelling, setCancelling] = useState(false);

  // ── Load summary ──────────────────────────────────────────────────────────
  const loadSummary = useCallback(() => {
    setSummaryLoading(true);
    getPartnerLedgerSummaryApi({
      item_type: itemType,
      business_partner_id: partnerFilter || undefined,
      accounting_account_id: accountFilter || undefined,
    })
      .then(setSummary)
      .catch(() => {})
      .finally(() => setSummaryLoading(false));
  }, [itemType, partnerFilter, accountFilter]);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  // ── Load items ────────────────────────────────────────────────────────────
  const loadItems = useCallback(() => {
    setLoading(true);
    setFetchError(null);
    getPartnerLedgerItemsApi({
      item_type: itemType,
      page,
      pageSize,
      search: search || undefined,
      business_partner_id: partnerFilter || undefined,
      accounting_account_id: accountFilter || undefined,
      status: (statusFilter as PartnerLedgerStatus) || undefined,
      due_from: dueFrom || undefined,
      due_to: dueTo || undefined,
      overdue: overdueOnly || undefined,
      sort: ["-document_date"],
    })
      .then((r) => {
        setItems(r.items);
        setTotal(r.total);
        setTotalPages(r.totalPages);
      })
      .catch((e) =>
        setFetchError(extractApiError(e, t("ledger.table.fetchError"))),
      )
      .finally(() => setLoading(false));
  }, [
    itemType,
    page,
    pageSize,
    search,
    partnerFilter,
    accountFilter,
    statusFilter,
    dueFrom,
    dueTo,
    overdueOnly,
    t,
  ]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  // Reset to page 1 when filters change
  const applyFilter = useCallback(
    (fn: () => void) => {
      fn();
      setPage(1);
    },
    [],
  );

  // ── Load settlement vouchers when settle drawer opens ─────────────────────
  useEffect(() => {
    if (!settleOpen || !settleItem) return;
    const voucherTypes: VoucherType[] =
      itemType === "RECEIVABLE"
        ? ["CASH_RECEIPT", "BANK_RECEIPT"]
        : ["CASH_PAYMENT", "BANK_PAYMENT"];

    setVouchersLoading(true);
    Promise.all(
      voucherTypes.map((vt) =>
        getPaymentVouchersPagedApi({
          status: "POSTED",
          counterparty_id: settleItem.business_partner_id,
          voucher_type: vt,
          pageSize: 100,
          sort: ["-document_date"],
        }),
      ),
    )
      .then((results) => setVoucherOpts(results.flatMap((r) => r.items)))
      .catch(() => setVoucherOpts([]))
      .finally(() => setVouchersLoading(false));
  }, [settleOpen, settleItem, itemType]);

  // ── Selected voucher default amount ───────────────────────────────────────
  const selectedVoucher = useMemo(
    () => voucherOpts.find((v) => v.id === settleForm.payment_voucher_id),
    [voucherOpts, settleForm.payment_voucher_id],
  );

  // ── Options ───────────────────────────────────────────────────────────────
  const partnerOpts = useMemo(
    () =>
      partners.map((p) => {
        const code = p.code ?? p.tax_code ?? "";
        const name = p.name || p.display_name || code || p.id;
        return { value: p.id, label: code ? `${code} — ${name}` : name };
      }),
    [partners],
  );

  const accountOpts = useMemo(
    () =>
      accounts
        .filter((a) =>
          itemType === "RECEIVABLE"
            ? a.is_receivable_account === true
            : a.is_payable_account === true,
        )
        .map((a) => ({
          value: a.id,
          label: `${a.account_code} — ${a.account_name}`,
        })),
    [accounts, itemType],
  );

  // Fallback: if the filtered list is empty (flags not set on accounts), show all
  const accountOptsDisplay = useMemo(
    () =>
      accountOpts.length > 0
        ? accountOpts
        : accounts.map((a) => ({
            value: a.id,
            label: `${a.account_code} — ${a.account_name}`,
          })),
    [accountOpts, accounts],
  );

  const voucherSelectOpts = useMemo(
    () =>
      voucherOpts.map((v) => ({
        value: v.id,
        label: `${v.voucher_no} — ${fmtAmt(v.amount)} ${v.currency ?? "VND"}`,
      })),
    [voucherOpts],
  );

  const partnerName = useCallback(
    (id: string) =>
      partners.find((p) => p.id === id)?.name ??
      partners.find((p) => p.id === id)?.display_name ??
      id,
    [partners],
  );

  const accountCode = useCallback(
    (id: string) => {
      const a = accounts.find((ac) => ac.id === id);
      return a ? `${a.account_code}` : id;
    },
    [accounts],
  );

  // ── Create/Edit drawer handlers ───────────────────────────────────────────
  function openNew() {
    setEditingItem(null);
    setForm(emptyForm(itemType));
    setSaveError(null);
    setDrawerOpen(true);
  }

  function openEdit(item: PartnerLedgerItem) {
    setEditingItem(item);
    setForm({
      item_no: item.item_no,
      item_type: item.item_type,
      source_type: item.source_type,
      business_partner_id: item.business_partner_id,
      accounting_account_id: item.accounting_account_id,
      document_date: item.document_date,
      posting_date: item.posting_date,
      due_date: item.due_date ?? "",
      reference_no: item.reference_no ?? "",
      description: item.description,
      currency: item.currency,
      original_amount: item.original_amount,
      note: item.note ?? "",
    });
    setSaveError(null);
    setDrawerOpen(true);
  }

  function closeDrawer() {
    setDrawerOpen(false);
    setEditingItem(null);
  }

  function setField<K extends keyof CreatePartnerLedgerItemDto>(
    key: K,
    value: CreatePartnerLedgerItemDto[K],
  ) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSave() {
    if (!form.item_no.trim()) {
      setSaveError("Số phiếu không được để trống.");
      return;
    }
    if (!form.business_partner_id) {
      setSaveError("Vui lòng chọn đối tác.");
      return;
    }
    if (!form.accounting_account_id) {
      setSaveError("Vui lòng chọn tài khoản kế toán.");
      return;
    }
    if (!form.description.trim()) {
      setSaveError("Diễn giải không được để trống.");
      return;
    }
    if (form.original_amount <= 0) {
      setSaveError("Số tiền phải lớn hơn 0.");
      return;
    }

    setSaving(true);
    setSaveError(null);
    try {
      const dto: CreatePartnerLedgerItemDto = {
        ...form,
        due_date: form.due_date || undefined,
        reference_no: form.reference_no || undefined,
        note: form.note || undefined,
      };
      if (editingItem) {
        await updatePartnerLedgerItemApi(editingItem.id, dto);
      } else {
        await createPartnerLedgerItemApi(dto);
      }
      closeDrawer();
      loadItems();
      loadSummary();
      showToast({
        title: editingItem ? "Đã cập nhật phiếu" : "Đã tạo phiếu công nợ",
        variant: "success",
      });
    } catch (e) {
      setSaveError(extractApiError(e, t("ledger.drawer.saveFail")));
    } finally {
      setSaving(false);
    }
  }

  // ── Settlement handlers ───────────────────────────────────────────────────
  function openSettle(item: PartnerLedgerItem) {
    setSettleItem(item);
    setSettleForm({
      payment_voucher_id: "",
      settlement_date: todayIsoDate(),
      amount: 0,
      note: "",
    });
    setSettleError(null);
    setSettleOpen(true);
  }

  function closeSettle() {
    setSettleOpen(false);
    setSettleItem(null);
  }

  async function handleSettle() {
    if (!settleItem) return;
    if (!settleForm.payment_voucher_id) {
      setSettleError("Vui lòng chọn chứng từ thanh toán.");
      return;
    }
    if (settleForm.amount <= 0) {
      setSettleError("Số tiền bù trừ phải lớn hơn 0.");
      return;
    }
    setSettleLoading(true);
    setSettleError(null);
    try {
      await createPartnerLedgerSettlementApi({
        partner_ledger_item_id: settleItem.id,
        payment_voucher_id: settleForm.payment_voucher_id,
        settlement_date: settleForm.settlement_date,
        amount: settleForm.amount,
        note: settleForm.note || undefined,
      });
      closeSettle();
      loadItems();
      loadSummary();
      showToast({ title: "Bù trừ công nợ thành công", variant: "success" });
    } catch (e) {
      setSettleError(extractApiError(e, t("ledger.settlement.saveFail")));
    } finally {
      setSettleLoading(false);
    }
  }

  // Auto-set default amount when voucher is selected
  function handleVoucherSelect(voucherId: string) {
    setSettleForm((f) => {
      const v = voucherOpts.find((v) => v.id === voucherId);
      const maxAmt =
        v && settleItem
          ? Math.min(settleItem.open_amount, v.amount)
          : f.amount;
      return { ...f, payment_voucher_id: voucherId, amount: maxAmt };
    });
  }

  // ── Cancel handlers ───────────────────────────────────────────────────────
  async function handleCancel() {
    if (!cancelTarget) return;
    setCancelling(true);
    try {
      await deletePartnerLedgerItemApi(cancelTarget.id);
      setCancelTarget(null);
      loadItems();
      loadSummary();
      showToast({ title: "Đã hủy phiếu công nợ", variant: "success" });
    } catch (e) {
      showToast({
        title: extractApiError(e, t("ledger.cancel.fail")),
        variant: "destructive",
      });
    } finally {
      setCancelling(false);
    }
  }

  // ── Search debounce ───────────────────────────────────────────────────────
  useEffect(() => {
    const id = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 350);
    return () => clearTimeout(id);
  }, [searchInput]);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div>
      <PageHeader
        title={title}
        desc={desc}
        icon={<FileText className="h-4 w-4" />}
        actions={
          canCreate ? (
            <BtnPrimary onClick={openNew}>
              + {t("ledger.actions.create")}
            </BtnPrimary>
          ) : undefined
        }
        className="mb-4"
      />

      {/* ── KPI row ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        {summaryLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-[90px] rounded-xl" />
          ))
        ) : (
          <>
            <KpiCard
              label={t("ledger.kpi.open")}
              value={summary ? `₫ ${fmtAmt(summary.total_open)}` : "—"}
              icon={
                <span className="text-warn-fg text-xs font-bold">₫</span>
              }
              warn={!!summary && summary.total_overdue > 0}
            />
            <KpiCard
              label={t("ledger.kpi.overdue")}
              value={summary ? `₫ ${fmtAmt(summary.total_overdue)}` : "—"}
              icon={
                <span className="text-[#d92a2a] text-xs font-bold">!</span>
              }
              warn={!!summary && summary.total_overdue > 0}
            />
            <KpiCard
              label={t("ledger.kpi.settled")}
              value={summary ? `₫ ${fmtAmt(summary.total_settled)}` : "—"}
              icon={
                <span className="text-approve-fg text-xs font-bold">✓</span>
              }
            />
            <KpiCard
              label={t("ledger.kpi.total")}
              value={summary ? String(summary.total_count) : "—"}
              icon={
                <span className="text-[color:var(--muted-fg)] text-xs font-bold">#</span>
              }
            />
          </>
        )}
      </div>

      {/* ── Aging buckets ── */}
      {summary && (
        <div className="bg-surface border border-border rounded-xl p-4 mb-4 card-shadow">
          <div className="text-[11px] font-bold text-[color:var(--muted-fg)] uppercase tracking-[0.06em] mb-3">
            {t("ledger.aging.title")}
          </div>
          <div className="grid grid-cols-5 gap-2 text-center">
            {(
              [
                ["ledger.aging.current", summary.buckets.current],
                ["ledger.aging.d1_30", summary.buckets.days_1_30],
                ["ledger.aging.d31_60", summary.buckets.days_31_60],
                ["ledger.aging.d61_90", summary.buckets.days_61_90],
                ["ledger.aging.d90p", summary.buckets.days_90_plus],
              ] as [string, number][]
            ).map(([key, val]) => (
              <div key={key} className="flex flex-col gap-1">
                <div className="text-[10px] text-[color:var(--muted-fg)]">
                  {t(key as Parameters<typeof t>[0])}
                </div>
                <div className="text-sm font-semibold text-foreground">
                  ₫ {fmtAmt(val)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Filter bar ── */}
      <div className="bg-surface border border-border rounded-xl p-3 mb-4 card-shadow flex flex-wrap gap-2 items-end">
        <SearchInput
          value={searchInput}
          onChange={setSearchInput}
          placeholder={t("ledger.filter.search")}
          className="w-48"
        />
        <div className="flex flex-col gap-[2px]">
          <label className="text-[10px] text-[color:var(--muted-fg)] font-medium uppercase tracking-[0.05em]">
            {t("ledger.filter.partner")}
          </label>
          <Combobox
            options={partnerOpts}
            value={partnerFilter}
            onChange={(v) => applyFilter(() => setPartnerFilter(v))}
            placeholder={t("ledger.filter.partnerPlaceholder")}
            className="w-44"
          />
        </div>
        <div className="flex flex-col gap-[2px]">
          <label className="text-[10px] text-[color:var(--muted-fg)] font-medium uppercase tracking-[0.05em]">
            {t("ledger.filter.account")}
          </label>
          <Combobox
            options={accountOptsDisplay}
            value={accountFilter}
            onChange={(v) => applyFilter(() => setAccountFilter(v))}
            placeholder={t("ledger.filter.accountPlaceholder")}
            className="w-44"
          />
        </div>
        <div className="flex flex-col gap-[2px]">
          <label className="text-[10px] text-[color:var(--muted-fg)] font-medium uppercase tracking-[0.05em]">
            {t("ledger.filter.status")}
          </label>
          <select
            className={cn(inputCls, "w-36 text-sm")}
            value={statusFilter}
            onChange={(e) =>
              applyFilter(() =>
                setStatusFilter(e.target.value as PartnerLedgerStatus | ""),
              )
            }
          >
            <option value="">{t("ledger.filter.statusPlaceholder")}</option>
            {STATUS_OPTS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-[2px]">
          <label className="text-[10px] text-[color:var(--muted-fg)] font-medium uppercase tracking-[0.05em]">
            {t("ledger.filter.dueFrom")}
          </label>
          <input
            type="date"
            className={cn(inputCls, "w-36 text-sm")}
            value={dueFrom}
            onChange={(e) => applyFilter(() => setDueFrom(e.target.value))}
          />
        </div>
        <div className="flex flex-col gap-[2px]">
          <label className="text-[10px] text-[color:var(--muted-fg)] font-medium uppercase tracking-[0.05em]">
            {t("ledger.filter.dueTo")}
          </label>
          <input
            type="date"
            className={cn(inputCls, "w-36 text-sm")}
            value={dueTo}
            onChange={(e) => applyFilter(() => setDueTo(e.target.value))}
          />
        </div>
        <label className="flex items-center gap-1 text-sm cursor-pointer mt-4">
          <input
            type="checkbox"
            checked={overdueOnly}
            onChange={(e) =>
              applyFilter(() => setOverdueOnly(e.target.checked))
            }
            className="rounded"
          />
          {t("ledger.filter.overdueOnly")}
        </label>
        <button
          className="ml-auto text-xs text-[color:var(--muted-fg)] hover:text-foreground underline mt-4"
          onClick={() => {
            setSearchInput("");
            setSearch("");
            setPartnerFilter("");
            setAccountFilter("");
            setStatusFilter("");
            setDueFrom("");
            setDueTo("");
            setOverdueOnly(false);
            setPage(1);
          }}
        >
          {t("ledger.filter.reset")}
        </button>
      </div>

      {/* ── Table ── */}
      <div className="bg-surface border border-border rounded-xl card-shadow overflow-hidden">
        <div className="px-4 py-3 border-b border-border">
          <span className="text-sm font-semibold text-foreground">
            {t("ledger.table.title")}
          </span>
          {total > 0 && (
            <span className="ml-2 text-[11px] text-[color:var(--muted-fg)]">
              ({total})
            </span>
          )}
        </div>

        {fetchError && (
          <div className="px-4 py-3 text-sm text-[#d92a2a]">{fetchError}</div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-[color:var(--muted)] text-[color:var(--muted-fg)] text-[11px] uppercase tracking-[0.05em]">
                <th className="px-3 py-2 text-left font-medium whitespace-nowrap">
                  {t("ledger.table.colItemNo")}
                </th>
                <th className="px-3 py-2 text-left font-medium whitespace-nowrap">
                  {t("ledger.table.colPartner")}
                </th>
                <th className="px-3 py-2 text-left font-medium whitespace-nowrap">
                  {t("ledger.table.colAccount")}
                </th>
                <th className="px-3 py-2 text-left font-medium whitespace-nowrap">
                  {t("ledger.table.colDocDate")}
                </th>
                <th className="px-3 py-2 text-left font-medium whitespace-nowrap">
                  {t("ledger.table.colDueDate")}
                </th>
                <th className="px-3 py-2 text-left font-medium">
                  {t("ledger.table.colDescription")}
                </th>
                <th className="px-3 py-2 text-right font-medium whitespace-nowrap">
                  {t("ledger.table.colOriginal")}
                </th>
                <th className="px-3 py-2 text-right font-medium whitespace-nowrap">
                  {t("ledger.table.colSettled")}
                </th>
                <th className="px-3 py-2 text-right font-medium whitespace-nowrap">
                  {t("ledger.table.colOpen")}
                </th>
                <th className="px-3 py-2 text-left font-medium whitespace-nowrap">
                  {t("ledger.table.colStatus")}
                </th>
                <th className="px-3 py-2 text-left font-medium whitespace-nowrap">
                  {t("ledger.table.colActions")}
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-border">
                    {Array.from({ length: 11 }).map((_, j) => (
                      <td key={j} className="px-3 py-2">
                        <Skeleton className="h-4 w-full rounded" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : items.length === 0 ? (
                <tr>
                  <td
                    colSpan={11}
                    className="px-4 py-8 text-center text-sm text-[color:var(--muted-fg)]"
                  >
                    {t("ledger.table.noData")}
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-border hover:bg-surface-hover transition-colors"
                  >
                    <td className="px-3 py-2 font-mono text-xs whitespace-nowrap">
                      {item.item_no}
                    </td>
                    <td className="px-3 py-2 text-xs max-w-[140px] truncate">
                      {partnerName(item.business_partner_id)}
                    </td>
                    <td className="px-3 py-2 text-xs whitespace-nowrap">
                      {accountCode(item.accounting_account_id)}
                    </td>
                    <td className="px-3 py-2 text-xs whitespace-nowrap">
                      {item.document_date}
                    </td>
                    <td
                      className={cn(
                        "px-3 py-2 text-xs whitespace-nowrap",
                        item.due_date &&
                          item.due_date < todayIsoDate() &&
                          item.status !== "SETTLED" &&
                          item.status !== "CANCELLED" &&
                          "text-[#d92a2a] font-medium",
                      )}
                    >
                      {item.due_date ?? "—"}
                    </td>
                    <td className="px-3 py-2 text-xs max-w-[200px] truncate">
                      {item.description}
                    </td>
                    <td className="px-3 py-2 text-xs text-right whitespace-nowrap">
                      {fmtAmt(item.original_amount)}
                    </td>
                    <td className="px-3 py-2 text-xs text-right whitespace-nowrap text-approve-fg">
                      {fmtAmt(item.settled_amount)}
                    </td>
                    <td className="px-3 py-2 text-xs text-right whitespace-nowrap font-medium">
                      {fmtAmt(item.open_amount)}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        {canUpdate &&
                          item.status !== "SETTLED" &&
                          item.status !== "CANCELLED" && (
                            <button
                              className="text-[11px] px-2 py-[2px] rounded border border-border hover:bg-surface-hover transition-colors"
                              onClick={() => openEdit(item)}
                            >
                              {t("ledger.actions.edit")}
                            </button>
                          )}
                        {canSettle &&
                          (item.status === "OPEN" ||
                            item.status === "PARTIAL") && (
                            <button
                              className="text-[11px] px-2 py-[2px] rounded border border-border hover:bg-surface-hover transition-colors text-[#2a6dd9]"
                              onClick={() => openSettle(item)}
                            >
                              {t("ledger.actions.settle")}
                            </button>
                          )}
                        {canDelete && item.status === "OPEN" && (
                          <button
                            className="text-[11px] px-2 py-[2px] rounded border border-border hover:bg-surface-hover transition-colors text-[#d92a2a]"
                            onClick={() => setCancelTarget(item)}
                          >
                            {t("ledger.actions.cancel")}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="px-4 pb-3">
          <TablePagination
            page={page}
            pageSize={pageSize}
            total={total}
            totalPages={totalPages}
            onPage={setPage}
            onPageSize={(s) => {
              setPageSize(s);
              setPage(1);
            }}
          />
        </div>
      </div>

      {/* ── Create/Edit Drawer ── */}
      <DrawerModal
        open={drawerOpen}
        onClose={closeDrawer}
        title={
          editingItem
            ? t("ledger.drawer.editTitle")
            : t("ledger.drawer.createTitle")
        }
        subtitle={t("ledger.drawer.subtitle")}
        actions={[
          {
            label: saving
              ? t("ledger.drawer.saving")
              : t("ledger.drawer.save"),
            primary: true,
            loading: saving,
            onClick: handleSave,
          },
        ]}
      >
        <DrawerSection title={t("ledger.drawer.sectionInfo")}>
          <DrawerField label={t("ledger.drawer.itemNo")}>
            <input
              className={inputCls}
              placeholder={t("ledger.drawer.itemNoPlaceholder")}
              value={form.item_no}
              onChange={(e) => setField("item_no", e.target.value)}
            />
          </DrawerField>
          <DrawerField label={t("ledger.drawer.sourceType")}>
            <select
              className={inputCls}
              value={form.source_type ?? "MANUAL"}
              onChange={(e) =>
                setField("source_type", e.target.value as PartnerLedgerSourceType)
              }
            >
              {SOURCE_TYPE_OPTS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </DrawerField>
          <DrawerField label={t("ledger.drawer.partner")}>
            <Combobox
              options={partnerOpts}
              value={form.business_partner_id}
              onChange={(v) => setField("business_partner_id", v)}
              placeholder="— Chọn đối tác —"
            />
          </DrawerField>
          <DrawerField label={t("ledger.drawer.account")}>
            <Combobox
              options={accountOptsDisplay}
              value={form.accounting_account_id}
              onChange={(v) => setField("accounting_account_id", v)}
              placeholder="— Chọn tài khoản —"
            />
          </DrawerField>
          <DrawerField label={t("ledger.drawer.docDate")}>
            <input
              type="date"
              className={inputCls}
              value={form.document_date}
              onChange={(e) => setField("document_date", e.target.value)}
            />
          </DrawerField>
          <DrawerField label={t("ledger.drawer.postingDate")}>
            <input
              type="date"
              className={inputCls}
              value={form.posting_date}
              onChange={(e) => setField("posting_date", e.target.value)}
            />
          </DrawerField>
          <DrawerField label={t("ledger.drawer.dueDate")}>
            <input
              type="date"
              className={inputCls}
              value={form.due_date ?? ""}
              onChange={(e) => setField("due_date", e.target.value)}
            />
          </DrawerField>
          <DrawerField label={t("ledger.drawer.referenceNo")}>
            <input
              className={inputCls}
              placeholder={t("ledger.drawer.referenceNoPlaceholder")}
              value={form.reference_no ?? ""}
              onChange={(e) => setField("reference_no", e.target.value)}
            />
          </DrawerField>
          <DrawerField label={t("ledger.drawer.description")}>
            <textarea
              className={cn(inputCls, "resize-none")}
              rows={2}
              placeholder={t("ledger.drawer.descriptionPlaceholder")}
              value={form.description}
              onChange={(e) => setField("description", e.target.value)}
            />
          </DrawerField>
        </DrawerSection>

        <DrawerSection title={t("ledger.drawer.sectionAmount")}>
          <DrawerField label={t("ledger.drawer.currency")}>
            <select
              className={inputCls}
              value={form.currency ?? "VND"}
              onChange={(e) => setField("currency", e.target.value)}
            >
              {CURRENCY_OPTS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </DrawerField>
          <DrawerField label={t("ledger.drawer.amount")}>
            <input
              type="number"
              className={inputCls}
              min={0}
              step={1000}
              value={form.original_amount}
              onChange={(e) =>
                setField("original_amount", parseFloat(e.target.value) || 0)
              }
            />
          </DrawerField>
          <DrawerField label={t("ledger.drawer.note")}>
            <textarea
              className={cn(inputCls, "resize-none")}
              rows={2}
              placeholder={t("ledger.drawer.notePlaceholder")}
              value={form.note ?? ""}
              onChange={(e) => setField("note", e.target.value)}
            />
          </DrawerField>
        </DrawerSection>

        {saveError && (
          <div className="mx-4 mb-2 text-sm text-[#d92a2a] bg-[#fde8e8] rounded px-3 py-2">
            {saveError}
          </div>
        )}
      </DrawerModal>

      {/* ── Settlement Drawer ── */}
      <DrawerModal
        open={settleOpen}
        onClose={closeSettle}
        title={t("ledger.settlement.title")}
        subtitle={
          settleItem
            ? `${settleItem.item_no} — ${t("ledger.kpi.open")}: ₫ ${fmtAmt(settleItem.open_amount)}`
            : t("ledger.settlement.subtitle")
        }
        zIndex={450}
        actions={[
          {
            label: settleLoading
              ? t("ledger.settlement.saving")
              : t("ledger.settlement.save"),
            primary: true,
            loading: settleLoading,
            onClick: handleSettle,
          },
        ]}
      >
        <DrawerSection title={t("ledger.settlement.subtitle")}>
          <DrawerField label={t("ledger.settlement.voucher")}>
            {vouchersLoading ? (
              <Skeleton className="h-9 rounded" />
            ) : voucherOpts.length === 0 ? (
              <div className="text-sm text-[color:var(--muted-fg)]">
                {t("ledger.settlement.noVouchers")}
              </div>
            ) : (
              <Combobox
                options={voucherSelectOpts}
                value={settleForm.payment_voucher_id}
                onChange={handleVoucherSelect}
                placeholder={t("ledger.settlement.voucherPlaceholder")}
              />
            )}
          </DrawerField>
          {selectedVoucher && (
            <div className="mx-0 mb-2 text-xs text-[color:var(--muted-fg)] bg-[color:var(--muted)] rounded px-3 py-2">
              Chứng từ: {selectedVoucher.voucher_no} — Số tiền:{" "}
              {fmtAmt(selectedVoucher.amount)} {selectedVoucher.currency ?? "VND"}
            </div>
          )}
          <DrawerField label={t("ledger.settlement.date")}>
            <input
              type="date"
              className={inputCls}
              value={settleForm.settlement_date}
              onChange={(e) =>
                setSettleForm((f) => ({ ...f, settlement_date: e.target.value }))
              }
            />
          </DrawerField>
          <DrawerField label={t("ledger.settlement.amount")}>
            <input
              type="number"
              className={inputCls}
              min={0}
              step={1000}
              value={settleForm.amount}
              onChange={(e) =>
                setSettleForm((f) => ({
                  ...f,
                  amount: parseFloat(e.target.value) || 0,
                }))
              }
            />
          </DrawerField>
          <DrawerField label={t("ledger.settlement.note")}>
            <input
              className={inputCls}
              placeholder={t("ledger.settlement.notePlaceholder")}
              value={settleForm.note}
              onChange={(e) =>
                setSettleForm((f) => ({ ...f, note: e.target.value }))
              }
            />
          </DrawerField>
        </DrawerSection>

        {settleError && (
          <div className="mx-4 mb-2 text-sm text-[#d92a2a] bg-[#fde8e8] rounded px-3 py-2">
            {settleError}
          </div>
        )}
      </DrawerModal>

      {/* ── Cancel Confirm ── */}
      <ConfirmModal
        open={!!cancelTarget}
        title={t("ledger.cancel.title")}
        message={
          cancelTarget
            ? t("ledger.cancel.message").replace("{0}", cancelTarget.item_no)
            : ""
        }
        confirmLabel={t("ledger.cancel.confirm")}
        loading={cancelling}
        onConfirm={handleCancel}
        onCancel={() => setCancelTarget(null)}
      />
    </div>
  );
}
