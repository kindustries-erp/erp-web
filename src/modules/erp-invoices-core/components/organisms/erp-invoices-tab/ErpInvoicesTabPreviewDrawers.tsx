import { toast } from "react-hot-toast";
import { type TFunction } from "i18next";
import { FilePreviewDrawer } from "@/shared/components/FilePreviewDrawer";
import { erpInvoicesCoreApi } from "@/modules/erp-invoices-core/api/erpInvoicesCoreApi";
import { VoucherNetoffSelectionModal } from "@/modules/erp-invoices-core/components/organisms/voucher-netoff-selection-modal";
import { BankTransactionDetailDrawer } from "@/pages/finance/components/BankTransactionDetailDrawer";
import { InvoiceExportDrawer } from "@/modules/erp-invoices-core/components/organisms/invoice-export-drawer";
import { invoiceFilesV2Api } from "@/modules/erp-invoices-core/api/invoiceFilesV2Api";
import { type InvoiceDrawersProps } from "./ErpInvoicesTab.drawers.type";

type PreviewDrawersProps = Pick<
  InvoiceDrawersProps,
  | "direction"
  | "showToast"
  | "loadInvoices"
  | "buildExportBaseQuery"
  | "currentFilterSummary"
  | "exportDrawerOpen"
  | "setExportDrawerOpen"
  | "detailTransactionId"
  | "setDetailTransactionId"
  | "previewPdf"
  | "setPreviewPdf"
  | "netOffInvoice"
  | "setNetOffInvoice"
> & { t: TFunction<any, any> };

/** Xem trước PDF, xuất hóa đơn, chi tiết giao dịch ngân hàng và cấn trừ sao kê */
export function ErpInvoicesTabPreviewDrawers({
  direction,
  showToast,
  loadInvoices,
  buildExportBaseQuery,
  currentFilterSummary,
  exportDrawerOpen,
  setExportDrawerOpen,
  detailTransactionId,
  setDetailTransactionId,
  previewPdf,
  setPreviewPdf,
  netOffInvoice,
  setNetOffInvoice,
  t,
}: PreviewDrawersProps) {
  return (
    <>
      <FilePreviewDrawer
        open={Boolean(previewPdf)}
        onClose={() => setPreviewPdf(null)}
        previewUrl={previewPdf?.url}
        fileName={previewPdf?.filename}
        onDownload={
          previewPdf
            ? async () => {
                try {
                  const { url } = await invoiceFilesV2Api.downloadUrl(
                    previewPdf.invoiceId,
                    previewPdf.fileKey,
                    false,
                  );
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = previewPdf.filename || "document.pdf";
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                } catch {
                  showToast({
                    title: t("downloadFileError", "Lỗi tải xuống file"),
                    variant: "destructive",
                  });
                }
              }
            : undefined
        }
      />

      <InvoiceExportDrawer
        open={exportDrawerOpen}
        onClose={() => setExportDrawerOpen(false)}
        direction={direction}
        buildBaseQuery={buildExportBaseQuery}
        currentFilterSummary={currentFilterSummary}
      />

      <BankTransactionDetailDrawer
        isOpen={Boolean(detailTransactionId)}
        onClose={() => setDetailTransactionId(null)}
        transactionId={detailTransactionId}
      />

      {netOffInvoice && (
        <VoucherNetoffSelectionModal
          open={Boolean(netOffInvoice)}
          onClose={() => setNetOffInvoice(null)}
          invoice={netOffInvoice}
          existingVoucherIds={(netOffInvoice.voucherNetOffs || []).map(
            (v: any) => v.bankTransactionId,
          )}
          onSelect={async (selected) => {
            if (selected.length === 0) return;
            try {
              await erpInvoicesCoreApi.linkVouchers(
                netOffInvoice.id,
                selected.map((s) => ({
                  bankTransactionId: s.id,
                  netOffAmount: s.amount,
                })),
              );
              toast.success(t("netOffSuccess", "Đã cấn trừ sao kê thành công"));
              setNetOffInvoice(null);
              void loadInvoices();
            } catch (e: any) {
              toast.error(
                e.response?.data?.message ||
                  t("netOffError", "Lỗi khi cấn trừ sao kê"),
              );
            }
          }}
        />
      )}
    </>
  );
}
