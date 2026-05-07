import { useEffect, useState } from "react";
import { cn } from "@/shared/utils";
import { extractApiError } from "@/shared/utils/apiError";
import { useT } from "@/core/i18n";
import {
  OpeningBalance,
  CreateOpeningBalanceDto,
  getOpeningBalancesPagedApi,
  createOpeningBalanceApi,
  updateOpeningBalanceApi,
  deleteOpeningBalanceApi,
  CashFund,
  getCashFundsApi,
} from "@/modules/finance/api/financeApi";
import {
  ChartOfAccount,
  getChartOfAccountsApi,
  CompanyBankAccount,
  getCompanyBankAccountsApi,
} from "@/modules/accounting/api/catalogApi";
import { Panel } from "@/shared/components/Panel";
import { Skeleton } from "@/shared/components/Skeleton";
import {
  DrawerModal,
  DrawerSection,
  DrawerField,
  inputCls,
} from "@/shared/components/DrawerModal";
import { ConfirmModal } from "@/shared/components/ConfirmModal";
import { Combobox } from "@/shared/components/Combobox";
import { DatePicker } from "@/shared/components/DatePicker";

// ─── Helpers ──────────────────────────────────────────────────────────────────

interface SoDuForm {
  fiscal_period: string;
  balance_date: string;
  account_id: string;
  cash_fund_id: string;
  company_bank_account_id: string;
  debit_amount: string;
  credit_amount: string;
  currency: string;
  note: string;
}

const emptyForm: SoDuForm = {
  fiscal_period: "",
  balance_date: "",
  account_id: "",
  cash_fund_id: "",
  company_bank_account_id: "",
  debit_amount: "",
  credit_amount: "",
  currency: "VND",
  note: "",
};

const TODAY = new Date().toISOString().split("T")[0];

function periodFromDate(date: string) {
  return date.slice(0, 7);
}

function firstDayOfPeriod(period: string) {
  return `${period}-01`;
}

function periodLabel(period: string, t: any) {
  const [y, m] = period.split("-").map(Number);
  return Number.isFinite(y) && Number.isFinite(m)
    ? t("voucher.openingBalance.monthLabel").replace("{0}", m).replace("{1}", y)
    : period;
}

const PERIOD_VALUES: string[] = (() => {
  const today = new Date();
  return Array.from({ length: 36 }, (_, i) => {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  });
})();

function buildForm(b: OpeningBalance): SoDuForm {
  return {
    fiscal_period: b.fiscal_period,
    balance_date: b.balance_date,
    account_id: b.account_id,
    cash_fund_id: b.cash_fund_id ?? "",
    company_bank_account_id: b.company_bank_account_id ?? "",
    debit_amount: b.debit_amount != null ? String(b.debit_amount) : "",
    credit_amount: b.credit_amount != null ? String(b.credit_amount) : "",
    currency: b.currency ?? "VND",
    note: b.note ?? "",
  };
}

function ErrorBanner({ msg }: { msg: string }) {
  return (
    <div className="text-xs text-[color:var(--warn-fg)] bg-[color:var(--warn-bg)] border border-[color:var(--warn-fg)]/30 rounded-lg px-3 py-2 mt-3">
      {msg}
    </div>
  );
}

function IconEdit() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

function IconTrash() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  );
}

function IconPlus() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

const fmt = (v: number | null) =>
  v != null ? Number(v).toLocaleString("vi-VN") : "0";

// ─── Main Component ────────────────────────────────────────────────────────────

