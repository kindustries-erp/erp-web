import { useState, useEffect } from "react";
import { Wallet } from "lucide-react";
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
import { Checkbox } from "@/shared/components/ui/checkbox";
import {
  getCashFundsPagedApi,
  createCashFundApi,
  updateCashFundApi,
  deleteCashFundApi,
  type CashFund,
  type CreateCashFundDto,
} from "@/modules/finance/api/financeApi";
import { getBranchOptionsApi } from "@/modules/branches/api/branchApi";
import {
  getChartOfAccountsApi,
  type ChartOfAccount,
} from "@/modules/accounting/api/catalogApi";
import {
  SectionHeader,
  TagCell,
  ErrorBanner,
  IconEdit,
  IconTrash,
  extractApiError,
} from "./shared";

interface QuyForm {
  fund_code: string;
  fund_name: string;
  accounting_account_id: string;
  currency: string;
  branch_id: string;
  is_active: boolean;
  note: string;
}
const emptyQuyForm: QuyForm = {
  fund_code: "",
  fund_name: "",
  accounting_account_id: "",
  currency: "VND",
  branch_id: "",
  is_active: true,
  note: "",
};
function buildQuyForm(f: CashFund): QuyForm {
  return {
    fund_code: f.fund_code,
    fund_name: f.fund_name,
    accounting_account_id: f.accounting_account_id ?? "",
    currency: f.currency ?? "VND",
    branch_id: f.branch_id ?? "",
    is_active: f.is_active,
    note: f.note ?? "",
  };
}

export function QuyTab() {
  const [items, setItems] = useState<CashFund[]>([]);
  const [coaItems, setCoaItems] = useState<ChartOfAccount[]>([]);
  const [branchOptions, setBranchOptions] = useState<
    Array<{ value: string; label: string }>
  >([]);
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
    getChartOfAccountsApi()
      .then(setCoaItems)
      .catch(() => {});
    getBranchOptionsApi()
      .then(setBranchOptions)
      .catch(() => {});
  }, []);

  useEffect(() => {
    loadFunds(page, pageSize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      setFetchError(t("settings.quy.fetchError"));
    } finally {
      setLoading(false);
    }
  }

  function handlePageSize(ps: number) {
    setPageSize(ps);
    setPage(1);
  }
  function openNew() {
    setEditing(null);
    setForm(emptyQuyForm);
    setSaveError(null);
    setDrawerOpen(true);
  }
  function openEdit(item: CashFund) {
    setEditing(item);
    setForm(buildQuyForm(item));
    setSaveError(null);
    setDrawerOpen(true);
  }
  function closeDrawer() {
    setDrawerOpen(false);
    setEditing(null);
    setSaveError(null);
  }
  const setField = <K extends keyof QuyForm>(k: K, v: QuyForm[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  async function handleSave() {
    if (
      !form.fund_code.trim() ||
      !form.fund_name.trim() ||
      !form.accounting_account_id
    ) {
      setSaveError(t("settings.quy.requiredError"));
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
        branch_id: form.branch_id || null,
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
    } catch (e: unknown) {
      setSaveError(extractApiError(e, t("settings.tk.unknownError")));
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
      header: t("settings.quy.headers.fundCode"),
      cell: (q) => q.fund_code,
      className: "font-mono text-[color:var(--muted-fg)]",
      skeletonClassName: "w-16",
    },
    {
      key: "fund_name",
      header: t("settings.quy.headers.fundName"),
      cell: (q) => q.fund_name,
      className: "font-medium",
      skeletonClassName: "w-32",
    },
    {
      key: "accounting_account_id",
      header: t("settings.tk.headers.accountingAccount"),
      cell: (q) =>
        coaItems.find((c) => c.id === q.accounting_account_id)?.account_code ||
        "—",
      skeletonClassName: "w-28",
    },
    {
      key: "currency",
      header: t("settings.tk.headers.currency"),
      cell: (q) => q.currency,
      className: "text-[color:var(--muted-fg)]",
      skeletonClassName: "w-12",
    },
    {
      key: "status",
      header: t("settings.tk.headers.status"),
      cell: (q) => <TagCell active={q.is_active} isDefault={false} />,
      skeletonClassName: "w-16",
    },
    {
      key: "actions",
      header: "",
      headerClassName: "w-[80px]",
      skeletonClassName: "",
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
    },
  ];

  return (
    <div>
      <SectionHeader
        title={t("settings.quy.title")}
        desc={t("settings.quy.desc")}
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
        title={
          editing ? t("settings.quy.editTitle") : t("settings.quy.createTitle")
        }
        subtitle={editing ? editing.fund_name : t("settings.quy.subtitle")}
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
        <DrawerSection title={t("settings.quy.sectionInfo")}>
          <DrawerField label={t("settings.quy.headers.fundCode")} required>
            <input
              type="text"
              className={inputCls}
              value={form.fund_code}
              onChange={(e) => setField("fund_code", e.target.value)}
              placeholder={t("settings.quy.codePlaceholder")}
            />
          </DrawerField>
          <DrawerField label={t("settings.quy.headers.fundName")} required>
            <input
              type="text"
              className={inputCls}
              value={form.fund_name}
              onChange={(e) => setField("fund_name", e.target.value)}
              placeholder={t("settings.quy.namePlaceholder")}
            />
          </DrawerField>
          <DrawerField
            label={t("settings.tk.headers.accountingAccount")}
            required
          >
            <Combobox
              options={coaItems.map((c) => ({
                value: c.id,
                label: `${c.account_code} — ${c.account_name}`,
              }))}
              value={form.accounting_account_id}
              onChange={(v) => setField("accounting_account_id", v)}
              placeholder={t("common.selectAccount")}
            />
          </DrawerField>
          <DrawerField label="Chi nhánh">
            <Combobox
              options={branchOptions}
              value={form.branch_id}
              onChange={(v) => setField("branch_id", v)}
              placeholder="Tất cả chi nhánh"
              allowClear={true}
            />
          </DrawerField>
          <DrawerField label={t("settings.tk.headers.currency")}>
            <Combobox
              options={[
                { value: "VND", label: "VND" },
                { value: "USD", label: "USD" },
              ]}
              value={form.currency}
              onChange={(v) => setField("currency", v || "VND")}
              allowClear={false}
            />
          </DrawerField>
          <DrawerField label={t("settings.tk.headers.status")}>
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox
                checked={form.is_active}
                onCheckedChange={(v) => setField("is_active", v === true)}
              />
              <span className="text-xs text-foreground">
                {t("common.active")}
              </span>
            </label>
          </DrawerField>
          <DrawerField label={t("common.note")}>
            <textarea
              className={inputCls}
              rows={2}
              value={form.note}
              onChange={(e) => setField("note", e.target.value)}
            />
          </DrawerField>
        </DrawerSection>
        {saveError && <ErrorBanner msg={saveError} />}
      </DrawerModal>

      <ConfirmModal
        open={!!deleteTarget}
        title={t("confirmModal.defaultTitle")}
        message={t("settings.quy.deleteMessage").replace(
          "{0}",
          deleteTarget?.fund_name ?? "",
        )}
        confirmLabel={t("confirmModal.defaultConfirm")}
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
