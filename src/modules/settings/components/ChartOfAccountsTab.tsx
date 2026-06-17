import { useState, useEffect, useRef, useMemo } from "react";
import { Pencil, Trash2, Plus, Settings2 } from "lucide-react";
import { useT } from "@/core/i18n";
import {
  DrawerModal,
  DrawerSection,
  DrawerField,
  inputCls,
} from "@/shared/components/DrawerModal";
import { ConfirmModal } from "@/shared/components/ConfirmModal";
import { Combobox } from "@/shared/components/Combobox";
import { FilterPanel, FilterButton } from "@/shared/components/FilterPanel";
import { useFilterPanel } from "@/shared/hooks/useFilterPanel";
import { PageLayout } from "@/shared/components/PageLayout";
import { DataTable, type DataTableColumn } from "@/shared/components/DataTable";
import {
  ActionDropdown,
  type ActionItem,
} from "@/shared/components/ActionDropdown";
import { Checkbox } from "@/shared/components/ui/checkbox";
import {
  getChartOfAccountsPagedApi,
  createChartOfAccountApi,
  updateChartOfAccountApi,
  deleteChartOfAccountApi,
  getChartOfAccountsApi,
  type ChartOfAccount,
  type CreateChartOfAccountDto,
} from "@/modules/accounting/api/catalogApi";
import { TagCell, ErrorBanner, extractApiError, BtnPrimary } from "./shared";

const ACC_TYPES = [
  { value: "asset", label: "Tài sản" },
  { value: "liability", label: "Nợ phải trả" },
  { value: "equity", label: "Vốn chủ sở hữu" },
  { value: "revenue", label: "Doanh thu" },
  { value: "expense", label: "Chi phí" },
  { value: "other", label: "Khác" },
];
const NORMAL_BALANCE_OPTS = [
  { value: "debit", label: "Nợ (Debit)" },
  { value: "credit", label: "Có (Credit)" },
];

interface CoaForm {
  account_code: string;
  account_name: string;
  account_type: string;
  normal_balance: string;
  parent_account_id: string;
  level: string;
  is_cash_account: boolean;
  is_receivable_account: boolean;
  is_payable_account: boolean;
}
const emptyCoaForm: CoaForm = {
  account_code: "",
  account_name: "",
  account_type: "asset",
  normal_balance: "debit",
  parent_account_id: "",
  level: "1",
  is_cash_account: false,
  is_receivable_account: false,
  is_payable_account: false,
};
function buildCoaForm(c: ChartOfAccount): CoaForm {
  return {
    account_code: c.account_code,
    account_name: c.account_name,
    account_type: c.account_type ?? "asset",
    normal_balance: c.normal_balance ?? "debit",
    parent_account_id: c.parent_account_id ?? "",
    level: String(c.level ?? 1),
    is_cash_account: c.is_cash_account ?? false,
    is_receivable_account: c.is_receivable_account ?? false,
    is_payable_account: c.is_payable_account ?? false,
  };
}