/**
 * Panel hiển thị và quản lý Số dư đầu kỳ.
 * Đặt trực tiếp vào trang TienMat (type="CASH") hoặc TienGui (type="BANK").
 */
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

  // Load dropdowns once
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type]);

  useEffect(() => {
    loadItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type]);

  useEffect(() => {
    if (type !== "CASH" || !form.account_id) return;
    const selected = coaItems.find((x) => x.id === form.account_id);
    if (selected && !selected.account_code.startsWith("111")) {
      setField("account_id", "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, coaItems, form.account_id]);

  async function loadItems() {
    setLoading(true);
    setFetchError(null);
    try {
      const res = await getOpeningBalancesPagedApi({ page: 1, pageSize: 500 });
      // Lọc phía frontend: CASH chỉ lấy bản ghi có cash_fund_id; BANK có company_bank_account_id
      const filtered = res.items.filter((x) =>
        type === "CASH" ? !!x.cash_fund_id : !!x.company_bank_account_id
      );
      setItems(filtered);
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
    if (!form.fiscal_period || !form.balance_date || !form.account_id) {
      setSaveError(t("voucher.openingBalance.errRequired"));
      return;
    }
    if (type === "CASH" && !form.cash_fund_id) {
      setSaveError(t("voucher.openingBalance.errFundRequired"));
      return;
    }
    const selectedAccount = coaItems.find((x) => x.id === form.account_id);
    if (type === "CASH" && !selectedAccount?.account_code.startsWith("111")) {
      setSaveError(t("voucher.openingBalance.errAccPrefix"));
      return;
    }
    if (type === "BANK" && !form.company_bank_account_id) {
      setSaveError(t("voucher.openingBalance.errBankRequired"));
      return;
    }
    setSaving(true);
    setSaveError(null);
    try {
      const dto: CreateOpeningBalanceDto = {
        fiscal_period: form.fiscal_period,
        balance_date: form.balance_date,
        account_id: form.account_id,
        cash_fund_id: type === "CASH" ? form.cash_fund_id || undefined : undefined,
        company_bank_account_id:
          type === "BANK" ? form.company_bank_account_id || undefined : undefined,
        debit_amount: form.debit_amount ? parseFloat(form.debit_amount) : undefined,
        credit_amount: form.credit_amount ? parseFloat(form.credit_amount) : undefined,
        currency: form.currency || "VND",
        note: form.note.trim() || undefined,
      };
      if (editing) {
        await updateOpeningBalanceApi(editing.id, dto);
      } else {
        await createOpeningBalanceApi(dto);
      }
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

  const coaLabel = (id: string) => {
    const c = coaItems.find((x) => x.id === id);
    return c ? `${c.account_code} — ${c.account_name}` : id || "—";
  };

  const isDirty = !!form.account_id || !!form.debit_amount || !!form.credit_amount;

  const label4thCol = type === "CASH" ? "Quỹ" : "Ngân hàng";
  const accountingAccountOptions = coaItems
    .filter((c) => type !== "CASH" || c.account_code.startsWith("111"))
    .map((c) => ({
      value: c.id,
      label: `${c.account_code} — ${c.account_name}`,
    }));
  const fiscalPeriodOptions =
    form.fiscal_period &&
    !PERIOD_VALUES.includes(form.fiscal_period)
      ? [
          {
            value: form.fiscal_period,
            label: periodLabel(form.fiscal_period, t),
          },
          ...PERIOD_VALUES.map((v) => ({
            value: v,
            label: periodLabel(v, t),
          })),
        ]
      : PERIOD_VALUES.map((v) => ({
          value: v,
          label: periodLabel(v, t),
        }));

  return (
    <>
      <Panel
        title={t("voucher.openingBalance.title")}
        extra={
          <button
            onClick={openNew}
            className="flex items-center gap-1 text-[11px] font-medium text-primary hover:opacity-70 transition-opacity cursor-pointer"
          >
            <IconPlus /> {t("voucher.openingBalance.addBtn")}
          </button>
        }
      >
        <div className="overflow-x-auto rounded-[8px] border border-border">
          <table className="w-full border-collapse" style={{ minWidth: 580 }}>
            <thead>
              <tr>
                {[
                  t("voucher.openingBalance.colPeriod"),
                  t("voucher.openingBalance.colDate"),
                  t("voucher.openingBalance.colAcc"),
                  label4thCol,
                  t("voucher.openingBalance.colDebit"),
                  t("voucher.openingBalance.colCredit"),
                  "",
                ].map((h, i) => (
                  <th
                    key={i}
                    className={cn(
                      "text-left text-[11px] font-semibold text-[color:var(--muted-fg)] px-[10px] py-[8px] border-b border-border uppercase tracking-[0.05em]",
                      i === 6 && "w-[60px]",
                      (i === 4 || i === 5) && "text-right",
                    )}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading &&
                Array.from({ length: 2 }).map((_, i) => (
                  <tr key={i}>
                    {[16, 20, 36, 24, 20, 20, 0].map((w, j) => (
                      <td
                        key={j}
                        className="px-[10px] py-[10px] border-b border-[color:var(--border-light)]"
                      >
                        {w > 0 && <Skeleton className={`h-3 w-${w}`} />}
                      </td>
                    ))}
                  </tr>
                ))}
              {!loading && fetchError && (
                <tr>
                  <td
                    colSpan={7}
                    className="text-center text-xs text-[color:var(--warn-fg)] py-6"
                  >
                    {fetchError}
                  </td>
                </tr>
              )}
              {!loading && !fetchError && items.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="text-center text-xs text-[color:var(--faint)] py-6"
                  >
                    {t("voucher.openingBalance.noData")}
                  </td>
                </tr>
              )}
              {items.map((b) => (
                <tr key={b.id} className="hover:bg-surface-hover">
                  <td className="text-xs px-[10px] py-[8px] border-b border-[color:var(--border-light)] font-mono text-[color:var(--muted-fg)]">
                    {b.fiscal_period}
                  </td>
                  <td className="text-xs px-[10px] py-[8px] border-b border-[color:var(--border-light)] text-[color:var(--muted-fg)]">
                    {b.balance_date}
                  </td>
                  <td className="text-xs px-[10px] py-[8px] border-b border-[color:var(--border-light)]">
                    {coaLabel(b.account_id)}
                  </td>
                  <td className="text-xs px-[10px] py-[8px] border-b border-[color:var(--border-light)]">
                    {type === "CASH"
                      ? funds.find((f) => f.id === b.cash_fund_id)?.fund_name ?? "—"
                      : bankAccounts.find((a) => a.id === b.company_bank_account_id)?.bank_name ?? "—"}
                  </td>
                  <td className="text-xs px-[10px] py-[8px] border-b border-[color:var(--border-light)] text-right font-mono text-[color:var(--approve-fg)]">
                    {fmt(b.debit_amount)}
                  </td>
                  <td className="text-xs px-[10px] py-[8px] border-b border-[color:var(--border-light)] text-right font-mono">
                    {fmt(b.credit_amount)}
                  </td>
                  <td className="text-xs px-[10px] py-[8px] border-b border-[color:var(--border-light)]">
                    <div className="flex gap-[5px] justify-end">
                      <button
                        title={t("voucher.table.btnEdit")}
                        onClick={() => openEdit(b)}
                        className="p-[4px] rounded text-[color:var(--muted-fg)] hover:text-foreground hover:bg-surface-hover cursor-pointer"
                      >
                        <IconEdit />
                      </button>
                      <button
                        title={t("voucher.table.btnDelete")}
                        onClick={() => setDeleteTarget(b)}
                        className="p-[4px] rounded text-[color:var(--muted-fg)] hover:text-red-500 hover:bg-surface-hover cursor-pointer"
                      >
                        <IconTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      {/* Create / Edit Drawer */}
      <DrawerModal
        open={drawerOpen}
        onClose={closeDrawer}
        confirmOnClose={isDirty && !editing}
        title={
          editing
            ? t("voucher.openingBalance.editTitle")
            : t("voucher.openingBalance.createTitle")
        }
        subtitle={t("voucher.drawer.subtitleEdit")}
        actions={[
          { label: t("voucher.drawer.cancel"), onClick: closeDrawer },
          {
            label: editing ? t("common.save") : t("common.addNew"),
            primary: true,
            loading: saving,
            disabled: saving,
            onClick: handleSave,
          },
        ]}
      >
        <DrawerSection title={t("voucher.openingBalance.sectionInfo")}>
          <DrawerField label={t("voucher.openingBalance.fieldPeriod")} required>
            <Combobox
              options={fiscalPeriodOptions}
              value={form.fiscal_period}
              onChange={(v) => handleFiscalPeriodChange(v)}
              placeholder={t("voucher.openingBalance.periodPlaceholder")}
              searchPlaceholder={t("voucher.openingBalance.periodSearchPlaceholder")}
            />
          </DrawerField>
          <DrawerField label={t("voucher.openingBalance.fieldDate")} required>
            <DatePicker
              value={form.balance_date}
              onChange={handleBalanceDateChange}
              placeholder={t("voucher.openingBalance.datePlaceholder")}
              className="w-full"
            />
          </DrawerField>
          <DrawerField label={t("voucher.openingBalance.fieldAcc")} required>
            <Combobox
              options={accountingAccountOptions}
              value={form.account_id}
              onChange={(v) => setField("account_id", v)}
              placeholder={
                type === "CASH"
                  ? t("voucher.openingBalance.accPlaceholderCash")
                  : t("voucher.openingBalance.accPlaceholder")
              }
            />
          </DrawerField>
 
          {type === "CASH" && (
            <DrawerField label={t("voucher.drawer.cashFund")} required>
              <Combobox
                options={funds.map((f) => ({
                  value: f.id,
                  label: `${f.fund_code} — ${f.fund_name}`,
                }))}
                value={form.cash_fund_id}
                onChange={(v) => setField("cash_fund_id", v)}
                placeholder={t("voucher.drawer.cashFundPlaceholder")}
              />
            </DrawerField>
          )}
 
          {type === "BANK" && (
            <DrawerField label={t("voucher.drawer.bankAccount")} required>
              <Combobox
                options={bankAccounts.map((b) => ({
                  value: b.id,
                  label: `${b.bank_name} — ${b.account_number}`,
                }))}
                value={form.company_bank_account_id}
                onChange={(v) => setField("company_bank_account_id", v)}
                placeholder={t("voucher.drawer.bankAccountPlaceholder")}
              />
            </DrawerField>
          )}
 
          <DrawerField label={t("voucher.openingBalance.fieldDebit")}>
            <input
              type="number"
              min="0"
              className={inputCls}
              value={form.debit_amount}
              onChange={(e) => setField("debit_amount", e.target.value)}
              placeholder="0"
            />
          </DrawerField>
          <DrawerField label={t("voucher.openingBalance.fieldCredit")}>
            <input
              type="number"
              min="0"
              className={inputCls}
              value={form.credit_amount}
              onChange={(e) => setField("credit_amount", e.target.value)}
              placeholder="0"
            />
          </DrawerField>
          <DrawerField label={t("voucher.openingBalance.fieldCurrency")}>
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
          <DrawerField label={t("voucher.openingBalance.fieldNote")}>
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
