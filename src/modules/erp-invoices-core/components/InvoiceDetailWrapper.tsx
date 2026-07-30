import React, { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { erpInvoicesCoreApi } from "../api/erpInvoicesCoreApi";
import { useErpInvoiceForm } from "../hooks/useErpInvoiceForm";
import { ErpInvoiceInternalDrawer } from "./ErpInvoiceInternalDrawer";
import {
  ErpInvoiceInternalMain,
  ErpInvoiceInternalSidebar,
} from "./ErpInvoiceInternalInfo";
import { VietnamInvoiceTemplate } from "./VietnamInvoiceTemplate";
import { ErpInvoicePdfUpload } from "./ErpInvoicePdfUpload";

interface Props {
  invoiceId: string | null;
  onClose: () => void;
}

export function InvoiceDetailWrapper({ invoiceId, onClose }: Props) {
  const formHook = useErpInvoiceForm(() => {});

  const { data: invoice, isFetching } = useQuery({
    queryKey: ["erp-invoice", invoiceId],
    queryFn: () => (invoiceId ? erpInvoicesCoreApi.get(invoiceId) : null),
    enabled: !!invoiceId,
  });

  useEffect(() => {
    if (invoice && invoiceId) {
      formHook.openInternal(invoice);
    } else {
      formHook.closeDrawer();
    }
  }, [invoice, invoiceId]);

  const handleClose = () => {
    formHook.closeDrawer();
    onClose();
  };

  const fieldSet = (key: string, value: any) => {
    formHook.setForm((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <ErpInvoiceInternalDrawer
      open={!!invoiceId && formHook.internalDrawerOpen}
      onClose={handleClose}
      editMode={formHook.editMode}
      detailInvoice={formHook.detailInvoice}
      saving={formHook.saving}
      handleSave={formHook.handleSave}
      onDownload={() => {}}
      loadingDetail={isFetching || formHook.loadingDetail}
      startEdit={formHook.startEdit}
      cancelEdit={formHook.cancelEdit}
      rightPanel={
        <div className="flex flex-col gap-5">
          <ErpInvoiceInternalSidebar
            form={formHook.form}
            editMode={formHook.editMode}
            fieldSet={fieldSet}
            invoiceId={formHook.detailInvoice?.id ?? null}
            pendingTagIds={formHook.pendingTagIds}
            onPendingTagsChange={formHook.setPendingTagIds}
            direction={formHook.detailInvoice?.direction || "IN"}
            detailInvoice={formHook.detailInvoice}
            pdfSlot={
              <ErpInvoicePdfUpload
                invoiceId={formHook.detailInvoice?.id ?? null}
                attachments={formHook.detailInvoice?.attachments ?? null}
                editMode={formHook.editMode}
                pendingDeletedPdfs={formHook.form.pendingDeletedPdfs}
                onPendingDeletePdf={(key) => {
                  const current = formHook.form.pendingDeletedPdfs || [];
                  formHook.setForm((prev) => ({
                    ...prev,
                    pendingDeletedPdfs: [...current, key],
                  }));
                }}
                pendingAddedAttachments={formHook.form.pendingAddedAttachments}
                onPendingAddedAttachmentsChange={(files) => {
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
          fieldSet={fieldSet}
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
          invoicePreview={
            formHook.detailInvoice ? (
              <div className="flex justify-center bg-slate-100 p-8 min-h-full">
                <VietnamInvoiceTemplate invoice={formHook.detailInvoice} />
              </div>
            ) : undefined
          }
        />
      </div>
    </ErpInvoiceInternalDrawer>
  );
}
