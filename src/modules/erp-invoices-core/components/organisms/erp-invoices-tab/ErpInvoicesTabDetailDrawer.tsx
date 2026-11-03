import { type TFunction } from "i18next";
import { ConfirmModal } from "@/shared/components/ConfirmModal";
import {
  ErpInvoiceInternalDrawer,
  ErpInvoiceInternalMain,
  ErpInvoiceInternalSidebar,
} from "@/modules/erp-invoices-core/components/organisms/erp-invoice-detail-drawer";
import { V2Skeleton } from "@/v2/shared/components/atoms/v2-skeleton";
import { type InvoiceDrawersProps } from "./ErpInvoicesTab.drawers.type";

type DetailDrawerProps = Pick<
  InvoiceDrawersProps,
  | "direction"
  | "formHook"
  | "activeView"
  | "partnerViewMode"
  | "handleCloseInternal"
> & { t: TFunction<any, any> };

/** Drawer chi tiết hóa đơn nội bộ và hai hộp xác nhận xóa/hủy */
export function ErpInvoicesTabDetailDrawer({
  direction,
  formHook,
  activeView,
  partnerViewMode,
  handleCloseInternal,
  t,
}: DetailDrawerProps) {
  const isInternalOpen = formHook.internalDrawerOpen;
  const invoiceNo = formHook.detailInvoice?.invoiceNo;

  return (
    <>
      <ErpInvoiceInternalDrawer
        open={isInternalOpen}
        onClose={handleCloseInternal}
        editMode={formHook.editMode}
        detailInvoice={formHook.detailInvoice}
        activeTabKey={formHook.activeTabKey}
        onTabChange={formHook.setActiveTabKey}
        partnerViewMode={
          partnerViewMode || (activeView === "lines" ? "lines" : "details")
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
          isInternalOpen ? (
            <div className="flex flex-col gap-4">
              {formHook.loadingDetail ? (
                <div className="space-y-4">
                  <V2Skeleton className="h-[200px] w-full rounded-lg" />
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
          ) : undefined
        }
      >
        {isInternalOpen && (
          <div className="flex flex-col gap-4">
            {formHook.loadingDetail ? (
              <div className="space-y-4">
                <V2Skeleton className="h-[350px] w-full rounded-lg" />
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
                  form={formHook.form}
                  editMode={formHook.editMode}
                  fieldSet={formHook.fieldSet}
                  direction={direction}
                  postingState={formHook.postingState}
                  pendingUnpost={formHook.pendingUnpost}
                  onUnpost={() => formHook.setPendingUnpost(true)}
                  onRefreshDetail={formHook.handleSyncDetail}
                />
              </>
            )}
          </div>
        )}
      </ErpInvoiceInternalDrawer>

      <ConfirmModal
        open={formHook.deleteConfirm}
        onCancel={() => formHook.setDeleteConfirm(false)}
        title={t("deleteInvoiceTitle", "Xóa hóa đơn")}
        message={t("deleteInvoiceMessage", {
          defaultValue:
            "Bạn có chắc muốn xóa hóa đơn {{invoiceNo}}? Thao tác này không thể hoàn tác.",
          invoiceNo,
        })}
        confirmLabel={t("deleteInvoiceConfirm", "Xóa")}
        danger
        loading={formHook.saving}
        onConfirm={formHook.handleDelete}
      />

      <ConfirmModal
        open={formHook.cancelConfirm}
        onCancel={() => formHook.setCancelConfirm(false)}
        title={t("cancelInvoiceTitle", "Hủy hóa đơn")}
        message={t("cancelInvoiceMessage", {
          defaultValue: "Bạn có chắc muốn hủy hóa đơn {{invoiceNo}}?",
          invoiceNo,
        })}
        confirmLabel={t("cancelInvoiceConfirm", "Đồng ý hủy")}
        danger
        loading={formHook.saving}
        onConfirm={formHook.handleCancel}
      />
    </>
  );
}
