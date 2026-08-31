import { useState, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { erpInvoicesCoreApi } from "../../../api/erpInvoicesCoreApi";
import {
  type ErpInvoiceSettlementTabProps,
  type ActiveVoucherItem,
} from "../types";

export function useErpInvoiceSettlementLogic({
  invoice,
  form,
  editMode,
  fieldSet,
  onRefresh,
}: ErpInvoiceSettlementTabProps) {
  const { t } = useTranslation(["erpInvoices", "common"]);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);

  // Active vouchers combining persisted invoice data and pending changes
  const activeVouchers: ActiveVoucherItem[] = useMemo(() => {
    const list: ActiveVoucherItem[] = [];
    const pending = form?.pendingDocumentChanges || [];

    const removedBankIds = pending
      .filter((p) => p.action === "REMOVE" && p.type === "BANK")
      .map((p) => p.refId);

    (invoice?.voucherNetOffs || []).forEach((v) => {
      if (removedBankIds.includes(v.bankTransactionId)) return;
      list.push({
        id: v.id,
        bankTransactionId: v.bankTransactionId,
        refNo:
          v.bankTransaction?.referenceNumber ||
          v.bankTransaction?.description ||
          `GD #${v.bankTransactionId.slice(0, 8)}`,
        description: v.bankTransaction?.description || "—",
        transDate: v.bankTransaction?.transDate || null,
        amount: Number(v.netOffAmount || 0),
        bankName:
          v.bankTransaction?.bankAccount?.bankName ||
          v.bankTransaction?.bankName ||
          v.bankTransaction?.cashBook?.name ||
          "Sao kê ERP",
        partnerName:
          v.bankTransaction?.partnerName ||
          v.bankTransaction?.correspondentName ||
          "",
        isPending: false,
      });
    });

    // Add pending ADD items
    pending
      .filter((p) => p.action === "ADD" && p.type === "BANK")
      .forEach((p) => {
        list.push({
          id: p.refId,
          bankTransactionId: p.refId,
          refNo: `Giao dịch #${p.refId.slice(0, 8)}`,
          description: "Giao dịch đang chờ lưu...",
          transDate: new Date().toISOString(),
          amount: Number(p.amount || 0),
          bankName: "Sao kê ERP",
          partnerName: "",
          isPending: true,
        });
      });

    return list;
  }, [invoice?.voucherNetOffs, form?.pendingDocumentChanges]);

  const totalInvoiceAmount = Number(
    invoice?.totalAmount || form?.totalAmount || 0,
  );
  const totalNetOff = activeVouchers.reduce(
    (sum, v) => sum + Number(v.amount || 0),
    0,
  );
  const remainingDebt = Math.max(0, totalInvoiceAmount - totalNetOff);
  const paymentPercent =
    totalInvoiceAmount > 0
      ? Math.min(100, Math.round((totalNetOff / totalInvoiceAmount) * 100))
      : totalNetOff > 0
        ? 100
        : 0;
  const isPaidFull =
    totalNetOff >= totalInvoiceAmount && totalInvoiceAmount > 0;

  const handleSelectBankNetOff = useCallback(
    (selected: { id: string; amount: number }[]) => {
      if (selected.length === 0) return;
      if (editMode) {
        const current = form?.pendingDocumentChanges || [];
        const newChanges = selected.map((s) => ({
          action: "ADD" as const,
          type: "BANK" as const,
          refId: s.id,
          amount: s.amount,
        }));
        fieldSet?.("pendingDocumentChanges", [...current, ...newChanges]);
        toast.success(
          t(
            "addBankPendingToast",
            "Đã thêm giao dịch ngân hàng vào danh sách cấn trừ (chờ Lưu thay đổi).",
          ),
        );
      } else if (invoice?.id) {
        setSaving(true);
        erpInvoicesCoreApi
          .linkVouchers(
            invoice.id,
            selected.map((s) => ({
              bankTransactionId: s.id,
              netOffAmount: s.amount,
            })),
          )
          .then(() => {
            toast.success(t("linkSuccess", "Đã cấn trừ phiếu thành công"));
            onRefresh?.();
          })
          .catch((e: any) => {
            toast.error(e.response?.data?.message || "Lỗi cấn trừ phiếu");
          })
          .finally(() => setSaving(false));
      }
    },
    [editMode, form?.pendingDocumentChanges, fieldSet, invoice, onRefresh, t],
  );

  const handleUnlinkVoucher = useCallback(
    async (item: ActiveVoucherItem) => {
      if (editMode) {
        const current = form?.pendingDocumentChanges || [];
        fieldSet?.("pendingDocumentChanges", [
          ...current,
          {
            action: "REMOVE" as const,
            type: "BANK" as const,
            refId: item.bankTransactionId,
          },
        ]);
        toast.success(
          t(
            "removeBankPendingToast",
            "Đã đánh dấu gỡ cấn trừ giao dịch (chờ Lưu thay đổi).",
          ),
        );
      } else if (invoice?.id) {
        try {
          setSaving(true);
          await erpInvoicesCoreApi.removeVoucherLink(
            invoice.id,
            item.bankTransactionId,
          );
          toast.success(t("unlinkSuccess", "Đã gỡ cấn trừ thành công"));
          onRefresh?.();
        } catch (e: any) {
          toast.error(e.response?.data?.message || "Lỗi gỡ cấn trừ");
        } finally {
          setSaving(false);
        }
      }
    },
    [editMode, form?.pendingDocumentChanges, fieldSet, invoice, onRefresh, t],
  );

  const openBankVoucher = useCallback((id: string) => {
    const event = new CustomEvent("open_erp_document", {
      detail: { type: "bank_transaction", id },
    });
    window.dispatchEvent(event);
  }, []);

  return {
    showModal,
    setShowModal,
    saving,
    activeVouchers,
    totalInvoiceAmount,
    totalNetOff,
    remainingDebt,
    paymentPercent,
    isPaidFull,
    handleSelectBankNetOff,
    handleUnlinkVoucher,
    openBankVoucher,
  };
}
