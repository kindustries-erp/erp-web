import React from "react";
import {
  ErpInvoiceInternalDrawer,
  ErpInvoiceInternalMain,
  ErpInvoiceInternalSidebar,
} from "../erp-invoice-detail-drawer";
import { ErpInvoicePdfUpload } from "../erp-invoice-pdf-upload";
import { type InvoiceDetailWrapperProps } from "./InvoiceDetailWrapper.type";
import { useInvoiceDetailWrapper } from "./InvoiceDetailWrapper.hook";

export function InvoiceDetailWrapper({
  invoiceId,
  onClose,
}: InvoiceDetailWrapperProps) {
  const { formHook, isFetching, handleClose } = useInvoiceDetailWrapper({
    invoiceId,
    onClose,
  });

  return (
    <ErpInvoiceInternalDrawer
      open={!!invoiceId && formHook.internalDrawerOpen}
      onClose={handleClose}
      editMode={formHook.editMode}
      detailInvoice={formHook.detailInvoice}
      saving={formHook.saving}
      handleSave={formHook.handleSave}
      loadingDetail={isFetching || formHook.loadingDetail}
      startEdit={formHook.startEdit}
      cancelEdit={formHook.cancelEdit}
      rightPanel={
        <div className="flex flex-col gap-5">
          <ErpInvoiceInternalSidebar
            form={formHook.form}
            editMode={formHook.editMode}
            fieldSet={formHook.fieldSet}
            invoiceId={formHook.detailInvoice?.id ?? null}
            pendingTagIds={formHook.pendingTagIds}
            onPendingTagsChange={formHook.setPendingTagIds}
            direction={formHook.detailInvoice?.direction || "IN"}
            detailInvoice={formHook.detailInvoice}
            pdfSlot={
              <ErpInvoicePdfUpload
                invoiceId={formHook.detailInvoice?.id ?? null}
                attachments={formHook.detailInvoice?.attachments ?? null}
                pdfFileKey={formHook.detailInvoice?.pdfFileKey ?? null}
                pdfFiles={formHook.detailInvoice?.pdfFiles ?? null}
                editMode={formHook.editMode}
                pendingDeletedPdfs={formHook.form.pendingDeletedPdfs}
                onPendingDeletePdf={(key: string) => {
                  const current = formHook.form.pendingDeletedPdfs || [];
                  formHook.setForm((prev) => ({
                    ...prev,
                    pendingDeletedPdfs: [...current, key],
                  }));
                }}
                pendingAddedAttachments={formHook.form.pendingAddedAttachments}
                onPendingAddedAttachmentsChange={(files: any) => {
                  formHook.setForm((prev) => ({
                    ...prev,
                    pendingAddedAttachments: files,
                  }));
                }}
              />
            }
          />
        </div>
      }
    >
      <div className="flex flex-col gap-5">
        <ErpInvoiceInternalMain
          form={formHook.form}
          editMode={formHook.editMode}
          fieldSet={formHook.fieldSet}
          direction={formHook.detailInvoice?.direction || "IN"}
          detailInvoice={formHook.detailInvoice}
          postingState={formHook.postingState}
          pendingUnpost={formHook.pendingUnpost}
          onUnpost={() => formHook.setPendingUnpost(true)}
          onRefreshDetail={() => {
            if (formHook.detailInvoice?.id) {
              formHook.openInternal(formHook.detailInvoice);
            }
          }}
        />
      </div>
    </ErpInvoiceInternalDrawer>
  );
}
export default InvoiceDetailWrapper;
