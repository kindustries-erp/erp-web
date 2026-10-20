import React from "react";
import { useTranslation } from "react-i18next";
import { RefreshCw, FileCheck2, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/shared/components/ui/Dialog";
import { Button } from "@/shared/components/ui/Button";
import { Input } from "@/shared/components/ui/input";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { useInvoiceSyncAdvancedModal } from "./InvoiceSyncAdvancedModal.hook";
import type { InvoiceSyncAdvancedModalProps } from "./InvoiceSyncAdvancedModal.type";

export const InvoiceSyncAdvancedModal = React.memo(
  function InvoiceSyncAdvancedModal({
    open,
    onClose,
    defaultCompanyTaxCode,
    onSuccess,
  }: InvoiceSyncAdvancedModalProps) {
    const { t } = useTranslation();
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
                {t(
                  "erpInvoice.advancedSyncTitle",
                  "Đồng Bộ Hóa Đơn & Tải PDF Gốc",
                )}
              </span>
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              {t(
                "erpInvoice.advancedSyncDesc",
                "Đồng bộ từ GDT và tự động tải PDF gốc có chữ ký số từ nhà cung cấp.",
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-3.5 py-2 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="font-medium text-slate-700 dark:text-slate-300">
                  {t("erpInvoice.taxCode", "Mã số thuế")} *
                </label>
                <Input
                  value={formValues.companyTaxCode}
                  onChange={(e) =>
                    handleFieldChange("companyTaxCode", e.target.value)
                  }
                  placeholder="VD: 0101234567"
                  className="h-8 text-xs font-mono"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="font-medium text-slate-700 dark:text-slate-300">
                  {t("erpInvoice.syncType", "Loại hóa đơn")}
                </label>
                <select
                  value={formValues.syncType}
                  onChange={(e) =>
                    handleFieldChange(
                      "syncType",
                      e.target.value as "purchase" | "sold",
                    )
                  }
                  className="h-8 rounded-md border border-slate-300 bg-white px-2 text-xs dark:border-slate-700 dark:bg-slate-900"
                >
                  <option value="purchase">
                    {t("erpInvoice.purchase", "Hóa đơn mua vào")}
                  </option>
                  <option value="sold">
                    {t("erpInvoice.sold", "Hóa đơn bán ra")}
                  </option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="font-medium text-slate-700 dark:text-slate-300">
                  {t("erpInvoice.fromDate", "Từ ngày")}
                </label>
                <Input
                  type="date"
                  value={formValues.fromDate}
                  onChange={(e) =>
                    handleFieldChange("fromDate", e.target.value)
                  }
                  className="h-8 text-xs"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="font-medium text-slate-700 dark:text-slate-300">
                  {t("erpInvoice.toDate", "Đến ngày")}
                </label>
                <Input
                  type="date"
                  value={formValues.toDate}
                  onChange={(e) => handleFieldChange("toDate", e.target.value)}
                  className="h-8 text-xs"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50/80 p-2.5 dark:border-slate-800 dark:bg-slate-900/60">
              <Checkbox
                id="download-original-pdf"
                checked={formValues.downloadOriginalPdf}
                onCheckedChange={(checked) =>
                  handleFieldChange("downloadOriginalPdf", !!checked)
                }
              />
              <label
                htmlFor="download-original-pdf"
                className="text-xs font-medium text-slate-700 dark:text-slate-200 cursor-pointer"
              >
                {t(
                  "erpInvoice.autoDownloadOriginalPdf",
                  "Tự động tải PDF gốc nhà cung cấp (VinFast, MISA, Viettel...)",
                )}
              </label>
            </div>

            {syncStatus && (
              <div className="rounded-md border border-emerald-200 bg-emerald-50/80 p-2.5 text-xs text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-950/40 dark:text-emerald-300">
                <div className="flex items-center gap-1.5 font-medium">
                  <FileCheck2 className="h-4 w-4 shrink-0 text-emerald-600" />
                  <span>
                    {t(
                      "erpInvoice.syncTaskCreated",
                      "Đã tạo tiến trình đồng bộ",
                    )}
                    : {syncStatus.id.slice(0, 8)}...
                  </span>
                </div>
                <div className="mt-1 flex items-center justify-between text-[11px] text-emerald-700 dark:text-emerald-400">
                  <span>
                    {t("erpInvoice.totalFound", "Tìm thấy")}:{" "}
                    {syncStatus.totalFound}
                  </span>
                  <span>
                    {t("erpInvoice.pdfSuccess", "PDF thành công")}:{" "}
                    {syncStatus.totalPdfSuccess}
                  </span>
                  <span>
                    {t("erpInvoice.pdfFailed", "Thất bại")}:{" "}
                    {syncStatus.totalPdfFailed}
                  </span>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              {t("common.cancel", "Hủy")}
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
              <span>{t("erpInvoice.startSync", "Bắt Đầu Đồng Bộ")}</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  },
);