export function TKTab({
  activeTab,
  onTabChange,
}: {
  activeTab?: string;
  onTabChange?: (v: string) => void;
}) {
  const [items, setItems] = useState<ChartOfAccount[]>([]);
  const [allItems, setAllItems] = useState<ChartOfAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [search, setSearch] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<ChartOfAccount | null>(null);
  const [form, setForm] = useState<CoaForm>(emptyCoaForm);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ChartOfAccount | null>(null);
  const [deleting, setDeleting] = useState(false);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const t = useT();

  const filterConfig = useMemo(() => ({ search: true }), []);
  const filterPanel = useFilterPanel(filterConfig, () => setPage(1));

  useEffect(() => {
    if (search !== (filterPanel.state.search || "")) {
      setSearch(filterPanel.state.search || "");
      if (searchTimer.current) clearTimeout(searchTimer.current);
      searchTimer.current = setTimeout(() => {
        setPage(1);
        loadItems(1, pageSize, filterPanel.state.search || "");
      }, 400);
    }
  }, [filterPanel.state.search, search, pageSize]);

  useEffect(() => {
    getChartOfAccountsApi()
      .then(setAllItems)
      .catch(() => {});
  }, []);

  useEffect(() => {
    loadItems(page, pageSize, search);
  }, [page, pageSize]);

  async function loadItems(pg: number, ps: number, q: string) {
    setLoading(true);
    setFetchError(null);
    try {
      const res = await getChartOfAccountsPagedApi({
        page: pg,
        pageSize: ps,
        search: q || undefined,
      });
      setItems(res.items);
      setTotal(res.total);
      setTotalPages(res.totalPages);
    } catch {
      setFetchError(t("settings.tk.fetchError"));
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
      setSaveError(t("settings.tk.requiredError"));
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
        parent_account_id: form.parent_account_id || null,
        level: parseInt(form.level, 10) || 1,
        is_cash_account: form.is_cash_account,
      };
      if (editing) {
        await updateChartOfAccountApi(editing.id, dto);
      } else {
        await createChartOfAccountApi(dto);
      }
      getChartOfAccountsApi()
        .then(setAllItems)
        .catch(() => {});
      closeDrawer();
      if (!editing && page !== 1) setPage(1);
      else loadItems(page, pageSize, search);
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
      await deleteChartOfAccountApi(deleteTarget.id);
      setDeleteTarget(null);
      if (items.length === 1 && page > 1) setPage(page - 1);
      else loadItems(page, pageSize, search);
    } catch {
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  }

  const isDirty = !!form.account_code.trim() || !!form.account_name.trim();
  const columns: DataTableColumn<ChartOfAccount>[] = [
    {
      key: "account_code",
      header: t("settings.tk.headers.accountCode"),
      cell: (c) => c.account_code,
      className: "font-mono text-[color:var(--muted-fg)]",
      skeletonClassName: "w-16",
    },
    {
      key: "account_name",
      header: t("settings.tk.headers.accountName"),
      cell: (c) => c.account_name,
      className: "font-medium",
      skeletonClassName: "w-40",
    },
    {
      key: "account_type",
      header: t("settings.tk.headers.accountType"),
      cell: (c) =>
        ACC_TYPES.find((a) => a.value === c.account_type)?.label ??
        c.account_type,
      skeletonClassName: "w-24",
    },
    {
      key: "normal_balance",
      header: t("settings.tk.headers.normalBalance"),
      cell: (c) =>
        NORMAL_BALANCE_OPTS.find((o) => o.value === c.normal_balance)?.label ??
        c.normal_balance ??
        "—",
      className: "text-[color:var(--muted-fg)]",
      skeletonClassName: "w-20",
    },
    {
      key: "level",
      header: t("settings.tk.headers.level"),
      cell: (c) => String(c.level ?? "—"),
      className: "text-center",
      skeletonClassName: "w-8",
    },
    {
      key: "is_cash_account",
      header: t("settings.tk.headers.cashAccount"),
      cell: (c) => <TagCell active={!!c.is_cash_account} />,
      skeletonClassName: "w-16",
    },
  ];

  return (
    <PageLayout
      title="Thiết lập kế toán"
      desc="Danh mục tài khoản và cấu hình hạch toán tự động"
      icon={<Settings2 className="w-5 h-5" />}
      tabs={[
        { value: "chart-of-accounts", label: "Danh mục tài khoản" },
        { value: "accounting-config", label: "Cấu hình hạch toán" },
      ]}
      activeTab={activeTab || "chart-of-accounts"}
      onTabChange={onTabChange}
      actions={
        <div className="flex items-center gap-2">
          <FilterButton
            activeCount={filterPanel.activeFilterCount}
            onClick={filterPanel.togglePanel}
          />
          <BtnPrimary type="button" onClick={openNew}>
            <Plus className="w-4 h-4" /> {t("common.addNew")}
          </BtnPrimary>
        </div>
      }
    >
      <div className="flex items-start">
        <div className="flex-1 min-w-0">
          <DataTable
            items={items}
            columns={columns}
            getRowKey={(c) => c.id}
            loading={loading}
            error={fetchError}
            emptyLabel={t("common.noData")}
            minWidth={700}
            loadingRows={4}
            actionsColumn={{
              cell: (c) => {
                const actionItems: ActionItem[] = [
                  {
                    label: t("common.edit"),
                    onClick: () => openEdit(c),
                    icon: <Pencil size={14} />,
                  },
                  {
                    label: t("common.delete"),
                    onClick: () => setDeleteTarget(c),
                    icon: <Trash2 size={14} />,
                    variant: "danger",
                  },
                ];
                return <ActionDropdown items={actionItems} />;
              },
            }}
            page={page}
            pageSize={pageSize}
            total={total}
            totalPages={totalPages}
            onPage={setPage}
            onPageSize={handlePageSize}
          />
        </div>
        <FilterPanel config={filterConfig} filter={filterPanel} />
      </div>

      <DrawerModal
        open={drawerOpen}
        onClose={closeDrawer}
        confirmOnClose={isDirty && !editing}
        title={
          editing ? t("settings.tk.editTitle") : t("settings.tk.createTitle")
        }
        subtitle={editing ? editing.account_name : t("settings.tk.subtitle")}
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
        <DrawerSection title={t("settings.tk.sectionInfo")}>
          <DrawerField label={t("settings.tk.headers.accountCode")} required>
            <input
              type="text"
              className={inputCls}
              value={form.account_code}
              onChange={(e) => setField("account_code", e.target.value)}
              placeholder={t("settings.tk.codePlaceholder")}
            />
          </DrawerField>
          <DrawerField label={t("settings.tk.headers.accountName")} required>
            <input
              type="text"
              className={inputCls}
              value={form.account_name}
              onChange={(e) => setField("account_name", e.target.value)}
              placeholder={t("settings.tk.namePlaceholder")}
            />
          </DrawerField>
          <DrawerField label={t("settings.tk.headers.accountType")}>
            <Combobox
              options={ACC_TYPES}
              value={form.account_type}
              onChange={(v) => setField("account_type", v || "asset")}
              allowClear={false}
            />
          </DrawerField>
          <DrawerField label={t("settings.tk.headers.normalBalance")}>
            <Combobox
              options={NORMAL_BALANCE_OPTS}
              value={form.normal_balance}
              onChange={(v) => setField("normal_balance", v || "debit")}
              allowClear={false}
            />
          </DrawerField>
          <DrawerField label={t("settings.tk.headers.parentAccount")}>
            <Combobox
              options={allItems
                .filter((c) => !editing || c.id !== editing.id)
                .map((c) => ({
                  value: c.id,
                  label: `${c.account_code} — ${c.account_name}`,
                }))}
              value={form.parent_account_id}
              onChange={(v) => setField("parent_account_id", v)}
              placeholder={t("settings.tk.parentPlaceholder")}
            />
          </DrawerField>
          <DrawerField label={t("settings.tk.headers.level")}>
            <input
              type="number"
              min={1}
              max={9}
              className={inputCls}
              value={form.level}
              onChange={(e) => setField("level", e.target.value)}
            />
          </DrawerField>
        </DrawerSection>
        <DrawerSection title={t("settings.tk.sectionFlags")}>
          {(
            [
              ["is_cash_account", t("settings.tk.isCashAccount")],
              ["is_receivable_account", t("settings.tk.isReceivable")],
              ["is_payable_account", t("settings.tk.isPayable")],
            ] as [keyof CoaForm, string][]
          ).map(([key, label]) => (
            <DrawerField key={key} label={label}>
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={form[key] as boolean}
                  onCheckedChange={(v) => setField(key, v === true)}
                />
                <span className="text-xs text-foreground">{label}</span>
              </label>
            </DrawerField>
          ))}
        </DrawerSection>
        {saveError && <ErrorBanner msg={saveError} />}
      </DrawerModal>

      <ConfirmModal
        open={!!deleteTarget}
        title={t("confirmModal.defaultTitle")}
        message={t("settings.tk.deleteMessage").replace(
          "{0}",
          deleteTarget?.account_name ?? "",
        )}
        confirmLabel={t("confirmModal.defaultConfirm")}
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </PageLayout>
  );
}
