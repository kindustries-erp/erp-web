import { useState, useEffect, useRef } from "react";
import { Landmark, Settings, Wallet } from "lucide-react";
import { useAppStore } from "@/core/config/appStore";
import { useT } from "@/core/i18n";
import { PageHeader } from "@/shared/components/PageHeader";
import {
  DrawerModal,
  DrawerSection,
  DrawerField,
  inputCls,
} from "@/shared/components/DrawerModal";
import { ConfirmModal } from "@/shared/components/ConfirmModal";
import { Combobox } from "@/shared/components/Combobox";
import { SearchInput } from "@/shared/components/SearchInput";
import { DataTable, type DataTableColumn } from "@/shared/components/DataTable";
import { Checkbox } from "@/shared/components/ui/checkbox";
import {
  getCompanyBankAccountsPagedApi,
  createCompanyBankAccountApi,
  updateCompanyBankAccountApi,
  deleteCompanyBankAccountApi,
  getChartOfAccountsApi,
  getChartOfAccountsPagedApi,
  createChartOfAccountApi,
  updateChartOfAccountApi,
  deleteChartOfAccountApi,
  type CompanyBankAccount,
  type ChartOfAccount,
  type CreateCompanyBankAccountDto,
  type CreateChartOfAccountDto,
} from "@/modules/accounting/api/catalogApi";
import {
  getCashFundsPagedApi,
  createCashFundApi,
  updateCashFundApi,
  deleteCashFundApi,
  type CashFund,
  type CreateCashFundDto,
} from "@/modules/finance/api/financeApi";

export function ThietLap() {
  const { settingsActiveTab } = useAppStore();

  return (
    <div>
      {settingsActiveTab === "quy" && <QuyTab />}
      {settingsActiveTab === "nh" && <NHTab />}
      {settingsActiveTab === "tk" && <TKTab />}
    </div>
  );
}

// ── Quỹ tiền mặt tab (real API) ────────────────────────────────────────────────

interface QuyForm {
  fund_code: string;
  fund_name: string;
  accounting_account_id: string;
  currency: string;
  is_active: boolean;
  note: string;
}
const emptyQuyForm: QuyForm = {
  fund_code: "",
  fund_name: "",
  accounting_account_id: "",
  currency: "VND",
  is_active: true,
  note: "",
};
function buildQuyForm(f: CashFund): QuyForm {
  return {
    fund_code: f.fund_code,
    fund_name: f.fund_name,
    accounting_account_id: f.accounting_account_id ?? "",
    currency: f.currency ?? "VND",
    is_active: f.is_active,
    note: f.note ?? "",
  };
}

