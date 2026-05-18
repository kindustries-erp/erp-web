import {
  DrawerModal,
  DrawerSection,
  DrawerField,
  inputCls,
} from "@/shared/components/DrawerModal";
import { Combobox } from "@/shared/components/Combobox";
import { DatePicker } from "@/shared/components/DatePicker";
import type {
  CashFund,
  OpeningBalance,
} from "@/modules/finance/api/financeApi";
import type { CompanyBankAccount } from "@/modules/accounting/api/catalogApi";
import { ErrorBanner, type SoDuForm } from "./helpers";

export function OpeningBalanceDrawer(props: any) {
  const {
    t,
    type,
    open,
    editing,
    form,
    saving,
    saveError,
    isDirty,
    funds,
    bankAccounts,
    accountingAccountOptions,
    fiscalPeriodOptions,
    onClose,
    onSave,
    setField,
    handleFiscalPeriodChange,
    handleBalanceDateChange,
  } = props as {
    t: any;
    type: "CASH" | "BANK";
    open: boolean;
    editing: OpeningBalance | null;
    form: SoDuForm;
    saving: boolean;
    saveError: string | null;
    isDirty: boolean;
    funds: CashFund[];
    bankAccounts: CompanyBankAccount[];
    accountingAccountOptions: { value: string; label: string }[];
    fiscalPeriodOptions: { value: string; label: string }[];
    onClose: () => void;
    onSave: () => void;
    setField: <K extends keyof SoDuForm>(k: K, v: SoDuForm[K]) => void;
    handleFiscalPeriodChange: (p: string) => void;
    handleBalanceDateChange: (d: string) => void;
  };
  return (
    <DrawerModal
      open={open}
      onClose={onClose}
      confirmOnClose={isDirty && !editing}
      title={
        editing
          ? t("voucher.openingBalance.editTitle")
          : t("voucher.openingBalance.createTitle")
      }
      subtitle={t("voucher.drawer.subtitleEdit")}
      actions={[
        { label: t("voucher.drawer.cancel"), onClick: onClose },
        {
          label: editing ? t("common.save") : t("common.addNew"),
          primary: true,
          loading: saving,
          disabled: saving,
          onClick: onSave,
        },
      ]}
    >
      <DrawerSection title={t("voucher.openingBalance.sectionInfo")}>
        <DrawerField label={t("voucher.openingBalance.fieldPeriod")} required>
          <Combobox
            options={fiscalPeriodOptions}
            value={form.fiscal_period}
            onChange={handleFiscalPeriodChange}
            placeholder={t("voucher.openingBalance.periodPlaceholder")}
            searchPlaceholder={t(
              "voucher.openingBalance.periodSearchPlaceholder",
            )}
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
  );
}
