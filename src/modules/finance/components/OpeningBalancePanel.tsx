import { useEffect, useState } from "react";
import { extractApiError } from "@/shared/utils/apiError";
import { useT } from "@/core/i18n";
import { ConfirmModal } from "@/shared/components/ConfirmModal";
import {
  createOpeningBalanceApi,
  deleteOpeningBalanceApi,
  getCashFundsApi,
  getOpeningBalancesPagedApi,
  updateOpeningBalanceApi,
  type CashFund,
  type CreateOpeningBalanceDto,
  type OpeningBalance,
} from "@/modules/finance/api/financeApi";
import {
  getChartOfAccountsApi,
  getCompanyBankAccountsApi,
  type ChartOfAccount,
  type CompanyBankAccount,
} from "@/modules/accounting/api/catalogApi";
import { OpeningBalanceDrawer } from "./OpeningBalancePanel/OpeningBalanceDrawer";
import { OpeningBalanceTable } from "./OpeningBalancePanel/OpeningBalanceTable";
import {
  buildForm,
  emptyForm,
  firstDayOfPeriod,
  periodFromDate,
  periodLabel,
  PERIOD_VALUES,
  TODAY,
  type SoDuForm,
} from "./OpeningBalancePanel/helpers";

export function OpeningBalancePanel({ type }: { type: "CASH" | "BANK" }) {
  const t = useT();
  const [coaItems, setCoaItems] = useState<ChartOfAccount[]>([]);
  const [funds, setFunds] = useState<CashFund[]>([]);
  const [bankAccounts, setBankAccounts] = useState<CompanyBankAccount[]>([]);
  const [items, setItems] = useState<OpeningBalance[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<OpeningBalance | null>(null);
  const [form, setForm] = useState<SoDuForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<OpeningBalance | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    Promise.all([
      getChartOfAccountsApi(),
      type === "CASH" ? getCashFundsApi() : Promise.resolve([]),
      type === "BANK" ? getCompanyBankAccountsApi() : Promise.resolve([]),
    ])
      .then(([coa, f, b]) => {
        setCoaItems(coa ?? []);
        setFunds(f ?? []);
        setBankAccounts(b ?? []);
      })
      .catch(() => {});
  }, [type]);
  useEffect(() => {
    loadItems();
  }, [type]);
  useEffect(() => {
    if (type !== "CASH" || !form.account_id) return;
    const selected = coaItems.find((x) => x.id === form.account_id);
    if (selected && !selected.account_code.startsWith("111"))
      setField("account_id", "");
  }, [type, coaItems, form.account_id]);

  async function loadItems() {
    setLoading(true);
    setFetchError(null);
    try {
      const res = await getOpeningBalancesPagedApi({ page: 1, pageSize: 500 });
      setItems(
        res.items.filter((x) =>
          type === "CASH" ? !!x.cash_fund_id : !!x.company_bank_account_id,
        ),
      );
    } catch {
      setFetchError(t("voucher.openingBalance.fetchError"));
    } finally {
      setLoading(false);
    }
  }
  function openNew() {
    setEditing(null);
    setForm({
      ...emptyForm,
      fiscal_period: periodFromDate(TODAY),
      balance_date: TODAY,
    });
    setSaveError(null);
    setDrawerOpen(true);
  }
  function openEdit(item: OpeningBalance) {
    setEditing(item);
    setForm(buildForm(item));
    setSaveError(null);
    setDrawerOpen(true);
  }
  function closeDrawer() {
    setDrawerOpen(false);
    setEditing(null);
    setSaveError(null);
  }
  const setField = <K extends keyof SoDuForm>(k: K, v: SoDuForm[K]) =>
    setForm((f) => ({ ...f, [k]: v }));
  function handleFiscalPeriodChange(period: string) {
    setForm((f) => ({
      ...f,
      fiscal_period: period,
      balance_date:
        period && f.balance_date && periodFromDate(f.balance_date) !== period
          ? firstDayOfPeriod(period)
          : f.balance_date,
    }));
  }
  function handleBalanceDateChange(date: string) {
    setForm((f) => ({
      ...f,
      balance_date: date,
      fiscal_period: date ? periodFromDate(date) : f.fiscal_period,
    }));
  }

  async function handleSave() {
    if (!form.fiscal_period || !form.balance_date || !form.account_id)
      return setSaveError(t("voucher.openingBalance.errRequired"));
    if (type === "CASH" && !form.cash_fund_id)
      return setSaveError(t("voucher.openingBalance.errFundRequired"));
    const selectedAccount = coaItems.find((x) => x.id === form.account_id);
    if (type === "CASH" && !selectedAccount?.account_code.startsWith("111"))
      return setSaveError(t("voucher.openingBalance.errAccPrefix"));
    if (type === "BANK" && !form.company_bank_account_id)
      return setSaveError(t("voucher.openingBalance.errBankRequired"));
    setSaving(true);
    setSaveError(null);
    try {
      const dto: CreateOpeningBalanceDto = {
        fiscal_period: form.fiscal_period,
        balance_date: form.balance_date,
        account_id: form.account_id,
        cash_fund_id:
          type === "CASH" ? form.cash_fund_id || undefined : undefined,
        company_bank_account_id:
          type === "BANK"
            ? form.company_bank_account_id || undefined
            : undefined,
        debit_amount: form.debit_amount
          ? parseFloat(form.debit_amount)
          : undefined,
        credit_amount: form.credit_amount
          ? parseFloat(form.credit_amount)
          : undefined,
        currency: form.currency || "VND",
        note: form.note.trim() || undefined,
      };
      if (editing) await updateOpeningBalanceApi(editing.id, dto);
      else await createOpeningBalanceApi(dto);
      closeDrawer();
      loadItems();
    } catch (e) {
      setSaveError(extractApiError(e));
    } finally {
      setSaving(false);
    }
  }
  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteOpeningBalanceApi(deleteTarget.id);
      setDeleteTarget(null);
      loadItems();
    } catch {
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  }

  const accountingAccountOptions = coaItems
    .filter((c) => type !== "CASH" || c.account_code.startsWith("111"))
    .map((c) => ({
      value: c.id,
      label: `${c.account_code} — ${c.account_name}`,
    }));
  const periodOptions = PERIOD_VALUES.map((v) => ({
    value: v,
    label: periodLabel(v, t),
  }));
  const fiscalPeriodOptions =
    form.fiscal_period && !PERIOD_VALUES.includes(form.fiscal_period)
      ? [
          {
            value: form.fiscal_period,
            label: periodLabel(form.fiscal_period, t),
          },
          ...periodOptions,
        ]
      : periodOptions;
  const isDirty =
    !!form.account_id || !!form.debit_amount || !!form.credit_amount;

  return (
    <>
      <OpeningBalanceTable
        {...{
          t,
          type,
          items,
          loading,
          fetchError,
          coaItems,
          funds,
          bankAccounts,
          onAdd: openNew,
          onEdit: openEdit,
          onDelete: setDeleteTarget,
        }}
      />
      <OpeningBalanceDrawer
        {...{
          t,
          type,
          open: drawerOpen,
          editing,
          form,
          saving,
          saveError,
          isDirty,
          funds,
          bankAccounts,
          accountingAccountOptions,
          fiscalPeriodOptions,
          onClose: closeDrawer,
          onSave: handleSave,
          setField,
          handleFiscalPeriodChange,
          handleBalanceDateChange,
        }}
      />
      <ConfirmModal
        open={!!deleteTarget}
        title={t("voucher.openingBalance.deleteConfirmTitle")}
        message={t("voucher.openingBalance.deleteConfirmDesc")}
        confirmLabel={t("voucher.table.btnDelete")}
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
}
