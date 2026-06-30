import { useState } from "react";
import { DrawerSection } from "@/shared/components/DrawerModal";
import { Button } from "@/shared/components/ui/Button";
import { useTranslation } from "react-i18next";
import { PlusCircle, Trash, ExternalLink } from "lucide-react";
import { money } from "@/shared/utils/format";
import { VoucherNetoffSelectionModal } from "./VoucherNetoffSelectionModal";
import { erpInvoicesCoreApi } from "../api/erpInvoicesCoreApi";
import { toast } from "react-hot-toast";
import {} from "@tanstack/react-query";

interface Props {
  invoiceId: string;
  direction: "IN" | "OUT";
  voucherNetOffs?: any[];
  editMode: boolean;
  onRefresh: () => void;
}

export function ErpInvoiceNetOffSection({
  invoiceId,
  direction,
  voucherNetOffs = [],
  editMode,
  onRefresh,
}: Props) {
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

  return (
    <div className="flex-1 min-w-0 w-full order-3 xl:order-3 space-y-4">
      <DrawerSection title={t("netOffVouchers", "Phiếu cấn trừ VAT")}>
        <div className="flex flex-col gap-3">
          {editMode && (
            <div className="flex justify-start">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setModalOpen(true)}
                disabled={saving}
              >
                <PlusCircle className="w-4 h-4 mr-2" />
                {t("addNetOffVoucher", "Thêm phiếu cấn trừ")}
              </Button>
            </div>
          )}
          {voucherNetOffs.length === 0 ? (
            <div className="text-sm text-gray-500 py-4 text-center border border-dashed rounded bg-gray-50">
              {t("noNetOffVouchers", "Chưa có phiếu cấn trừ nào.")}
            </div>
          ) : (
            <div className="border rounded-md overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-3 py-2 font-medium">
                      {t("date", "Ngày")}
                    </th>
                    <th className="px-3 py-2 font-medium">
                      {t("description", "Diễn giải")}
                    </th>
                    <th className="px-3 py-2 font-medium text-right">
                      {t("amount", "Số tiền cấn trừ")}
                    </th>
                    <th className="px-3 py-2 font-medium text-right w-20"></th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {voucherNetOffs.map((link) => {
                    const txn = link.bankTransaction || {};
                    return (
                      <tr key={link.id} className="hover:bg-gray-50 group">
                        <td className="px-3 py-2">
                          {txn.transDate
                            ? new Date(txn.transDate).toLocaleDateString()
                            : "—"}
                        </td>
                        <td className="px-3 py-2">
                          <span
                            className="text-blue-600 hover:underline cursor-pointer flex items-center gap-1"
                            onClick={() => openBankVoucher(txn.id)}
                          >
                            {txn.description || "—"}
                            <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </span>
                        </td>
                        <td className="px-3 py-2 text-right font-medium">
                          {money(Number(link.netOffAmount || 0))}
                        </td>
                        <td className="px-3 py-2 text-right">
                          {editMode && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
                              onClick={() =>
                                handleUnlink(link.bankTransactionId)
                              }
                              disabled={saving}
                            >
                              <Trash className="w-4 h-4" />
                            </Button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </DrawerSection>

      <VoucherNetoffSelectionModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        direction={direction}
        onSelect={handleLink}
        existingVoucherIds={voucherNetOffs.map((v) => v.bankTransactionId)}
      />
    </div>
  );
}
