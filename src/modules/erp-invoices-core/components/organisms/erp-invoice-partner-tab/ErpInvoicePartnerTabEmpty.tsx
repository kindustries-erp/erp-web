import React from "react";
import { AlertCircle } from "lucide-react";
import { useTranslation } from "react-i18next";

export interface ErpInvoicePartnerTabEmptyProps {
  className?: string;
  title?: string;
  description?: string;
}

export const ErpInvoicePartnerTabEmpty = React.memo(
  function ErpInvoicePartnerTabEmpty({
    className = "",
    title,
    description,
  }: ErpInvoicePartnerTabEmptyProps) {
    const { t } = useTranslation("erpInvoices");

    return (
      <div
        className={`p-8 text-center bg-surface/50 rounded-xl border border-border/70 flex flex-col items-center justify-center gap-3 ${className}`}
      >
        <AlertCircle className="w-8 h-8 text-muted-foreground/60" />
        <div className="text-sm font-medium text-foreground">
          {title ?? t("noPartnerInfo", "Không có thông tin đối tác")}
        </div>
        <p className="text-xs text-muted-foreground max-w-sm">
          {description ??
            t(
              "noPartnerInfoDesc",
              "Hóa đơn này chưa có tên hoặc Mã số thuế đối tác để tra cứu lịch sử giao dịch liên quan.",
            )}
        </p>
      </div>
    );
  },
);
