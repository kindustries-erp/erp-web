import { useState, useEffect } from "react";
import { Landmark } from "lucide-react";
import { useT } from "@/core/i18n";
import {
  DrawerModal,
  DrawerSection,
  DrawerField,
  inputCls,
} from "@/shared/components/DrawerModal";
import { ConfirmModal } from "@/shared/components/ConfirmModal";
import { Combobox } from "@/shared/components/Combobox";
import { DataTable, type DataTableColumn } from "@/shared/components/DataTable";
import {
  getCompanyBankAccountsPagedApi,
  createCompanyBankAccountApi,
  updateCompanyBankAccountApi,
  deleteCompanyBankAccountApi,
  getChartOfAccountsApi,
  type CompanyBankAccount,
  type CreateCompanyBankAccountDto,
  type ChartOfAccount,
} from "@/modules/accounting/api/catalogApi";
import {
  SectionHeader,
  ErrorBanner,
  IconEdit,
  IconTrash,
} from "./shared";


interface BankForm {
  bank_account_code: string;
  bank_name: string;
  account_number: string;
  account_holder: string;
  accounting_account_id: string;
  currency: string;
  branch_id: string;
}
const emptyBankForm: BankForm = {
  bank_account_code: "",
  bank_name: "",
  account_number: "",
  account_holder: "",
  accounting_account_id: "",
  currency: "VND",
  branch_id: "",
};
function buildBankForm(b: CompanyBankAccount): BankForm {
  return {
    bank_account_code: b.bank_account_code ?? "",
    bank_name: b.bank_name,
    account_number: b.account_number,
    account_holder: b.account_holder,
    accounting_account_id: b.accounting_account_id ?? "",
    currency: b.currency ?? "VND",
    branch_id: b.branch_id ?? "",
  };
}

