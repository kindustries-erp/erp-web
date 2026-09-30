import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-hot-toast";
import { erpInvoicesCoreApi } from "@/modules/erp-invoices-core/api/erpInvoicesCoreApi";

export function useErpInvoiceNetOffSection({
  invoiceId,
  onRefresh,
}: {
  invoiceId: string;
  onRefresh: () => void;
}) {
  const { t } = useTranslation("erpInvoices");
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleLink = async (selected: { id: string; amount: number }[]) => {
    if (selected.length === 0) return;
    try {
      setSaving(true);
      await erpInvoicesCoreApi.linkVouchers(
        invoiceId,
        selected.map((s) => ({
          bankTransactionId: s.id,
          netOffAmount: s.amount,
        })),
      );
      toast.success(t("linkSuccess", "Đã liên kết phiếu thành công"));
      onRefresh();
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Lỗi liên kết phiếu");
    } finally {
      setSaving(false);
    }
  };

  const handleUnlink = async (voucherId: string) => {
    try {
      setSaving(true);
      await erpInvoicesCoreApi.removeVoucherLink(invoiceId, voucherId);
      toast.success(t("unlinkSuccess", "Đã gỡ liên kết phiếu thành công"));
      onRefresh();
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Lỗi gỡ liên kết phiếu");
    } finally {
      setSaving(false);
    }
  };

  const openBankVoucher = (id: string) => {
    const event = new CustomEvent("open_erp_document", {
      detail: { type: "bank_transaction", id },
    });
    window.dispatchEvent(event);
  };

  return {
    t,
    modalOpen,
    setModalOpen,
    saving,
    handleLink,
    handleUnlink,
    openBankVoucher,
  };
}
