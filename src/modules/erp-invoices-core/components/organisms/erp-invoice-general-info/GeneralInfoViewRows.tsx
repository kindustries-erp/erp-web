import React from "react";
import { useTranslation } from "react-i18next";
import { Hash, Barcode, Building2, CreditCard } from "lucide-react";
import { CopyButton } from "@/shared/components/CopyButton";

export function InvoiceNumberHeaderRow({
  invoiceNo,
  serialNo,
}: {
  invoiceNo: string;
  serialNo: string;
}) {
  const { t } = useTranslation("erpInvoices");

  return (
    <div className="grid grid-cols-2 gap-2 pb-2 border-b border-border/50">
      <div>
        <div className="text-xs text-muted-foreground mb-0.5">
          {t("invoiceNo", "Số hóa đơn")}
        </div>
        <div className="flex items-center justify-between gap-1 font-mono font-semibold text-foreground text-xs">
          <div className="flex items-center gap-1 min-w-0">
            <Hash className="w-3.5 h-3.5 text-muted-foreground/70 shrink-0" />
            <span className="truncate">{invoiceNo || "—"}</span>
          </div>
          {invoiceNo && (
            <CopyButton
              value={invoiceNo}
              tooltip={t("copyInvoiceNo", "Copy số HĐ")}
              copiedTooltip={t("copied", "Đã copy")}
              toastMessage={t("copiedInvoiceNo", "Đã copy số HĐ")}
              toastId="invoice-no-copy"
              className="p-0.5 text-muted-foreground hover:text-primary transition-colors shrink-0"
            />
          )}
        </div>
      </div>

      <div>
        <div className="text-xs text-muted-foreground mb-0.5">
          {t("serialNo", "Ký hiệu")}
        </div>
        <div className="flex items-center gap-1 font-mono font-medium text-foreground text-xs">
          <Barcode className="w-3.5 h-3.5 text-muted-foreground/70 shrink-0" />
          <span>{serialNo || "—"}</span>
        </div>
      </div>
    </div>
  );
}

export function InvoicePartnerInfoRow({
  isInvoiceIn,
  partnerName,
  partnerTaxCode,
}: {
  isInvoiceIn: boolean;
  partnerName?: string;
  partnerTaxCode?: string;
}) {
  const { t } = useTranslation("erpInvoices");

  return (
    <>
      <div>
        <div className="text-xs text-muted-foreground mb-0.5">
          {isInvoiceIn ? t("seller", "Nhà cung cấp") : t("buyer", "Khách hàng")}
        </div>
        {partnerName ? (
          <div className="flex items-start justify-between gap-1.5 font-medium text-foreground text-xs">
            <div className="flex items-start gap-1.5 min-w-0">
              <Building2 className="w-3.5 h-3.5 mt-0.5 shrink-0 text-muted-foreground/70" />
              <span className="break-words leading-relaxed">{partnerName}</span>
            </div>
            <CopyButton
              value={partnerName}
              tooltip={t("copyName", "Copy tên")}
              copiedTooltip={t("copied", "Đã copy")}
              toastMessage={t("copiedName", "Đã copy tên đối tác")}
              toastId="invoice-partner-name-copy"
              className="p-0.5 text-muted-foreground hover:text-primary transition-colors shrink-0"
            />
          </div>
        ) : (
          <div className="flex items-start gap-1.5 font-medium text-muted-foreground/60 text-xs">
            <Building2 className="w-3.5 h-3.5 mt-0.5 shrink-0 text-muted-foreground/40" />
            <span>—</span>
          </div>
        )}
      </div>

      {partnerTaxCode && (
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <CreditCard className="w-3.5 h-3.5 text-muted-foreground/70 shrink-0" />
            <span>{t("taxCode", "Mã số thuế")}:</span>
          </div>
          <div className="flex items-center gap-1 font-mono font-medium text-foreground">
            <span>{partnerTaxCode}</span>
            <CopyButton
              value={partnerTaxCode}
              tooltip={t("copyTax", "Copy MST")}
              copiedTooltip={t("copied", "Đã copy")}
              toastMessage={t("copiedTax", "Đã copy MST")}
              toastId="invoice-partner-tax-copy"
              className="p-0.5 text-muted-foreground hover:text-primary transition-colors shrink-0"
            />
          </div>
        </div>
      )}
    </>
  );
}
