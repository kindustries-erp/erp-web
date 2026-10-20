import React from "react";
import { useTranslation } from "react-i18next";
import { ExternalLink, FileText } from "lucide-react";
import { money, formatGMT7 } from "@/shared/utils/format";
import { cn } from "@/shared/utils";
import type { AdjustmentOriginalInvoiceCardProps } from "./AdjustmentOriginalInvoiceCard.type";

export const AdjustmentOriginalInvoiceCard: React.FC<
  AdjustmentOriginalInvoiceCardProps
> = ({
  relatedInvNo,
  relatedSerNo,
  originalInvoice,
  loading = false,
  onOpenInvoice,
  taxInvoiceStatus,
  className,
}) => {
  const { t } = useTranslation("erpInvoices");

  if (!relatedInvNo) {
    return (
      <div
        className={cn(
          "p-3 rounded-xl border border-dashed border-border/80 bg-muted/20 text-xs text-muted-foreground italic",
          className,
        )}
      >
        {t("Chưa ghi nhận số hóa đơn gốc.")}
      </div>
    );
  }

  const isReplacement = taxInvoiceStatus === 2;
  const label = isReplacement
    ? t("Hóa đơn gốc bị thay thế")
    : t("Hóa đơn gốc bị điều chỉnh");

  const invoiceId = originalInvoice?.id;
  const totalAmt = Number(originalInvoice?.totalAmount || 0);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onOpenInvoice(invoiceId, relatedInvNo)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          onOpenInvoice(invoiceId, relatedInvNo);
        }
      }}
      className={cn(
        "group p-3 rounded-xl border border-border/80 bg-surface/70 hover:bg-amber-50/40 dark:hover:bg-amber-950/20 hover:border-amber-300 dark:hover:border-amber-700 transition-all cursor-pointer text-left shadow-2xs hover:shadow-xs space-y-2",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
          {label}
        </span>
        <div className="flex items-center gap-1 text-xs font-medium text-amber-700 dark:text-amber-400 opacity-80 group-hover:opacity-100 transition-opacity">
          <span className="text-[11px] font-sans">{t("Mở chi tiết")}</span>
          <ExternalLink className="w-3 h-3" />
        </div>
      </div>

      <div className="flex items-baseline gap-1.5">
        <span className="font-mono font-bold text-base text-foreground group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors">
          #{relatedInvNo}
        </span>
        {relatedSerNo && (
          <span className="font-mono text-xs text-muted-foreground">
            ({relatedSerNo})
          </span>
        )}
      </div>

      {loading ? (
        <div className="text-[11px] text-muted-foreground italic pt-1 animate-pulse">
          {t("Đang tải thông tin...")}
        </div>
      ) : originalInvoice ? (
        <div className="pt-2 border-t border-border/60 text-xs flex items-center justify-between">
          <span className="text-muted-foreground font-sans text-[11px]">
            {originalInvoice.invoiceDate
              ? formatGMT7(originalInvoice.invoiceDate, "date")
              : "—"}
          </span>
          <span className="font-mono font-bold text-foreground">
            {money(totalAmt)}
          </span>
        </div>
      ) : (
        <div className="text-[11px] text-amber-600/80 dark:text-amber-400/80 italic pt-1">
          {t("Chưa có bản ghi số liệu chi tiết")}
        </div>
      )}
    </div>
  );
};

export default AdjustmentOriginalInvoiceCard;
