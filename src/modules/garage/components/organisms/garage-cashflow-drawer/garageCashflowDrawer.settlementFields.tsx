import React from "react";
import { V2FormFieldType } from "@/v2/shared/components/molecules/v2-form-field";
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

  const payerLabels: Record<string, string> = {
    KH: t("garage:cashflowDrawer.payerTypeKH", "Khách hàng"),
    BH: t("garage:cashflowDrawer.payerTypeBH", "Bảo hiểm"),
  };

  return [
    {
      name: GarageCashflowFieldKey.PAYER_TYPE,
      label: t("garage:cashflowDrawer.payerType", "Bên thanh toán"),
      type: V2FormFieldType.SELECT,
      options: [
        {
          label: t(
            "garage:cashflowDrawer.payerTypeAuto",
            "Tự động theo số tiền",
          ),
          value: "",
        },
        { label: payerLabels.KH, value: "KH" },
        { label: payerLabels.BH, value: "BH" },
      ],
      visible: (values, currentMode) =>
        (values.voucherType || "").toUpperCase() === "RECEIPT" &&
        (currentMode === "edit" || !!values.payerType),
      renderView: (_p, _c, values) =>
        (values?.payerType && payerLabels[values.payerType]) || "—",
    },
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
