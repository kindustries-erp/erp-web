import { useState, useEffect, useCallback, useMemo } from "react";
import { FileText } from "lucide-react";
import { useT } from "@/core/i18n";
import { useUIStore } from "@/core/config/uiStore";
import { useHasPermission } from "@/shared/hooks/useHasPermission";
import { PageHeader } from "@/shared/components/PageHeader";
import { ConfirmModal } from "@/shared/components/ConfirmModal";
import { BtnPrimary } from "@/shared/components/BtnPrimary";
import { extractApiError } from "@/shared/utils/apiError";
import { todayIsoDate } from "@/modules/finance/utils/financeHelpers";
import { getChartOfAccountsApi, type ChartOfAccount } from "@/modules/accounting/api/catalogApi";
import type { BusinessPartner } from "@/modules/partners/api/partnerApi";
import {
  getPaymentVoucherLookupBusinessPartnersApi,
  getPaymentVouchersPagedApi,
  getPartnerLedgerItemsApi,
  getPartnerLedgerSummaryApi,
  createPartnerLedgerItemApi,
  updatePartnerLedgerItemApi,
  deletePartnerLedgerItemApi,
  createPartnerLedgerSettlementApi,
  type PaymentVoucher,
  type VoucherType,
  type PartnerLedgerItem,
  type PartnerLedgerItemType,
  type PartnerLedgerStatus,
  type CreatePartnerLedgerItemDto,
  type PartnerLedgerSummary,
} from "@/modules/finance/api/financeApi";
import { fmtAmt, emptyForm } from "./helpers";
import { PartnerLedgerKpis } from "./PartnerLedgerKpis";
import { PartnerLedgerFilters } from "./PartnerLedgerFilters";
import { PartnerLedgerTable } from "./PartnerLedgerTable";
import { PartnerLedgerDrawer } from "./PartnerLedgerDrawer";
import { SettlementDrawer } from "./SettlementDrawer";

interface PartnerLedgerPageProps {
  itemType: PartnerLedgerItemType;
  title: string;
  desc: string;
  compact?: boolean;
}

