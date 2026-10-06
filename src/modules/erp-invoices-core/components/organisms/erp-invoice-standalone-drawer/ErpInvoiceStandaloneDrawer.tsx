import React from "react";
import {
  ErpInvoiceInternalDrawer,
  ErpInvoiceInternalMain,
  ErpInvoiceInternalSidebar,
} from "../erp-invoice-detail-drawer";
import { ConfirmModal } from "@/shared/components/ConfirmModal";
import { type ErpInvoiceStandaloneDrawerProps } from "./ErpInvoiceStandaloneDrawer.type";
import { useErpInvoiceStandaloneDrawer } from "./ErpInvoiceStandaloneDrawer.hook";

export function ErpInvoiceStandaloneDrawer({
  isOpen,
  invoiceId,
  onClose,
  onSuccess,
}: ErpInvoiceStandaloneDrawerProps) {
  const { formHook, handleClose } = useErpInvoiceStandaloneDrawer({
    isOpen,
    invoiceId,
    onClose,
    onSuccess,
  });

  return (
    <>
      <ErpInvoiceInternalDrawer
        open={formHook.internalDrawerOpen}
        onClose={handleClose}
        editMode={formHook.editMode}
        detailInvoice={formHook.detailInvoice}
        startEdit={formHook.startEdit}
        saving={formHook.saving}
        handleSave={formHook.handleSave}
        cancelEdit={formHook.cancelEdit}
        loadingDetail={formHook.loadingDetail}
        onSyncDetail={formHook.handleSyncDetail}
        form={formHook.form}
        fieldSet={(key: string, value: any) =>
          formHook.setForm((prev) => ({ ...prev, [key]: value }))
        }
        direction={formHook.detailInvoice?.direction || "IN"}
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
                fieldSet={(key: string, value: any) =>
                  formHook.setForm((prev) => ({ ...prev, [key]: value }))
                }
                invoiceId={formHook.detailInvoice?.id ?? null}
                pendingTagIds={formHook.pendingTagIds}
                onPendingTagsChange={formHook.setPendingTagIds}
                direction={formHook.detailInvoice?.direction || "IN"}
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
              <ErpInvoiceInternalMain detailInvoice={formHook.detailInvoice} />
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
    </>
  );
}
export default ErpInvoiceStandaloneDrawer;
