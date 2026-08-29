import React from "react";
import { toast } from "react-hot-toast";
import { type TFunction } from "i18next";
import { ConfirmModal } from "@/shared/components/ConfirmModal";
import { FilePreviewDrawer } from "@/shared/components/FilePreviewDrawer";
import {
  erpInvoicesCoreApi,
  type ErpInvoiceListParams,
} from "@/modules/erp-invoices-core/api/erpInvoicesCoreApi";
import { ErpInvoiceInternalDrawer } from "@/modules/erp-invoices-core/components/ErpInvoiceInternalDrawer";
import { InvoiceImportSyncDrawer } from "@/modules/erp-invoices-core/components/InvoiceImportSyncDrawer";
import { GdtPortalAuthDrawer } from "@/modules/erp-invoices-core/components/GdtPortalAuthDrawer";
import { VietnamInvoiceTemplate } from "@/modules/erp-invoices-core/components/VietnamInvoiceTemplate";
import { VoucherNetoffSelectionModal } from "@/modules/erp-invoices-core/components/VoucherNetoffSelectionModal";
import { BankTransactionDetailDrawer } from "@/pages/finance/components/BankTransactionDetailDrawer";
import {
  ErpInvoiceInternalMain,
  ErpInvoiceInternalSidebar,
} from "@/modules/erp-invoices-core/components/ErpInvoiceInternalInfo";
import { InvoiceExportDrawer } from "@/modules/erp-invoices-core/components/InvoiceExportDrawer";
import {
  getAttachmentContentBlobApi,
  getAttachmentDownloadUrlApi,
} from "@/modules/system/api/attachmentsApi";
import { type useErpInvoiceForm } from "@/modules/erp-invoices-core/hooks/useErpInvoiceForm";
import { type useErpInvoiceUrlSync } from "@/modules/erp-invoices-core/hooks/useErpInvoiceUrlSync";

export interface InvoiceDrawersProps {
  direction: "IN" | "OUT";
  isDrawer: boolean;
  t: TFunction<any, any>;
  showToast: (options: any) => void;
  formHook: ReturnType<typeof useErpInvoiceForm>;
  urlSync: ReturnType<typeof useErpInvoiceUrlSync>;
  loadInvoices: () => Promise<any>;
  handleCloseInternal: () => void;
  buildExportBaseQuery: () => Partial<ErpInvoiceListParams>;
  // Modals & Drawers
  exportDrawerOpen: boolean;
  setExportDrawerOpen: (open: boolean) => void;
  portalAuthOpen: boolean;
  setPortalAuthOpen: (open: boolean) => void;
  importModalOpen: boolean;
  setImportModalOpen: (open: boolean) => void;
  detailTransactionId: string | null;
  setDetailTransactionId: (id: string | null) => void;
  previewPdf: {
    url: string;
    filename: string;
    fileKey: string;
    invoiceId: string;
    isAttachment?: boolean;
  } | null;
  setPreviewPdf: (pdf: any) => void;
  netOffInvoice: any | null;
  setNetOffInvoice: (inv: any | null) => void;
  activeView?: "header" | "lines";
  partnerViewMode?: "invoices" | "lines";
}

