import React from "react";
import {
  DrawerSection,
  DrawerField,
  DrawerRow,
} from "@/shared/components/DrawerModal";
import { ErpBankTransactionCombobox } from "../erp-bank-transaction-combobox";
import { ErpCashVoucherCombobox } from "../erp-cash-voucher-combobox";
import type { DrawerSectionProps } from "./GarageCashflowDrawer.type";

export const GarageCashflowDrawerSettlementSection: React.FC<
  DrawerSectionProps
> = ({ mode, voucher, formData, setFormData }) => {
  return (
    <DrawerSection
      title="THAM CHIẾU LIÊN KẾT"
      collapsible
      defaultCollapsed={false}
    >
      {mode === "edit" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DrawerField label="Tham chiếu ERP Bank">
            <ErpBankTransactionCombobox
              value={formData.erpBankTransactionId || ""}
              onChange={(val: string) =>
                setFormData((prev) => ({
                  ...prev,
                  erpBankTransactionId: val,
                }))
              }
              fallbackLabel={
                voucher?.erpBankTransaction
                  ? voucher.erpBankTransaction.referenceNumber ||
                    voucher.erpBankTransaction.seqNo ||
                    voucher.erpBankTransaction.id
                  : undefined
              }
            />
          </DrawerField>
          <DrawerField label="Tham chiếu ERP Cash">
            <ErpCashVoucherCombobox
              value={formData.erpCashVoucherId || ""}
              onChange={(val: string) =>
                setFormData((prev) => ({
                  ...prev,
                  erpCashVoucherId: val,
                }))
              }
              fallbackLabel={
                voucher?.erpCashVoucher
                  ? voucher.erpCashVoucher.referenceNumber ||
                    voucher.erpCashVoucher.seqNo ||
                    voucher.erpCashVoucher.id
                  : undefined
              }
            />
          </DrawerField>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
          <DrawerRow
            label="Tham chiếu ERP Bank"
            value={
              voucher?.erpBankTransaction
                ? voucher.erpBankTransaction.referenceNumber ||
                  voucher.erpBankTransaction.seqNo ||
                  voucher.erpBankTransaction.id
                : voucher?.erpBankTransactionId || "—"
            }
          />
          <DrawerRow
            label="Tham chiếu ERP Cash"
            value={
              voucher?.erpCashVoucher
                ? voucher.erpCashVoucher.referenceNumber ||
                  voucher.erpCashVoucher.seqNo ||
                  voucher.erpCashVoucher.id
                : voucher?.erpCashVoucherId || "—"
            }
          />
        </div>
      )}
    </DrawerSection>
  );
};
