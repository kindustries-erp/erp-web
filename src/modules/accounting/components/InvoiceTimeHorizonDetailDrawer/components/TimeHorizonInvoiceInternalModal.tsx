import React from "react";
import { ErpInvoiceInternalDrawer } from "@/modules/erp-invoices-core/components/ErpInvoiceInternalDrawer";
import {
  ErpInvoiceInternalMain,
  ErpInvoiceInternalSidebar,
} from "@/modules/erp-invoices-core/components/ErpInvoiceInternalInfo";
import { VietnamInvoiceTemplate } from "@/modules/erp-invoices-core/components/VietnamInvoiceTemplate";

export interface TimeHorizonInvoiceInternalModalProps {
  formHook: any;
}

export function TimeHorizonInvoiceInternalModal({
  formHook,
}: TimeHorizonInvoiceInternalModalProps) {
  return (
    <ErpInvoiceInternalDrawer
      open={formHook.internalDrawerOpen}
      onClose={formHook.closeDrawer}
      editMode={formHook.editMode}
      detailInvoice={formHook.detailInvoice}
      startEdit={formHook.startEdit}
      saving={formHook.saving}
      handleSave={formHook.handleSave}
      cancelEdit={formHook.cancelEdit}
      form={formHook.form}
      fieldSet={(key: string, value: any) =>
        formHook.setForm((prev: any) => ({ ...prev, [key]: value }))
      }
      direction={formHook.form.direction || "IN"}
      postingState={formHook.postingState}
      pendingUnpost={formHook.pendingUnpost}
      onUnpost={() => formHook.setPendingUnpost(true)}
      rightPanel={
        <div className="flex flex-col gap-4">
          <ErpInvoiceInternalSidebar
            form={formHook.form}
            editMode={formHook.editMode}
            fieldSet={(key: string, value: any) =>
              formHook.setForm((prev: any) => ({ ...prev, [key]: value }))
            }
            invoiceId={formHook.detailInvoice?.id ?? null}
            pendingTagIds={formHook.pendingTagIds}
            onPendingTagsChange={formHook.setPendingTagIds}
            direction={formHook.form.direction || "IN"}
            detailInvoice={formHook.detailInvoice}
            onRefreshDetail={formHook.handleSyncDetail}
          />
        </div>
      }
    >
      <div className="flex flex-col gap-4">
        <ErpInvoiceInternalMain
          detailInvoice={formHook.detailInvoice}
          invoicePreview={
            formHook.detailInvoice ? (
              <VietnamInvoiceTemplate invoice={formHook.detailInvoice} />
            ) : undefined
          }
        />
      </div>
    </ErpInvoiceInternalDrawer>
  );
}