export function PartnerLedgerPage({ itemType, title, desc, compact = false }: PartnerLedgerPageProps) {
  const t = useT();
  const showToast = useUIStore((s) => s.showToast);
  const canCreate = useHasPermission("partner_ledger_items", "create");
  const canUpdate = useHasPermission("partner_ledger_items", "update");
  const canDelete = useHasPermission("partner_ledger_items", "delete");
  const canSettle = useHasPermission("partner_ledger_settlements", "create");

  const [partners, setPartners] = useState<BusinessPartner[]>([]);
  const [accounts, setAccounts] = useState<ChartOfAccount[]>([]);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [partnerFilter, setPartnerFilter] = useState("");
  const [accountFilter, setAccountFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<PartnerLedgerStatus | "">("");
  const [dueFrom, setDueFrom] = useState("");
  const [dueTo, setDueTo] = useState("");
  const [overdueOnly, setOverdueOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [items, setItems] = useState<PartnerLedgerItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [summary, setSummary] = useState<PartnerLedgerSummary | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PartnerLedgerItem | null>(null);
  const [form, setForm] = useState<CreatePartnerLedgerItemDto>(() => emptyForm(itemType));
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [settleOpen, setSettleOpen] = useState(false);
  const [settleItem, setSettleItem] = useState<PartnerLedgerItem | null>(null);
  const [voucherOpts, setVoucherOpts] = useState<PaymentVoucher[]>([]);
  const [vouchersLoading, setVouchersLoading] = useState(false);
  const [settleForm, setSettleForm] = useState({ payment_voucher_id: "", settlement_date: todayIsoDate(), amount: 0, note: "" });
  const [settleLoading, setSettleLoading] = useState(false);
  const [settleError, setSettleError] = useState<string | null>(null);
  const [cancelTarget, setCancelTarget] = useState<PartnerLedgerItem | null>(null);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    Promise.all([getPaymentVoucherLookupBusinessPartnersApi(), getChartOfAccountsApi()])
      .then(([bps, coa]) => { setPartners(bps ?? []); setAccounts(coa ?? []); })
      .catch(() => {});
  }, []);

  const loadSummary = useCallback(() => {
    setSummaryLoading(true);
    getPartnerLedgerSummaryApi({ item_type: itemType, business_partner_id: partnerFilter || undefined, accounting_account_id: accountFilter || undefined })
      .then(setSummary)
      .catch(() => {})
      .finally(() => setSummaryLoading(false));
  }, [itemType, partnerFilter, accountFilter]);

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
      .then((r) => { setItems(r.items); setTotal(r.total); setTotalPages(r.totalPages); })
      .catch((e) => setFetchError(extractApiError(e, t("ledger.table.fetchError"))))
      .finally(() => setLoading(false));
  }, [itemType, page, pageSize, search, partnerFilter, accountFilter, statusFilter, dueFrom, dueTo, overdueOnly, t]);

  useEffect(() => { loadSummary(); }, [loadSummary]);
  useEffect(() => { loadItems(); }, [loadItems]);
  useEffect(() => {
    const id = setTimeout(() => { setSearch(searchInput); setPage(1); }, 350);
    return () => clearTimeout(id);
  }, [searchInput]);

  useEffect(() => {
    if (!settleOpen || !settleItem) return;
    const voucherTypes: VoucherType[] = itemType === "RECEIVABLE" ? ["CASH_RECEIPT", "BANK_RECEIPT"] : ["CASH_PAYMENT", "BANK_PAYMENT"];
    setVouchersLoading(true);
    Promise.all(voucherTypes.map((vt) => getPaymentVouchersPagedApi({ status: "POSTED", counterparty_id: settleItem.business_partner_id, voucher_type: vt, pageSize: 100, sort: ["-document_date"] })))
      .then((results) => setVoucherOpts(results.flatMap((r) => r.items)))
      .catch(() => setVoucherOpts([]))
      .finally(() => setVouchersLoading(false));
  }, [settleOpen, settleItem, itemType]);

  const selectedVoucher = useMemo(() => voucherOpts.find((v) => v.id === settleForm.payment_voucher_id), [voucherOpts, settleForm.payment_voucher_id]);
  const partnerOpts = useMemo(() => partners.map((p) => {
    const code = p.code ?? p.tax_code ?? "";
    const name = p.name || p.display_name || code || p.id;
    return { value: p.id, label: code ? `${code} — ${name}` : name };
  }), [partners]);
  const accountOpts = useMemo(() => accounts
    .filter((a) => itemType === "RECEIVABLE" ? a.is_receivable_account === true : a.is_payable_account === true)
    .map((a) => ({ value: a.id, label: `${a.account_code} — ${a.account_name}` })), [accounts, itemType]);
  const accountOptsDisplay = useMemo(() => accountOpts.length > 0 ? accountOpts : accounts.map((a) => ({ value: a.id, label: `${a.account_code} — ${a.account_name}` })), [accountOpts, accounts]);
  const voucherSelectOpts = useMemo(() => voucherOpts.map((v) => ({ value: v.id, label: `${v.voucher_no} — ${fmtAmt(v.amount)} ${v.currency ?? "VND"}` })), [voucherOpts]);
  const partnerName = useCallback((id: string) => partners.find((p) => p.id === id)?.name ?? partners.find((p) => p.id === id)?.display_name ?? id, [partners]);
  const accountCode = useCallback((id: string) => accounts.find((ac) => ac.id === id)?.account_code ?? id, [accounts]);

  const applyFilter = useCallback((fn: () => void) => { fn(); setPage(1); }, []);
  const resetFilters = () => { setSearchInput(""); setSearch(""); setPartnerFilter(""); setAccountFilter(""); setStatusFilter(""); setDueFrom(""); setDueTo(""); setOverdueOnly(false); setPage(1); };
  const closeDrawer = () => { setDrawerOpen(false); setEditingItem(null); };
  const closeSettle = () => { setSettleOpen(false); setSettleItem(null); };
  const refreshLedger = () => { loadItems(); loadSummary(); };

  function openNew() { setEditingItem(null); setForm(emptyForm(itemType)); setSaveError(null); setDrawerOpen(true); }
  function openEdit(item: PartnerLedgerItem) {
    setEditingItem(item);
    setForm({ item_no: item.item_no, item_type: item.item_type, source_type: item.source_type, business_partner_id: item.business_partner_id, accounting_account_id: item.accounting_account_id, document_date: item.document_date, posting_date: item.posting_date, due_date: item.due_date ?? "", reference_no: item.reference_no ?? "", description: item.description, currency: item.currency, original_amount: item.original_amount, note: item.note ?? "" });
    setSaveError(null);
    setDrawerOpen(true);
  }
  function setField<K extends keyof CreatePartnerLedgerItemDto>(key: K, value: CreatePartnerLedgerItemDto[K]) { setForm((f) => ({ ...f, [key]: value })); }
  function openSettle(item: PartnerLedgerItem) { setSettleItem(item); setSettleForm({ payment_voucher_id: "", settlement_date: todayIsoDate(), amount: 0, note: "" }); setSettleError(null); setSettleOpen(true); }
  function handleVoucherSelect(voucherId: string) {
    setSettleForm((f) => {
      const v = voucherOpts.find((voucher) => voucher.id === voucherId);
      const maxAmt = v && settleItem ? Math.min(settleItem.open_amount, v.amount) : f.amount;
      return { ...f, payment_voucher_id: voucherId, amount: maxAmt };
    });
  }

  async function handleSave() {
    const message = validateLedgerForm(form);
    if (message) { setSaveError(message); return; }
    setSaving(true);
    setSaveError(null);
    try {
      const dto: CreatePartnerLedgerItemDto = { ...form, due_date: form.due_date || undefined, reference_no: form.reference_no || undefined, note: form.note || undefined };
      if (editingItem) await updatePartnerLedgerItemApi(editingItem.id, dto); else await createPartnerLedgerItemApi(dto);
      closeDrawer();
      refreshLedger();
      showToast({ title: editingItem ? "Đã cập nhật phiếu" : "Đã tạo phiếu công nợ", variant: "success" });
    } catch (e) {
      setSaveError(extractApiError(e, t("ledger.drawer.saveFail")));
    } finally { setSaving(false); }
  }

  async function handleSettle() {
    if (!settleItem) return;
    if (!settleForm.payment_voucher_id) { setSettleError("Vui lòng chọn chứng từ thanh toán."); return; }
    if (settleForm.amount <= 0) { setSettleError("Số tiền bù trừ phải lớn hơn 0."); return; }
    setSettleLoading(true);
    setSettleError(null);
    try {
      await createPartnerLedgerSettlementApi({ partner_ledger_item_id: settleItem.id, payment_voucher_id: settleForm.payment_voucher_id, settlement_date: settleForm.settlement_date, amount: settleForm.amount, note: settleForm.note || undefined });
      closeSettle();
      refreshLedger();
      showToast({ title: "Bù trừ công nợ thành công", variant: "success" });
    } catch (e) {
      setSettleError(extractApiError(e, t("ledger.settlement.saveFail")));
    } finally { setSettleLoading(false); }
  }

  async function handleCancel() {
    if (!cancelTarget) return;
    setCancelling(true);
    try {
      await deletePartnerLedgerItemApi(cancelTarget.id);
      setCancelTarget(null);
      refreshLedger();
      showToast({ title: "Đã hủy phiếu công nợ", variant: "success" });
    } catch (e) {
      showToast({ title: extractApiError(e, t("ledger.cancel.fail")), variant: "destructive" });
    } finally { setCancelling(false); }
  }

  return (
    <div>
      {!compact && <PageHeader title={title} desc={desc} icon={<FileText className="h-4 w-4" />} actions={canCreate ? <BtnPrimary onClick={openNew}>+ {t("ledger.actions.create")}</BtnPrimary> : undefined} className="mb-4" />}
      <div className={compact ? "rounded-xl border border-[color:var(--border)] bg-[color:var(--card)] p-4" : ""}>
        {compact && <div className="mb-3 flex items-center justify-between gap-3"><div><h3 className="font-semibold text-[color:var(--fg)]">{title}</h3><p className="text-sm text-[color:var(--muted-fg)]">{desc}</p></div>{canCreate ? <BtnPrimary onClick={openNew}>+ {t("ledger.actions.create")}</BtnPrimary> : null}</div>}
      <PartnerLedgerKpis summary={summary} loading={summaryLoading} t={t} />
      <PartnerLedgerFilters searchInput={searchInput} setSearchInput={setSearchInput} partnerOpts={partnerOpts} partnerFilter={partnerFilter} setPartnerFilter={setPartnerFilter} accountOpts={accountOptsDisplay} accountFilter={accountFilter} setAccountFilter={setAccountFilter} statusFilter={statusFilter} setStatusFilter={setStatusFilter} dueFrom={dueFrom} setDueFrom={setDueFrom} dueTo={dueTo} setDueTo={setDueTo} overdueOnly={overdueOnly} setOverdueOnly={setOverdueOnly} resetFilters={resetFilters} applyFilter={applyFilter} t={t} />
      <PartnerLedgerTable items={items} loading={loading} fetchError={fetchError} total={total} page={page} pageSize={pageSize} totalPages={totalPages} onPage={setPage} onPageSize={(s) => { setPageSize(s); setPage(1); }} partnerName={partnerName} accountCode={accountCode} actions={{ canUpdate, canDelete, canSettle, onEdit: openEdit, onSettle: openSettle, onCancel: setCancelTarget }} t={t} />
      <PartnerLedgerDrawer open={drawerOpen} onClose={closeDrawer} editingItem={editingItem} form={form} setField={setField} partnerOpts={partnerOpts} accountOpts={accountOptsDisplay} saving={saving} saveError={saveError} onSave={handleSave} t={t} />
      <SettlementDrawer open={settleOpen} onClose={closeSettle} settleItem={settleItem} vouchers={voucherOpts} voucherOpts={voucherSelectOpts} vouchersLoading={vouchersLoading} selectedVoucher={selectedVoucher} form={settleForm} setForm={setSettleForm} onVoucherSelect={handleVoucherSelect} loading={settleLoading} error={settleError} onSave={handleSettle} t={t} />
      </div>
      <ConfirmModal open={!!cancelTarget} title={t("ledger.cancel.title")} message={cancelTarget ? t("ledger.cancel.message").replace("{0}", cancelTarget.item_no) : ""} confirmLabel={t("ledger.cancel.confirm")} loading={cancelling} onConfirm={handleCancel} onCancel={() => setCancelTarget(null)} />
    </div>
  );
}

function validateLedgerForm(form: CreatePartnerLedgerItemDto) {
  if (!form.item_no.trim()) return "Số phiếu không được để trống.";
  if (!form.business_partner_id) return "Vui lòng chọn đối tác.";
  if (!form.accounting_account_id) return "Vui lòng chọn tài khoản kế toán.";
  if (!form.description.trim()) return "Diễn giải không được để trống.";
  if (form.original_amount <= 0) return "Số tiền phải lớn hơn 0.";
  return null;
}
