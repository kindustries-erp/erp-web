import React, { useState } from "react";
import { Forbidden } from "@/pages/Forbidden";
import { useHasPermission } from "@/shared/hooks/useHasPermission";
import { ErpResource, ErpAction } from "@/modules/system/types/rbac";
import { getAttachmentDownloadUrlApi } from "@/modules/system/api/attachmentsApi";
import { useErpInvoiceForm } from "@/modules/erp-invoices-core/hooks/useErpInvoiceForm";
import {
  ErpInvoiceInternalDrawer,
  ErpInvoiceInternalMain,
  ErpInvoiceInternalSidebar,
  ErpInvoicePdfUpload,
  VietnamInvoiceTemplate,
} from "@/modules/erp-invoices-core/components";
import type { ErpAttachment } from "../../types/attachment.types";
import { AttachmentsTable } from "../../organisms/attachments-table";
import { AttachmentDetailModal } from "../../molecules/attachment-detail-modal";

export function AttachmentsPage() {
  const canRead = useHasPermission(ErpResource.ATTACHMENTS, ErpAction.READ);
  const [selected, setSelected] = useState<ErpAttachment | null>(null);
  const invoiceFormHook = useErpInvoiceForm(async () => {});

  if (!canRead) {
    return <Forbidden />;
  }

  const handleOpenFile = async (a: ErpAttachment) => {
    try {
      const res = await getAttachmentDownloadUrlApi(a.id, true);
      window.open(res.url, "_blank", "noopener,noreferrer");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="h-full w-full relative flex flex-col min-h-0">
      <AttachmentsTable
        onSelectAttachment={setSelected}
        onOpenInvoiceDetail={(id) => invoiceFormHook.openInternal(id)}
      />

      <AttachmentDetailModal
        item={selected}
        onClose={() => setSelected(null)}
        onOpenFile={selected ? () => handleOpenFile(selected) : undefined}
      />

      <ErpInvoiceInternalDrawer
        open={invoiceFormHook.internalDrawerOpen}
        onClose={() => invoiceFormHook.setInternalDrawerOpen(false)}
        editMode={invoiceFormHook.editMode}
        detailInvoice={invoiceFormHook.detailInvoice}
        startEdit={invoiceFormHook.startEdit}
        saving={invoiceFormHook.saving}
        handleSave={invoiceFormHook.handleSave}
        cancelEdit={invoiceFormHook.cancelEdit}
        onSyncDetail={invoiceFormHook.handleSyncDetail}
        loadingDetail={invoiceFormHook.loadingDetail}
        rightPanel={
          <ErpInvoiceInternalSidebar
            form={invoiceFormHook.form}
            editMode={invoiceFormHook.editMode}
            fieldSet={(key: string, value: any) =>
              invoiceFormHook.setForm((prev) => ({ ...prev, [key]: value }))
            }
            invoiceId={invoiceFormHook.detailInvoice?.id ?? null}
            pendingTagIds={invoiceFormHook.pendingTagIds}
            onPendingTagsChange={invoiceFormHook.setPendingTagIds}
            direction={invoiceFormHook.detailInvoice?.direction as "IN" | "OUT"}
            detailInvoice={invoiceFormHook.detailInvoice}
            onRefreshDetail={invoiceFormHook.handleSyncDetail}
            pdfSlot={
              <ErpInvoicePdfUpload
                invoiceId={invoiceFormHook.detailInvoice?.id ?? null}
                attachments={invoiceFormHook.detailInvoice?.attachments ?? null}
                editMode={invoiceFormHook.editMode}
                pendingAddedAttachments={
                  invoiceFormHook.form.pendingAddedAttachments
                }
                onPendingAddedAttachmentsChange={(files) =>
                  invoiceFormHook.setForm((prev) => ({
                    ...prev,
                    pendingAddedAttachments: files,
                  }))
                }
              />
            }
          />
        }
      >
        <ErpInvoiceInternalMain
          form={invoiceFormHook.form}
          editMode={invoiceFormHook.editMode}
          fieldSet={(key: string, value: any) =>
            invoiceFormHook.setForm((prev) => ({ ...prev, [key]: value }))
          }
          direction={invoiceFormHook.detailInvoice?.direction as "IN" | "OUT"}
          detailInvoice={invoiceFormHook.detailInvoice}
          postingState={invoiceFormHook.postingState}
          pendingUnpost={invoiceFormHook.pendingUnpost}
          onUnpost={() => invoiceFormHook.setPendingUnpost(true)}
          onRefreshDetail={() => {
            if (invoiceFormHook.detailInvoice?.id) {
              invoiceFormHook.openInternal(invoiceFormHook.detailInvoice.id);
            }
          }}
          invoicePreview={
            invoiceFormHook.detailInvoice ? (
              <VietnamInvoiceTemplate invoice={invoiceFormHook.detailInvoice} />
            ) : undefined
          }
        />
      </ErpInvoiceInternalDrawer>
    </div>
  );
}
