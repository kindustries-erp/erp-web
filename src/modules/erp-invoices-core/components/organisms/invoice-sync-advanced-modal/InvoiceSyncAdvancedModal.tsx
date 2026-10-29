import React from "react";
import { useTranslation } from "react-i18next";
import { RefreshCw, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/shared/components/ui/Dialog";
import { Button } from "@/shared/components/ui/Button";
import { SyncFormFields } from "@/modules/erp-invoices-core/components/molecules/sync-form-fields";
import { SyncStatusSummary } from "@/modules/erp-invoices-core/components/molecules/sync-status-summary";
import { useInvoiceSyncAdvancedModal } from "./InvoiceSyncAdvancedModal.hook";
import type { InvoiceSyncAdvancedModalProps } from "./InvoiceSyncAdvancedModal.type";

/** Modal đồng bộ hóa đơn GDT và tải PDF gốc nhà cung cấp */
export const InvoiceSyncAdvancedModal = React.memo(
  function InvoiceSyncAdvancedModal({
    open,
    onClose,
    defaultCompanyTaxCode,
    onSuccess,
  }: InvoiceSyncAdvancedModalProps) {
    const { t } = useTranslation("erpInvoices");
    const {
      formValues,
      isSubmitting,
      syncStatus,
      handleFieldChange,
      handleSubmit,
      handleClose,
    } = useInvoiceSyncAdvancedModal({
      open,
      defaultCompanyTaxCode,
      onClose,
      onSuccess,
    });

    return (
      <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
        <DialogContent className="max-w-lg p-5">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-semibold text-slate-900 dark:text-slate-100">
              <RefreshCw className="h-4 w-4 text-emerald-600" />
              <span>
                {t("advancedSyncTitle", "Đồng Bộ Hóa Đơn & Tải PDF Gốc")}
              </span>
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              {t(
                "advancedSyncDesc",
                "Đồng bộ từ GDT và tự động tải PDF gốc có chữ ký số từ nhà cung cấp.",
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-3.5 py-2 text-xs">
            <SyncFormFields
              values={formValues}
              onFieldChange={handleFieldChange}
            />
            {syncStatus && <SyncStatusSummary status={syncStatus} />}
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              {t("advancedSyncCancel", "Hủy")}
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {isSubmitting ? (
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              ) : (
                <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
              )}
              <span>{t("advancedSyncStart", "Bắt Đầu Đồng Bộ")}</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  },
);
