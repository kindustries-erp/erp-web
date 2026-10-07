import React from "react";
import { useTranslation } from "react-i18next";
import { CheckCircle2, AlertCircle, FileText } from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";
import { Tooltip } from "@/core/components/ui/Tooltip";
import { cn } from "@/shared/utils";
import type { OriginalPdfStatusBadgeProps } from "./OriginalPdfStatusBadge.type";

export const OriginalPdfStatusBadge = React.memo(
  function OriginalPdfStatusBadge({
    pdfFileKey,
    pdfSource,
    providerCode,
    pdfError,
    className,
  }: OriginalPdfStatusBadgeProps) {
    const { t } = useTranslation();

    if (pdfFileKey && pdfSource === "provider_original") {
      const tooltip = t(
        "erpInvoice.originalPdfSuccessTooltip",
        "PDF gốc chính thức có chữ ký số từ {{provider}}",
        { provider: providerCode || t("erpInvoice.provider", "nhà cung cấp") },
      );
      return (
        <Tooltip content={tooltip}>
          <Badge
            className={cn(
              "inline-flex items-center gap-1 border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-800/40 dark:bg-emerald-950/40 dark:text-emerald-300",
              className,
            )}
          >
            <CheckCircle2 className="h-3 w-3 shrink-0" />
            <span>
              {providerCode
                ? `${providerCode} PDF`
                : t("erpInvoice.originalPdfBadge", "PDF gốc")}
            </span>
          </Badge>
        </Tooltip>
      );
    }

    if (pdfFileKey) {
      return (
        <Tooltip
          content={t(
            "erpInvoice.manualPdfTooltip",
            "Tệp PDF đính kèm thủ công",
          )}
        >
          <Badge
            className={cn(
              "inline-flex items-center gap-1 border-slate-300 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300",
              className,
            )}
          >
            <FileText className="h-3 w-3 shrink-0" />
            <span>{t("erpInvoice.manualPdfBadge", "PDF tải lên")}</span>
          </Badge>
        </Tooltip>
      );
    }

    const isFailed = pdfSource === "failed";
    const failTooltip =
      pdfError ||
      t(
        "erpInvoice.originalPdfFailedTooltip",
        "Chưa tải được PDF gốc. Bấm để mở portal tra cứu.",
      );

    return (
      <Tooltip content={failTooltip}>
        <Badge
          className={cn(
            isFailed
              ? "inline-flex items-center gap-1 border-rose-300 bg-rose-50 text-rose-700 dark:border-rose-800/40 dark:bg-rose-950/40 dark:text-rose-300"
              : "inline-flex items-center gap-1 border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-800/40 dark:bg-amber-950/40 dark:text-amber-300",
            className,
          )}
        >
          <AlertCircle className="h-3 w-3 shrink-0" />
          <span>
            {isFailed
              ? t("erpInvoice.missingPdfBadge", "Lỗi tải PDF")
              : t("erpInvoice.noPdfBadge", "Chưa có PDF")}
          </span>
        </Badge>
      </Tooltip>
    );
  },
);