export function InvoiceDrawers({
  direction,
  isDrawer,
  t,
  showToast,
  formHook,
  urlSync,
  loadInvoices,
  handleCloseInternal,
  buildExportBaseQuery,
  exportDrawerOpen,
  setExportDrawerOpen,
  portalAuthOpen,
  setPortalAuthOpen,
  importModalOpen,
  setImportModalOpen,
  detailTransactionId,
  setDetailTransactionId,
  previewPdf,
  setPreviewPdf,
  netOffInvoice,
  setNetOffInvoice,
  activeView,
  partnerViewMode,
}: InvoiceDrawersProps) {
  return (
    <>
      <ErpInvoiceInternalDrawer
        open={
          formHook.internalDrawerOpen &&
          (!isDrawer ? Boolean(urlSync.urlState.drawerId) : true)
        }
        onClose={handleCloseInternal}
        editMode={formHook.editMode}
        detailInvoice={formHook.detailInvoice}
        activeTabKey={formHook.activeTabKey}
        onTabChange={formHook.setActiveTabKey}
        partnerViewMode={
          partnerViewMode || (activeView === "lines" ? "lines" : "invoices")
        }
        startEdit={formHook.startEdit}
        saving={formHook.saving}
        handleSave={formHook.handleSave}
        cancelEdit={formHook.cancelEdit}
        loadingDetail={formHook.loadingDetail}
        onSyncDetail={formHook.handleSyncDetail}
        form={formHook.form}
        fieldSet={formHook.fieldSet}
        direction={direction}
        postingState={formHook.postingState}
        pendingUnpost={formHook.pendingUnpost}
        onUnpost={() => formHook.setPendingUnpost(true)}
        rightPanel={
          <div className="flex flex-col gap-4">
            {formHook.loadingDetail ? (
              <div className="space-y-4">
                <div className="h-[200px] bg-slate-100 animate-pulse rounded-lg border border-slate-200" />
              </div>
            ) : (
              <ErpInvoiceInternalSidebar
                form={formHook.form}
                editMode={formHook.editMode}
                fieldSet={formHook.fieldSet}
                invoiceId={formHook.detailInvoice?.id ?? null}
                pendingTagIds={formHook.pendingTagIds}
                onPendingTagsChange={formHook.setPendingTagIds}
                direction={direction}
                detailInvoice={formHook.detailInvoice}
                onRefreshDetail={formHook.handleSyncDetail}
              />
            )}
          </div>
        }
      >
        <div className="flex flex-col gap-4">
          {formHook.loadingDetail ? (
            <div className="space-y-4">
              <div className="h-[350px] bg-slate-100 animate-pulse rounded-lg border border-slate-200" />
            </div>
          ) : (
            <>
              {formHook.formError && (
                <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-md text-sm">
                  {formHook.formError}
                </div>
              )}
              <ErpInvoiceInternalMain
                detailInvoice={formHook.detailInvoice}
                invoicePreview={
                  formHook.detailInvoice ? (
                    <VietnamInvoiceTemplate invoice={formHook.detailInvoice} />
                  ) : undefined
                }
              />
            </>
          )}
        </div>
      </ErpInvoiceInternalDrawer>

      <ConfirmModal
        open={formHook.deleteConfirm}
        onCancel={() => formHook.setDeleteConfirm(false)}
        title="Xóa hóa đơn"
        message={`Bạn có chắc muốn xóa hóa đơn ${formHook.detailInvoice?.invoiceNo}? Thao tác này không thể hoàn tác.`}
        confirmLabel="Xóa"
        danger
        loading={formHook.saving}
        onConfirm={formHook.handleDelete}
      />

      <ConfirmModal
        open={formHook.cancelConfirm}
        onCancel={() => formHook.setCancelConfirm(false)}
        title="Hủy hóa đơn"
        message={`Bạn có chắc muốn hủy hóa đơn ${formHook.detailInvoice?.invoiceNo}?`}
        confirmLabel="Đồng ý hủy"
        danger
        loading={formHook.saving}
        onConfirm={formHook.handleCancel}
      />

      <InvoiceImportSyncDrawer
        open={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        initialDirection={direction}
        onImported={(dir: "IN" | "OUT") => {
          if (dir === direction) {
            void loadInvoices();
          }
        }}
      />

      <GdtPortalAuthDrawer
        open={portalAuthOpen}
        onClose={() => setPortalAuthOpen(false)}
      />

      <FilePreviewDrawer
        open={Boolean(previewPdf)}
        onClose={() => setPreviewPdf(null)}
        previewUrl={previewPdf?.url}
        fileName={previewPdf?.filename}
        fetchBlobFn={
          previewPdf
            ? () =>
                previewPdf.isAttachment
                  ? getAttachmentContentBlobApi(previewPdf.fileKey)
                  : erpInvoicesCoreApi.getPdfBlob(
                      previewPdf.invoiceId,
                      previewPdf.fileKey,
                    )
            : undefined
        }
        onDownload={
          previewPdf
            ? async () => {
                try {
                  const url = previewPdf.isAttachment
                    ? (await getAttachmentDownloadUrlApi(previewPdf.fileKey))
                        .url
                    : (
                        await erpInvoicesCoreApi.getPdfDownloadUrl(
                          previewPdf.invoiceId,
                          previewPdf.fileKey,
                          false,
                        )
                      ).url;
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = previewPdf.filename || "document.pdf";
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                } catch {
                  showToast({
                    title: "Lỗi tải xuống file",
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
