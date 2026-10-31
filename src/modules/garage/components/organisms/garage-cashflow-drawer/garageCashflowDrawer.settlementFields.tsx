import React from "react";
import type { V2FormFieldConfig } from "@/v2/shared/components/molecules/v2-form-grid";
import { GarageCashflowFieldKey } from "./garageCashflowDrawer.enum";
import { ErpBankTransactionCombobox } from "../erp-bank-transaction-combobox";
import { ErpCashVoucherCombobox } from "../erp-cash-voucher-combobox";
import type {
  CreateGarageCashflowVoucherDto,
  GarageCashflowVoucher,
} from "../../../api/garageCashflowApi";

export interface SettlementFieldContext {
  voucher: GarageCashflowVoucher | null;
  t: (key: string, fallback?: string) => string;
}

export function buildSettlementFieldConfigs(
  ctx: SettlementFieldContext,
): V2FormFieldConfig<Partial<CreateGarageCashflowVoucherDto>>[] {
  const { voucher, t } = ctx;

  const bankFallback =
    voucher?.erpBankTransaction?.referenceNumber ||
    voucher?.erpBankTransaction?.seqNo ||
    voucher?.erpBankTransaction?.id ||
    voucher?.erpBankTransactionId ||
    "";

  const cashFallback =
    voucher?.erpCashVoucher?.referenceNumber ||
    voucher?.erpCashVoucher?.seqNo ||
    voucher?.erpCashVoucher?.id ||
    voucher?.erpCashVoucherId ||
    "";

  return [
    {
      name: GarageCashflowFieldKey.ERP_BANK_TRANSACTION_ID,
      label: t("garage:cashflowDrawer.erpBankRef", "Tham chiếu ERP Bank"),
      renderView: () => bankFallback || "—",
      renderEdit: (_p, onChange, values) => (
        <ErpBankTransactionCombobox
          value={values.erpBankTransactionId || ""}
          onChange={onChange}
          fallbackLabel={bankFallback || undefined}
        />
      ),
    },
    {
      name: GarageCashflowFieldKey.ERP_CASH_VOUCHER_ID,
      label: t("garage:cashflowDrawer.erpCashRef", "Tham chiếu ERP Cash"),
      renderView: () => cashFallback || "—",
      renderEdit: (_p, onChange, values) => (
        <ErpCashVoucherCombobox
          value={values.erpCashVoucherId || ""}
          onChange={onChange}
          fallbackLabel={cashFallback || undefined}
        />
      ),
    },
  ];
}
