import React from "react";
import { DrawerSection } from "@/shared/components/DrawerModal";
import { Button } from "@/shared/components/ui/Button";
import { PlusCircle, Trash, ExternalLink } from "lucide-react";
import { money } from "@/shared/utils/format";
import { VoucherNetoffSelectionModal } from "../voucher-netoff-selection-modal";
import type { ErpInvoiceNetOffSectionProps } from "./ErpInvoiceNetOffSection.type";
import { useErpInvoiceNetOffSection } from "./ErpInvoiceNetOffSection.hook";

export function ErpInvoiceNetOffSection({
  invoiceId,
  direction,
  voucherNetOffs = [],
  editMode,
  onRefresh,
}: ErpInvoiceNetOffSectionProps) {
  const {
    t,
    modalOpen,
    setModalOpen,
    saving,
    handleLink,
    handleUnlink,
    openBankVoucher,
  } = useErpInvoiceNetOffSection({ invoiceId, onRefresh });

  return (
    <div className="flex-1 min-w-0 w-full order-3 xl:order-3 space-y-4">
      <DrawerSection
        title={
          direction === "IN"
            ? t("paymentVouchers", "Chứng từ thanh toán")
            : t("receiptVouchers", "Chứng từ thu tiền")
        }
      >
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
                {direction === "IN"
                  ? t("addPaymentVoucher", "Thêm chứng từ thanh toán")
                  : t("addReceiptVoucher", "Thêm chứng từ thu tiền")}
              </Button>
            </div>
          )}
          {voucherNetOffs.length === 0 ? (
            <div className="text-sm text-gray-500 py-4 text-center border border-dashed rounded bg-gray-50">
              {direction === "IN"
                ? t("noPaymentVouchers", "Chưa có chứng từ thanh toán nào.")
                : t("noReceiptVouchers", "Chưa có chứng từ thu tiền nào.")}
            </div>
          ) : (
            <div className="border rounded-md overflow-x-auto">
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
                            className="text-primary font-medium cursor-pointer flex items-center gap-1.5 transition-opacity hover:opacity-80 group/link w-fit"
                            onClick={() => openBankVoucher(txn.id)}
                          >
                            <span className="group-hover/link:underline underline-offset-4">
                              {txn.description || "—"}
                            </span>
                            <ExternalLink className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover/link:opacity-100 transition-all" />
                          </span>
                        </td>
                        <td className="px-3 py-2 text-right font-medium text-slate-800">
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
        invoice={{ id: invoiceId, direction }}
        onSelect={handleLink}
        existingVoucherIds={voucherNetOffs.map((v) => v.bankTransactionId)}
      />
    </div>
  );
}
export default ErpInvoiceNetOffSection;
