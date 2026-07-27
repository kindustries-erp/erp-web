import React, { useEffect } from "react";
import { ErpInvoiceInternalDrawer } from "./ErpInvoiceInternalDrawer";
import { useErpInvoiceForm } from "../hooks/useErpInvoiceForm";
import { VietnamInvoiceTemplate } from "./VietnamInvoiceTemplate";
import { erpInvoicesCoreApi, type ErpInvoice } from "../api/erpInvoicesCoreApi";
import { useUIStore } from "@/core/config/uiStore";
import {
  ErpInvoiceInternalMain,
  ErpInvoiceInternalSidebar,
} from "./ErpInvoiceInternalInfo";
import { ErpInvoicePdfUpload } from "./ErpInvoicePdfUpload";
import { ConfirmModal } from "@/shared/components/ConfirmModal";

interface ErpInvoiceStandaloneDrawerProps {
  isOpen: boolean;
  invoiceId: string | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export function ErpInvoiceStandaloneDrawer({
  isOpen,
  invoiceId,
  onClose,
  onSuccess,
}: ErpInvoiceStandaloneDrawerProps) {
  const showToast = useUIStore((s) => s.showToast);

  // Pass a callback to trigger onSuccess (e.g. to refetch a list if needed)
  const formHook = useErpInvoiceForm(async () => {
    if (onSuccess) onSuccess();
  });

  useEffect(() => {
    if (isOpen && invoiceId) {
      formHook.openInternal({ id: invoiceId } as ErpInvoice);
    } else if (!isOpen) {
      if (formHook.internalDrawerOpen) {
        formHook.closeDrawer();
      }
    }
  }, [isOpen, invoiceId]);

  const handleClose = () => {
    formHook.closeDrawer();
    onClose();
  };

  async function handleDownload(id: string, type: "pdf" | "xml") {
    try {
      showToast({
        title: `Đang tải file ${type.toUpperCase()}...`,
        variant: "default",
      });
      const { url } = await erpInvoicesCoreApi.getDownloadUrl(id, type);
      if (url) {
        const a = document.createElement("a");
        a.href = url;
        a.download = "";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    } catch {
      showToast({
        title: `Không thể tải ${type.toUpperCase()}`,
        variant: "destructive",
      });
    }
  }

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
        onDownload={handleDownload}
        rightPanel={
          <div className="flex flex-col gap-5">
            {formHook.loadingDetail ? (
              <div className="space-y-6">
                <div className="h-[200px] bg-slate-100 animate-pulse rounded-lg border border-slate-200" />
                <div className="h-[300px] bg-slate-100 animate-pulse rounded-lg border border-slate-200" />
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
                pdfSlot={
                  <ErpInvoicePdfUpload
                    invoiceId={formHook.detailInvoice?.id ?? null}
                    pdfFiles={formHook.detailInvoice?.pdfFiles ?? null}
                    pdfFileKey={formHook.detailInvoice?.pdfFileKey ?? null}
                    editMode={formHook.editMode}
                    pendingDeletedPdfs={formHook.form.pendingDeletedPdfs}
                    onPendingDeletePdf={(key) => {
                      const current = formHook.form.pendingDeletedPdfs || [];
                      formHook.setForm((prev) => ({
                        ...prev,
                        pendingDeletedPdfs: [...current, key],
                      }));
                    }}
                    pendingAddedPdfs={formHook.form.pendingAddedPdfs}
                    onPendingAddedPdfsChange={(files) => {
                      formHook.setForm((prev) => ({
                        ...prev,
                        pendingAddedPdfs: files,
                      }));
                    }}
                  />
                }
              />
            )}
          </div>
        }
      >
        <div className="flex flex-col gap-5">
          {formHook.loadingDetail ? (
            <div className="space-y-6">
              <div className="h-[250px] bg-slate-100 animate-pulse rounded-lg border border-slate-200" />
              <div className="h-[400px] bg-slate-100 animate-pulse rounded-lg border border-slate-200" />
            </div>
          ) : (
            <>
              {formHook.formError && (
                <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-md text-sm">
                  {formHook.formError}
                </div>
              )}
              <ErpInvoiceInternalMain
                form={formHook.form}
                editMode={formHook.editMode}
                fieldSet={(key: string, value: any) =>
                  formHook.setForm((prev) => ({ ...prev, [key]: value }))
                }
                direction={formHook.detailInvoice?.direction || "IN"}
                detailInvoice={formHook.detailInvoice}
                postingState={formHook.postingState}
                pendingUnpost={formHook.pendingUnpost}
                onUnpost={() => formHook.setPendingUnpost(true)}
                onRefreshDetail={() => {
                  if (formHook.detailInvoice?.id) {
                    formHook.openInternal({
                      id: formHook.detailInvoice.id,
                    } as ErpInvoice);
                  }
                }}
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
    </>
  );
}