function QuyTab() {
  const [items, setItems] = useState<CashFund[]>([]);
  const [coaItems, setCoaItems] = useState<ChartOfAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<CashFund | null>(null);
  const [form, setForm] = useState<QuyForm>(emptyQuyForm);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CashFund | null>(null);
  const [deleting, setDeleting] = useState(false);
  const t = useT();

  useEffect(() => {
    getChartOfAccountsApi().then(setCoaItems).catch(() => {});
  }, []);

  useEffect(() => {
    loadFunds(page, pageSize);
  }, [page, pageSize]);

  async function loadFunds(pg: number, ps: number) {
    setLoading(true);
    setFetchError(null);
    try {
      const res = await getCashFundsPagedApi({ page: pg, pageSize: ps });
      setItems(res.items);
      setTotal(res.total);
      setTotalPages(res.totalPages);
    } catch {
      setFetchError(t("thietlap.funds.fetchError"));
    } finally {
      setLoading(false);
    }
  }

  function handlePageSize(ps: number) { setPageSize(ps); setPage(1); }
  function openNew() { setEditing(null); setForm(emptyQuyForm); setSaveError(null); setDrawerOpen(true); }
  function openEdit(item: CashFund) { setEditing(item); setForm(buildQuyForm(item)); setSaveError(null); setDrawerOpen(true); }
  function closeDrawer() { setDrawerOpen(false); setEditing(null); setSaveError(null); }
  const setField = <K extends keyof QuyForm>(k: K, v: QuyForm[K]) => setForm((f) => ({ ...f, [k]: v }));

  async function handleSave() {
    if (!form.fund_code.trim() || !form.fund_name.trim() || !form.accounting_account_id) {
      setSaveError(t("thietlap.funds.requiredError"));
      return;
    }
    setSaving(true);
    setSaveError(null);
    try {
      const dto: CreateCashFundDto = {
        fund_code: form.fund_code.trim(),
        fund_name: form.fund_name.trim(),
        accounting_account_id: form.accounting_account_id,
        currency: form.currency || "VND",
        is_active: form.is_active,
        note: form.note.trim() || undefined,
      };
      if (editing) {
        await updateCashFundApi(editing.id, dto);
      } else {
        await createCashFundApi(dto);
      }
      closeDrawer();
      if (!editing && page !== 1) setPage(1);
      else loadFunds(page, pageSize);
    } catch (e: any) {
      setSaveError(extractApiError(e, t("thietlap.common.unknownError")));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteCashFundApi(deleteTarget.id);
      setDeleteTarget(null);
      if (items.length === 1 && page > 1) setPage(page - 1);
      else loadFunds(page, pageSize);
    } catch {
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  }

  const isDirty = !!form.fund_code.trim() || !!form.fund_name.trim();
  const columns: DataTableColumn<CashFund>[] = [
    {
      key: "fund_code",
      header: t("thietlap.headers.fundCode"),
      cell: (q) => q.fund_code,
      className: "font-mono text-[color:var(--muted-fg)]",
      skeletonClassName: "w-16",
    },
    {
      key: "fund_name",
      header: t("thietlap.headers.fundName"),
      cell: (q) => q.fund_name,
      className: "font-medium",
      skeletonClassName: "w-32",
    },
    {
      key: "accounting_account_id",
      header: t("thietlap.headers.accountingAccount"),
      cell: (q) =>
        coaItems.find((c) => c.id === q.accounting_account_id)?.account_code ||
        "—",
      skeletonClassName: "w-28",
    },
    {
      key: "currency",
      header: t("thietlap.headers.currency"),
      cell: (q) => q.currency,
      className: "text-[color:var(--muted-fg)]",
      skeletonClassName: "w-12",
    },
    {
      key: "status",
      header: t("thietlap.headers.status"),
      cell: (q) => <TagCell active={q.is_active} isDefault={false} />,
      skeletonClassName: "w-16",
    },
    {
      key: "actions",
      header: "",
      cell: (q) => (
        <div className="flex gap-[5px] justify-end">
          <button
            title={t("common.edit")}
            onClick={() => openEdit(q)}
            className="p-[4px] rounded text-[color:var(--muted-fg)] hover:text-foreground hover:bg-surface-hover cursor-pointer"
          >
            <IconEdit />
          </button>
          <button
            title={t("common.delete")}
            onClick={() => setDeleteTarget(q)}
            className="p-[4px] rounded text-[color:var(--muted-fg)] hover:text-red-500 hover:bg-surface-hover cursor-pointer"
          >
            <IconTrash />
          </button>
        </div>
      ),
      headerClassName: "w-[80px]",
      skeletonClassName: "",
    },
  ];

  return (
    <div>
      <SectionHeader
        title={t("thietlap.funds.title")}
        desc={t("thietlap.funds.desc")}
        icon={<Wallet className="h-4 w-4" />}
        onAdd={openNew}
      />
      
      <DataTable
        items={items}
        columns={columns}
        getRowKey={(q) => q.id}
        loading={loading}
        error={fetchError}
        emptyLabel={t("common.noData")}
        minWidth={600}
        loadingRows={4}
        page={page}
        pageSize={pageSize}
        total={total}
        totalPages={totalPages}
        onPage={setPage}
        onPageSize={handlePageSize}
      />

      <DrawerModal
        open={drawerOpen}
        onClose={closeDrawer}
        confirmOnClose={isDirty && !editing}
        title={editing ? t("thietlap.funds.editTitle") : t("thietlap.funds.createTitle")}
        subtitle={editing ? editing.fund_name : t("thietlap.common.subtitle")}
        actions={[
          { label: t("common.cancel"), onClick: closeDrawer },
          { label: editing ? t("common.saveChanges") : t("common.addNew"), primary: true, loading: saving, disabled: saving, onClick: handleSave },
        ]}
      >
        <DrawerSection title={t("thietlap.funds.sectionInfo")}>
          <DrawerField label={t("thietlap.headers.fundCode")} required>
            <input type="text" className={inputCls} value={form.fund_code} onChange={(e) => setField("fund_code", e.target.value)} placeholder={t("thietlap.funds.codePlaceholder")} />
          </DrawerField>
          <DrawerField label={t("thietlap.headers.fundName")} required>
            <input type="text" className={inputCls} value={form.fund_name} onChange={(e) => setField("fund_name", e.target.value)} placeholder={t("thietlap.funds.namePlaceholder")} />
          </DrawerField>
          <DrawerField label={t("thietlap.headers.accountingAccount")} required>
            <Combobox
              options={coaItems.map((c) => ({ value: c.id, label: `${c.account_code} — ${c.account_name}` }))}
              value={form.accounting_account_id}
              onChange={(v) => setField("accounting_account_id", v)}
              placeholder={t("thietlap.common.selectAccount")}
            />
          </DrawerField>
          <DrawerField label={t("thietlap.headers.currency")}>
            <Combobox
              options={[{ value: "VND", label: "VND" }, { value: "USD", label: "USD" }]}
              value={form.currency}
              onChange={(v) => setField("currency", v || "VND")}
              allowClear={false}
            />
          </DrawerField>
          <DrawerField label={t("thietlap.headers.status")}>
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox checked={form.is_active} onCheckedChange={(v) => setField("is_active", v === true)} />
              <span className="text-xs text-foreground">{t("thietlap.common.activeLabel")}</span>
            </label>
          </DrawerField>
          <DrawerField label={t("thietlap.fields.note")}>
            <textarea className={inputCls} rows={2} value={form.note} onChange={(e) => setField("note", e.target.value)} />
          </DrawerField>
        </DrawerSection>
        {saveError && <ErrorBanner msg={saveError} />}
      </DrawerModal>

      <ConfirmModal
        open={!!deleteTarget}
        title={t("confirmModal.defaultTitle")}
        message={t("thietlap.funds.deleteMessage").replace("{0}", deleteTarget?.fund_name ?? "")}
        confirmLabel={t("confirmModal.defaultConfirm")}
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}


// ── Tài khoản NH tab ──────────────────────────────────────────────────────────
interface BankForm {
  bank_account_code: string;
  bank_name: string;
  account_number: string;
  account_holder: string;
  accounting_account_id: string;
  currency: string;
}
const emptyBankForm: BankForm = {
  bank_account_code: "",
  bank_name: "",
  account_number: "",
  account_holder: "",
  accounting_account_id: "",
  currency: "VND",
};
function buildBankForm(b: CompanyBankAccount): BankForm {
  return {
    bank_account_code: b.bank_account_code,
    bank_name: b.bank_name,
    account_number: b.account_number,
    account_holder: b.account_holder,
    accounting_account_id: b.accounting_account_id,
    currency: b.currency ?? "VND",
  };
}

function NHTab() {
  const [items, setItems] = useState<CompanyBankAccount[]>([]);
  const [coaItems, setCoaItems] = useState<ChartOfAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<CompanyBankAccount | null>(null);
  const [form, setForm] = useState<BankForm>(emptyBankForm);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CompanyBankAccount | null>(
    null,
  );
  const [deleting, setDeleting] = useState(false);
  const t = useT();

  // Load CoA once for dropdown
  useEffect(() => {
    getChartOfAccountsApi()
      .then(setCoaItems)
      .catch(() => {});
  }, []);

  useEffect(() => {
    loadBanks(page, pageSize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize]);

  async function loadBanks(pg: number, ps: number) {
    setLoading(true);
    setFetchError(null);
    try {
      const result = await getCompanyBankAccountsPagedApi({
        page: pg,
        pageSize: ps,
      });
      setItems(result.items);
      setTotal(result.total);
      setTotalPages(result.totalPages);
    } catch {
      setFetchError(t("thietlap.bank.fetchError"));
    } finally {
      setLoading(false);
    }
  }

  function handlePageSize(size: number) {
    setPageSize(size);
    setPage(1);
  }

  function openNew() {
    setEditing(null);
    setForm(emptyBankForm);
    setSaveError(null);
    setDrawerOpen(true);
  }
  function openEdit(item: CompanyBankAccount) {
    setEditing(item);
    setForm(buildBankForm(item));
    setSaveError(null);
    setDrawerOpen(true);
  }
  function closeDrawer() {
    setDrawerOpen(false);
    setEditing(null);
    setSaveError(null);
  }
  const setField = <K extends keyof BankForm>(k: K, v: BankForm[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  async function handleSave() {
    if (
      !form.bank_name.trim() ||
      !form.account_number.trim() ||
      !form.account_holder.trim()
    ) {
      setSaveError(t("thietlap.bank.requiredError"));
      return;
    }
    setSaving(true);
    setSaveError(null);
    try {
      const dto: CreateCompanyBankAccountDto = {
        bank_account_code: form.bank_account_code.trim(),
        bank_name: form.bank_name.trim(),
        account_number: form.account_number.trim(),
        account_holder: form.account_holder.trim(),
        accounting_account_id: form.accounting_account_id.trim(),
        currency: form.currency.trim() || "VND",
      };
      if (editing) {
        await updateCompanyBankAccountApi(editing.id, dto);
      } else {
        await createCompanyBankAccountApi(dto);
      }
      closeDrawer();
      if (!editing && page !== 1) setPage(1);
      else loadBanks(page, pageSize);
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })
        ?.response?.data?.message;
      setSaveError(msg ?? t("thietlap.common.saveFail"));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteCompanyBankAccountApi(deleteTarget.id);
      setDeleteTarget(null);
      if (items.length === 1 && page > 1) setPage(page - 1);
      else loadBanks(page, pageSize);
    } catch {
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  }

  const isDirty = !!form.bank_name.trim() || !!form.account_number.trim();
  const columns: DataTableColumn<CompanyBankAccount>[] = [
    {
      key: "bank_account_code",
      header: t("thietlap.headers.accountCodeShort"),
      cell: (b) => b.bank_account_code || "—",
      className: "font-mono text-[color:var(--muted-fg)]",
      skeletonClassName: "w-14",
    },
    {
      key: "bank_name",
      header: t("thietlap.headers.bankNameFull"),
      cell: (b) => b.bank_name,
      className: "font-medium",
      skeletonClassName: "w-32",
    },
    {
      key: "account_number",
      header: t("thietlap.headers.accountNumber"),
      cell: (b) => b.account_number,
      className: "font-mono",
      skeletonClassName: "w-28",
    },
    {
      key: "account_holder",
      header: t("thietlap.headers.accountHolder"),
      cell: (b) => b.account_holder,
      skeletonClassName: "w-24",
    },
    {
      key: "currency",
      header: t("thietlap.headers.currency"),
      cell: (b) => b.currency,
      className: "text-[color:var(--muted-fg)]",
      skeletonClassName: "w-10",
    },
    {
      key: "actions",
      header: "",
      cell: (b) => (
        <div className="flex gap-[5px] justify-end">
          <button
            title={t("common.edit")}
            onClick={() => openEdit(b)}
            className="p-[4px] rounded text-[color:var(--muted-fg)] hover:text-foreground hover:bg-surface-hover cursor-pointer"
          >
            <IconEdit />
          </button>
          <button
            title={t("common.delete")}
            onClick={() => setDeleteTarget(b)}
            className="p-[4px] rounded text-[color:var(--muted-fg)] hover:text-red-500 hover:bg-surface-hover cursor-pointer"
          >
            <IconTrash />
          </button>
        </div>
      ),
      headerClassName: "w-[80px]",
      skeletonClassName: "",
    },
  ];

  return (
    <div>
      <SectionHeader
        title={t("thietlap.bank.title")}
        desc={t("thietlap.bank.desc")}
        icon={<Landmark className="h-4 w-4" />}
        onAdd={openNew}
      />
      <DataTable
        items={items}
        columns={columns}
        getRowKey={(b) => b.id}
        loading={loading}
        error={fetchError}
        emptyLabel={t("common.noData")}
        minWidth={560}
        loadingRows={5}
        page={page}
        pageSize={pageSize}
        total={total}
        totalPages={totalPages}
        onPage={setPage}
        onPageSize={handlePageSize}
      />

      <DrawerModal
        open={drawerOpen}
        onClose={closeDrawer}
        confirmOnClose={isDirty && !editing}
        title={
          editing ? t("thietlap.bank.editTitle") : t("thietlap.bank.createTitle")
        }
        subtitle={editing ? editing.bank_name : t("thietlap.common.subtitle")}
        actions={[
          { label: t("common.cancel"), onClick: closeDrawer },
          {
            label: editing ? t("common.saveChanges") : t("common.addNew"),
            primary: true,
            loading: saving,
            disabled: saving,
            onClick: handleSave,
          },
        ]}
      >
        <DrawerSection title={t("thietlap.bank.sectionInfo")}>
          <DrawerField label={t("thietlap.fields.code")}>
            <input
              type="text"
              className={inputCls}
              value={form.bank_account_code}
              onChange={(e) => setField("bank_account_code", e.target.value)}
              placeholder={t("thietlap.bank.accountCodePlaceholder")}
            />
          </DrawerField>
          <DrawerField label={t("thietlap.headers.bankNameFull")} required>
            <input
              type="text"
              className={inputCls}
              value={form.bank_name}
              onChange={(e) => setField("bank_name", e.target.value)}
              placeholder={t("thietlap.bank.bankNamePlaceholder")}
            />
          </DrawerField>
          <DrawerField label={t("thietlap.headers.accountNumber")} required>
            <input
              type="text"
              className={inputCls}
              value={form.account_number}
              onChange={(e) => setField("account_number", e.target.value)}
              placeholder="0071001xxx"
            />
          </DrawerField>
          <DrawerField label={t("thietlap.headers.accountHolder")} required>
            <input
              type="text"
              className={inputCls}
              value={form.account_holder}
              onChange={(e) => setField("account_holder", e.target.value)}
            />
          </DrawerField>
          <DrawerField label={t("thietlap.headers.accountingAccount")}>
            <Combobox
              options={coaItems.map((c) => ({
                value: c.id,
                label: `${c.account_code} — ${c.account_name}`,
              }))}
              value={form.accounting_account_id}
              onChange={(v) => setField("accounting_account_id", v)}
              placeholder={t("thietlap.common.selectAccount")}
            />
          </DrawerField>
          <DrawerField label={t("thietlap.headers.currency")}>
            <Combobox
              options={[
                { value: "VND", label: "VND" },
                { value: "USD", label: "USD" },
                { value: "EUR", label: "EUR" },
              ]}
              value={form.currency}
              onChange={(v) => setField("currency", v || "VND")}
              allowClear={false}
            />
          </DrawerField>
        </DrawerSection>
        {saveError && (
          <div className="text-xs text-[color:var(--warn-fg)] bg-[color:var(--warn-bg)] border border-[color:var(--warn-fg)]/30 rounded-lg px-3 py-2">
            {saveError}
          </div>
        )}
      </DrawerModal>

      <ConfirmModal
        open={!!deleteTarget}
        title={t("confirmModal.defaultTitle")}
        message={t("thietlap.bank.deleteMessage").replace("{0}", `${deleteTarget?.bank_name ?? ""} — ${deleteTarget?.account_number ?? ""}`)}
        confirmLabel={t("confirmModal.defaultConfirm")}
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

// ── Hệ thống tài khoản tab ────────────────────────────────────────────────────
const ACC_TYPES = [
  { value: "ASSET", labelKey: "thietlap.accountTypes.asset" },
  { value: "LIABILITY", labelKey: "thietlap.accountTypes.liability" },
  { value: "EQUITY", labelKey: "thietlap.accountTypes.equity" },
  { value: "REVENUE", labelKey: "thietlap.accountTypes.revenue" },
  { value: "EXPENSE", labelKey: "thietlap.accountTypes.expense" },
  { value: "OTHER", labelKey: "thietlap.accountTypes.other" },
];
const NORMAL_BALANCE_OPTS = [
  { value: "DEBIT", labelKey: "thietlap.accountTypes.debit" },
  { value: "CREDIT", labelKey: "thietlap.accountTypes.credit" },
];
interface CoaForm {
  account_code: string;
  account_name: string;
  account_type: string;
  normal_balance: string;
  parent_account_id: string;
  level: string;
  is_cash_account: boolean;
}
const emptyCoaForm: CoaForm = {
  account_code: "",
  account_name: "",
  account_type: "ASSET",
  normal_balance: "DEBIT",
  parent_account_id: "",
  level: "",
  is_cash_account: false,
};
function buildCoaForm(c: ChartOfAccount): CoaForm {
  return {
    account_code: c.account_code,
    account_name: c.account_name,
    account_type: c.account_type,
    normal_balance: c.normal_balance,
    parent_account_id: c.parent_account_id ?? "",
    level: c.level != null ? String(c.level) : "",
    is_cash_account: c.is_cash_account ?? false,
  };
}

function TKTab() {
  const [items, setItems] = useState<ChartOfAccount[]>([]);
  const [allItems, setAllItems] = useState<ChartOfAccount[]>([]); // for parent select
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const searchTimer = useRef<ReturnType<typeof setTimeout>>();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<ChartOfAccount | null>(null);
  const [form, setForm] = useState<CoaForm>(emptyCoaForm);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ChartOfAccount | null>(null);
  const [deleting, setDeleting] = useState(false);
  const t = useT();

  // Load flat list for parent select
  useEffect(() => {
    getChartOfAccountsApi()
      .then(setAllItems)
      .catch(() => {});
  }, []);

  useEffect(() => {
    loadCoa(page, pageSize, search);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, search]);

  async function loadCoa(pg: number, ps: number, q: string) {
    setLoading(true);
    setFetchError(null);
    try {
      const result = await getChartOfAccountsPagedApi({
        page: pg,
        pageSize: ps,
        search: q || undefined,
      });
      setItems(result.items);
      setTotal(result.total);
      setTotalPages(result.totalPages);
    } catch {
      setFetchError(t("thietlap.accounts.fetchError"));
    } finally {
      setLoading(false);
    }
  }

  function handleSearchInput(value: string) {
    setSearchInput(value);
    clearTimeout(searchTimer.current);
    if (value === "") {
      setSearch("");
      setPage(1);
    } else {
      searchTimer.current = setTimeout(() => {
        setSearch(value);
        setPage(1);
      }, 400);
    }
  }

  function handlePageSize(size: number) {
    setPageSize(size);
    setPage(1);
  }

  function openNew() {
    setEditing(null);
    setForm(emptyCoaForm);
    setSaveError(null);
    setDrawerOpen(true);
  }
  function openEdit(item: ChartOfAccount) {
    setEditing(item);
    setForm(buildCoaForm(item));
    setSaveError(null);
    setDrawerOpen(true);
  }
  function closeDrawer() {
    setDrawerOpen(false);
    setEditing(null);
    setSaveError(null);
  }
  const setField = <K extends keyof CoaForm>(k: K, v: CoaForm[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  async function handleSave() {
    if (!form.account_code.trim() || !form.account_name.trim()) {
      setSaveError(t("thietlap.accounts.requiredError"));
      return;
    }
    setSaving(true);
    setSaveError(null);
    try {
      const dto: CreateChartOfAccountDto = {
        account_code: form.account_code.trim(),
        account_name: form.account_name.trim(),
        account_type: form.account_type,
        normal_balance: form.normal_balance,
        parent_account_id: form.parent_account_id.trim() || null,
        level: form.level ? parseInt(form.level, 10) : null,
        is_cash_account: form.is_cash_account,
      };
      if (editing) {
        await updateChartOfAccountApi(editing.id, dto);
      } else {
        await createChartOfAccountApi(dto);
      }
      closeDrawer();
      // Refresh flat list for parent select too
      getChartOfAccountsApi()
        .then(setAllItems)
        .catch(() => {});
      if (!editing && page !== 1) setPage(1);
      else loadCoa(page, pageSize, search);
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })
        ?.response?.data?.message;
      setSaveError(msg ?? t("thietlap.common.saveFail"));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteChartOfAccountApi(deleteTarget.id);
      setDeleteTarget(null);
      getChartOfAccountsApi()
        .then(setAllItems)
        .catch(() => {});
      if (items.length === 1 && page > 1) setPage(page - 1);
      else loadCoa(page, pageSize, search);
    } catch {
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  }

  const isDirty = !!form.account_code.trim() || !!form.account_name.trim();
  const accTypeOpts = ACC_TYPES.map((a) => ({ value: a.value, label: t(a.labelKey) }));
  const normalBalanceOpts = NORMAL_BALANCE_OPTS.map((a) => ({
    value: a.value,
    label: t(a.labelKey),
  }));
  const accTypeLabel = (v: string) =>
    accTypeOpts.find((a) => a.value === v)?.label ?? v;
  const balLabel = (v: string) =>
    normalBalanceOpts.find((a) => a.value === v)?.label ?? v;
  const columns: DataTableColumn<ChartOfAccount>[] = [
    {
      key: "account_code",
      header: t("thietlap.headers.accountCode"),
      cell: (c) => c.account_code,
      className: "font-mono font-semibold",
      skeletonClassName: "w-10",
    },
    {
      key: "account_name",
      header: t("thietlap.headers.accName"),
      cell: (c) => c.account_name,
      className: "font-medium",
      skeletonClassName: "w-40",
    },
    {
      key: "account_type",
      header: t("thietlap.headers.accType"),
      cell: (c) => accTypeLabel(c.account_type),
      className: "text-[color:var(--muted-fg)]",
      skeletonClassName: "w-20",
    },
    {
      key: "normal_balance",
      header: t("thietlap.headers.normalBalance"),
      cell: (c) => balLabel(c.normal_balance),
      className: "text-[color:var(--muted-fg)]",
      skeletonClassName: "w-8",
    },
    {
      key: "level",
      header: t("thietlap.headers.level"),
      cell: (c) => c.level ?? "—",
      headerClassName: "text-center",
      className: "text-center text-[color:var(--muted-fg)]",
      skeletonClassName: "w-6 mx-auto",
    },
    {
      key: "is_cash_account",
      header: t("thietlap.headers.cash"),
      cell: (c) =>
        c.is_cash_account ? (
          <span className="text-[color:var(--approve-fg)] font-bold">✓</span>
        ) : (
          <span className="text-[color:var(--faint)]">—</span>
        ),
      headerClassName: "text-center",
      className: "text-center",
      skeletonClassName: "w-6 mx-auto",
    },
    {
      key: "actions",
      header: "",
      cell: (c) => (
        <div className="flex gap-[5px] justify-end">
          <button
            title={t("common.edit")}
            onClick={() => openEdit(c)}
            className="p-[4px] rounded text-[color:var(--muted-fg)] hover:text-foreground hover:bg-surface-hover cursor-pointer"
          >
            <IconEdit />
          </button>
          <button
            title={t("common.delete")}
            onClick={() => setDeleteTarget(c)}
            className="p-[4px] rounded text-[color:var(--muted-fg)] hover:text-red-500 hover:bg-surface-hover cursor-pointer"
          >
            <IconTrash />
          </button>
        </div>
      ),
      headerClassName: "w-[80px]",
      skeletonClassName: "",
    },
  ];

  return (
    <div>
      <SectionHeader
        title={t("thietlap.accounts.title")}
        desc={t("thietlap.accounts.desc")}
        icon={<Settings className="h-4 w-4" />}
        onAdd={openNew}
      />
      <div className="mb-3">
        <SearchInput
          placeholder={t("thietlap.accounts.searchPlaceholder")}
          value={searchInput}
          onChange={handleSearchInput}
          className="max-w-[280px]"
        />
      </div>
      <DataTable
        items={items}
        columns={columns}
        getRowKey={(c) => c.id}
        loading={loading}
        error={fetchError}
        emptyLabel={t("common.noData")}
        minWidth={600}
        loadingRows={5}
        page={page}
        pageSize={pageSize}
        total={total}
        totalPages={totalPages}
        onPage={setPage}
        onPageSize={handlePageSize}
      />
      <DrawerModal
        open={drawerOpen}
        onClose={closeDrawer}
        confirmOnClose={isDirty && !editing}
        title={editing ? t("thietlap.accounts.editTitle") : t("thietlap.accounts.createTitle")}
        subtitle={
          editing
            ? `${editing.account_code} — ${editing.account_name}`
            : t("thietlap.common.subtitle")
        }
        actions={[
          { label: t("common.cancel"), onClick: closeDrawer },
          {
            label: editing ? t("common.saveChanges") : t("common.addNew"),
            primary: true,
            loading: saving,
            disabled: saving,
            onClick: handleSave,
          },
        ]}
      >
        <DrawerSection title={t("thietlap.accounts.sectionInfo")}>
          <DrawerField label={t("thietlap.headers.accountCode")} required>
            <input
              type="text"
              className={inputCls}
              value={form.account_code}
              onChange={(e) => setField("account_code", e.target.value)}
              placeholder={t("thietlap.accounts.accountCodePlaceholder")}
            />
          </DrawerField>
          <DrawerField label={t("thietlap.headers.accName")} required>
            <input
              type="text"
              className={inputCls}
              value={form.account_name}
              onChange={(e) => setField("account_name", e.target.value)}
              placeholder={t("thietlap.accounts.accountNamePlaceholder")}
            />
          </DrawerField>
          <DrawerField label={t("thietlap.fields.accType")}>
            <Combobox
              options={accTypeOpts}
              value={form.account_type}
              onChange={(v) => setField("account_type", v || "ASSET")}
              allowClear={false}
            />
          </DrawerField>
          <DrawerField label={t("thietlap.fields.normalBalance")}>
            <Combobox
              options={normalBalanceOpts}
              value={form.normal_balance}
              onChange={(v) => setField("normal_balance", v || "DEBIT")}
              allowClear={false}
            />
          </DrawerField>
          <DrawerField label={t("thietlap.fields.parentAcc")}>
            <Combobox
              options={allItems
                .filter((c) => !editing || c.id !== editing.id)
                .map((c) => ({
                  value: c.id,
                  label: `${c.account_code} — ${c.account_name}`,
                }))}
              value={form.parent_account_id}
              onChange={(v) => setField("parent_account_id", v)}
              placeholder={t("thietlap.accounts.noParentPlaceholder")}
            />
          </DrawerField>
          <DrawerField label={t("thietlap.fields.level")}>
            <input
              type="number"
              min="1"
              className={inputCls}
              value={form.level}
              onChange={(e) => setField("level", e.target.value)}
              placeholder={t("thietlap.accounts.levelPlaceholder")}
            />
          </DrawerField>
          <DrawerField label={t("thietlap.fields.cashAccount")}>
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox
                checked={form.is_cash_account}
                onCheckedChange={(v) => setField("is_cash_account", v === true)}
              />
              <span className="text-xs text-foreground">
                {t("thietlap.accounts.isCashAccount")}
              </span>
            </label>
          </DrawerField>
        </DrawerSection>
        {saveError && (
          <div className="text-xs text-[color:var(--warn-fg)] bg-[color:var(--warn-bg)] border border-[color:var(--warn-fg)]/30 rounded-lg px-3 py-2">
            {saveError}
          </div>
        )}
      </DrawerModal>
      <ConfirmModal
        open={!!deleteTarget}
        title={t("confirmModal.defaultTitle")}
        message={t("thietlap.accounts.deleteMessage").replace("{0}", `${deleteTarget?.account_code ?? ""} — ${deleteTarget?.account_name ?? ""}`)}
        confirmLabel={t("confirmModal.defaultConfirm")}
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function extractApiError(e: any, fallback: string): string {
  return e?.response?.data?.message || e?.message || fallback;
}

// ── Shared components ─────────────────────────────────────────────────────────
function SectionHeader({
  title,
  desc,
  icon,
  onAdd,
}: {
  title: string;
  desc: string;
  icon: React.ReactNode;
  onAdd: () => void;
}) {
  const t = useT();
  return (
    <PageHeader
      title={title}
      desc={desc}
      icon={icon}
      className="mb-4"
      actions={
        <BtnPrimary type="button" onClick={onAdd}>
          <IconPlus /> {t("common.addNew")}
        </BtnPrimary>
      }
    />
  );
}

function TagCell({
  active,
  isDefault,
}: {
  active: boolean;
  isDefault?: boolean;
}) {
  const t = useT();
  return (
    <div className="flex gap-[4px] flex-wrap">
      {isDefault && (
        <span className="text-[10px] px-[7px] py-[2px] rounded-[20px] font-medium bg-[#e8f0fd] text-[#2a6dd9]">
          {t("status.default")}
        </span>
      )}
      <span
        className={`text-[10px] px-[7px] py-[2px] rounded-[20px] font-medium ${active ? "bg-approve-bg text-approve-fg" : "bg-[color:var(--muted)] text-[color:var(--muted-fg)]"}`}
      >
        {active ? t("status.active") : t("status.inactive")}
      </span>
    </div>
  );
}

function ActionCell({
  onDefault,
  onToggle,
  onDelete,
  isDefault,
}: {
  onDefault?: () => void;
  onToggle?: () => void;
  onDelete?: () => void;
  isDefault?: boolean;
}) {
  return (
    <div className="flex gap-[6px] items-center">
      {onDefault && !isDefault && (
        <button
          title="Đặt mặc định"
          onClick={onDefault}
          className="text-[10px] text-[color:var(--muted-fg)] hover:text-foreground cursor-pointer px-[6px] py-[3px] rounded border border-border bg-surface hover:bg-surface-hover"
        >
          Mặc định
        </button>
      )}
      {onToggle && (
        <button
          title="Bật/Tắt"
          onClick={onToggle}
          className="text-[color:var(--muted-fg)] hover:text-foreground cursor-pointer p-[4px] rounded hover:bg-surface-hover"
        >
          <IconToggle />
        </button>
      )}
      {onDelete && (
        <button
          title="Xóa"
          onClick={onDelete}
          className="text-[color:var(--muted-fg)] hover:text-down-fg cursor-pointer p-[4px] rounded hover:bg-surface-hover"
        >
          <IconTrash />
        </button>
      )}
    </div>
  );
}

function FormField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="text-[11px] font-medium text-[color:var(--muted-fg)] block mb-[5px]">
        {label}
      </label>
      {children}
    </div>
  );
}

function Btn({
  children,
  type,
  onClick,
}: {
  children: React.ReactNode;
  type?: "button" | "submit";
  onClick?: () => void;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      className="px-[14px] py-[7px] rounded-lg border border-border bg-surface text-xs font-medium cursor-pointer text-foreground hover:bg-surface-hover whitespace-nowrap"
    >
      {children}
    </button>
  );
}
function BtnPrimary({
  children,
  type,
  onClick,
}: {
  children: React.ReactNode;
  type?: "button" | "submit";
  onClick?: () => void;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      className="px-[14px] py-[7px] rounded-lg border border-primary bg-primary text-primary-fg text-xs font-medium cursor-pointer flex items-center gap-[6px] hover:opacity-90 whitespace-nowrap"
    >
      {children}
    </button>
  );
}

function ErrorBanner({ msg }: { msg: string }) {
  return <div className="text-xs text-[color:var(--warn-fg)] bg-[color:var(--warn-bg)] border border-[color:var(--warn-fg)]/30 rounded-lg px-3 py-2">{msg}</div>;
}

function IconPlus() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}
function IconEdit() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}
function IconToggle() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <rect x="1" y="5" width="22" height="14" rx="7" />
      <circle cx="16" cy="12" r="3" fill="currentColor" />
    </svg>
  );
}
function IconTrash() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  );
}