export function NHTab() {
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
  const [deleteTarget, setDeleteTarget] = useState<CompanyBankAccount | null>(null);
  const [deleting, setDeleting] = useState(false);
  const t = useT();

  useEffect(() => {
    getChartOfAccountsApi().then(setCoaItems).catch(() => {});
  }, []);

  useEffect(() => {
    loadItems(page, pageSize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize]);

  async function loadItems(pg: number, ps: number) {
    setLoading(true);
    setFetchError(null);
    try {
      const res = await getCompanyBankAccountsPagedApi({ page: pg, pageSize: ps });
      setItems(res.items);
      setTotal(res.total);
      setTotalPages(res.totalPages);
    } catch {
      setFetchError(t("settings.nh.fetchError"));
    } finally {
      setLoading(false);
    }
  }

  function handlePageSize(ps: number) { setPageSize(ps); setPage(1); }
  function openNew() { setEditing(null); setForm(emptyBankForm); setSaveError(null); setDrawerOpen(true); }
  function openEdit(item: CompanyBankAccount) { setEditing(item); setForm(buildBankForm(item)); setSaveError(null); setDrawerOpen(true); }
  function closeDrawer() { setDrawerOpen(false); setEditing(null); setSaveError(null); }
  const setField = <K extends keyof BankForm>(k: K, v: BankForm[K]) => setForm((f) => ({ ...f, [k]: v }));

  async function handleSave() {
    if (!form.bank_name.trim() || !form.account_number.trim() || !form.account_holder.trim()) {
      setSaveError(t("settings.nh.requiredError"));
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
        accounting_account_id: form.accounting_account_id || "",
        currency: form.currency || "VND",
        branch_id: form.branch_id || undefined,
      };
      if (editing) {
        await updateCompanyBankAccountApi(editing.id, dto);
      } else {
        await createCompanyBankAccountApi(dto);
      }
      closeDrawer();
      if (!editing && page !== 1) setPage(1);
      else loadItems(page, pageSize);
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } }; message?: string };
      setSaveError(err?.response?.data?.message || err?.message || t("settings.tk.unknownError"));
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
      else loadItems(page, pageSize);
    } catch {
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  }

  const isDirty = !!form.bank_name.trim() || !!form.account_number.trim();
  const columns: DataTableColumn<CompanyBankAccount>[] = [
    { key: "bank_account_code", header: t("settings.nh.headers.bankAccountCode"), cell: (b) => b.bank_account_code || "—", className: "font-mono text-[color:var(--muted-fg)]", skeletonClassName: "w-16" },
    { key: "bank_name", header: t("settings.nh.headers.bankName"), cell: (b) => b.bank_name, className: "font-medium", skeletonClassName: "w-32" },
    { key: "account_number", header: t("settings.nh.headers.accountNumber"), cell: (b) => b.account_number, skeletonClassName: "w-28" },
    { key: "account_holder", header: t("settings.nh.headers.accountHolder"), cell: (b) => b.account_holder, skeletonClassName: "w-28" },
    { key: "accounting_account_id", header: t("settings.tk.headers.accountingAccount"), cell: (b) => coaItems.find((c) => c.id === b.accounting_account_id)?.account_code || "—", skeletonClassName: "w-20" },
    { key: "currency", header: t("settings.tk.headers.currency"), cell: (b) => b.currency, className: "text-[color:var(--muted-fg)]", skeletonClassName: "w-12" },
    {
      key: "actions", header: "", headerClassName: "w-[80px]", skeletonClassName: "",
      cell: (b) => (
        <div className="flex gap-[5px] justify-end">
          <button title={t("common.edit")} onClick={() => openEdit(b)} className="p-[4px] rounded text-[color:var(--muted-fg)] hover:text-foreground hover:bg-surface-hover cursor-pointer"><IconEdit /></button>
          <button title={t("common.delete")} onClick={() => setDeleteTarget(b)} className="p-[4px] rounded text-[color:var(--muted-fg)] hover:text-red-500 hover:bg-surface-hover cursor-pointer"><IconTrash /></button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <SectionHeader title={t("settings.nh.title")} desc={t("settings.nh.desc")} icon={<Landmark className="h-4 w-4" />} onAdd={openNew} />
      <DataTable items={items} columns={columns} getRowKey={(b) => b.id} loading={loading} error={fetchError} emptyLabel={t("common.noData")} minWidth={750} loadingRows={4} page={page} pageSize={pageSize} total={total} totalPages={totalPages} onPage={setPage} onPageSize={handlePageSize} />

      <DrawerModal
        open={drawerOpen}
        onClose={closeDrawer}
        confirmOnClose={isDirty && !editing}
        title={editing ? t("settings.nh.editTitle") : t("settings.nh.createTitle")}
        subtitle={editing ? editing.bank_name : t("settings.nh.subtitle")}
        actions={[
          { label: t("common.cancel"), onClick: closeDrawer },
          { label: editing ? t("common.saveChanges") : t("common.addNew"), primary: true, loading: saving, disabled: saving, onClick: handleSave },
        ]}
      >
        <DrawerSection title={t("settings.nh.sectionInfo")}>
          <DrawerField label={t("settings.nh.headers.bankAccountCode")}>
            <input type="text" className={inputCls} value={form.bank_account_code} onChange={(e) => setField("bank_account_code", e.target.value)} placeholder={t("settings.nh.codePlaceholder")} />
          </DrawerField>
          <DrawerField label={t("settings.nh.headers.bankName")} required>
            <input type="text" className={inputCls} value={form.bank_name} onChange={(e) => setField("bank_name", e.target.value)} placeholder={t("settings.nh.bankNamePlaceholder")} />
          </DrawerField>
          <DrawerField label={t("settings.nh.headers.accountNumber")} required>
            <input type="text" className={inputCls} value={form.account_number} onChange={(e) => setField("account_number", e.target.value)} placeholder={t("settings.nh.accountNumberPlaceholder")} />
          </DrawerField>
          <DrawerField label={t("settings.nh.headers.accountHolder")} required>
            <input type="text" className={inputCls} value={form.account_holder} onChange={(e) => setField("account_holder", e.target.value)} placeholder={t("settings.nh.accountHolderPlaceholder")} />
          </DrawerField>
          <DrawerField label={t("settings.tk.headers.accountingAccount")}>
            <Combobox options={coaItems.map((c) => ({ value: c.id, label: `${c.account_code} — ${c.account_name}` }))} value={form.accounting_account_id} onChange={(v) => setField("accounting_account_id", v)} placeholder={t("common.selectAccount")} />
          </DrawerField>
          <DrawerField label={t("settings.tk.headers.currency")}>
            <Combobox options={[{ value: "VND", label: "VND" }, { value: "USD", label: "USD" }]} value={form.currency} onChange={(v) => setField("currency", v || "VND")} allowClear={false} />
          </DrawerField>
        </DrawerSection>
        {saveError && <ErrorBanner msg={saveError} />}
      </DrawerModal>

      <ConfirmModal
        open={!!deleteTarget}
        title={t("confirmModal.defaultTitle")}
        message={t("settings.nh.deleteMessage").replace("{0}", deleteTarget?.bank_name ?? "")}
        confirmLabel={t("confirmModal.defaultConfirm")}
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
