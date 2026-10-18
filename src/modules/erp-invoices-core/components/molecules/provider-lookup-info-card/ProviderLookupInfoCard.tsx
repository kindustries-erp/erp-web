import React from "react";
import { useTranslation } from "react-i18next";
import {
  Building2,
  Copy,
  Check,
  ExternalLink,
  Download,
  Loader2,
} from "lucide-react";
import { Button } from "@/shared/components/ui/Button";
import { cn } from "@/shared/utils";
import { OriginalPdfStatusBadge } from "../../atoms/original-pdf-status-badge";
import { useProviderLookupInfoCard } from "./ProviderLookupInfoCard.hook";
import type { ProviderLookupInfoCardProps } from "./ProviderLookupInfoCard.type";

export const ProviderLookupInfoCard = React.memo(
  function ProviderLookupInfoCard({
    invoiceId,
    providerCode,
    providerName,
    lookupCode,
    lookupUrl,
    pdfFileKey,
    pdfSource,
    pdfError,
    onDownloadPdf,
    isDownloading,
    className,
  }: ProviderLookupInfoCardProps) {
    const { t } = useTranslation();
    const { copied, handleCopyCode, handleOpenPortal, handleTriggerDownload } =
      useProviderLookupInfoCard({
        lookupCode,
        lookupUrl,
        invoiceId,
        onDownloadPdf,
      });

    return (
      <div
        className={cn(
          "flex flex-col gap-2.5 rounded-lg border border-slate-200 bg-slate-50/70 p-3 text-sm dark:border-slate-800 dark:bg-slate-900/60",
          className,
        )}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 font-medium text-slate-800 dark:text-slate-100">
            <Building2 className="h-4 w-4 shrink-0 text-slate-500" />
            <span className="truncate">
              {providerName ||
                providerCode ||
                t("erpInvoice.provider", "Nhà cung cấp")}
            </span>
          </div>
          <OriginalPdfStatusBadge
            pdfFileKey={pdfFileKey}
            pdfSource={pdfSource}
            providerCode={providerCode}
            pdfError={pdfError}
          />
        </div>

        {lookupCode && (
          <div className="flex items-center justify-between gap-2 rounded-md bg-white px-2.5 py-1.5 border border-slate-200 dark:border-slate-800 dark:bg-slate-950">
            <span className="font-mono text-xs font-semibold text-slate-700 dark:text-slate-200 select-all truncate">
              {lookupCode}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleCopyCode}
              aria-label={t("erpInvoice.copyCode", "Sao chép mã tra cứu")}
              className="h-6 px-1.5 text-xs text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
              title={t("erpInvoice.copyCode", "Sao chép mã tra cứu")}
            >
              {copied ? (
                <Check className="h-3.5 w-3.5 text-emerald-600" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
              <span className="ml-1 text-[11px]">
                {copied
                  ? t("erpInvoice.copied", "Đã chép")
                  : t("erpInvoice.copy", "Chép")}
              </span>
            </Button>
          </div>
        )}

        <div className="flex items-center gap-2 pt-0.5">
          {lookupUrl && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleOpenPortal}
              className="flex-1 h-7 text-xs border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
              <span>{t("erpInvoice.openPortal", "Mở Cổng Tra Cứu")}</span>
            </Button>
          )}

          {onDownloadPdf && (
            <Button
              type="button"
              variant="primary"
              size="sm"
              disabled={isDownloading}
              onClick={handleTriggerDownload}
              className="flex-1 h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {isDownloading ? (
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              ) : (
                <Download className="mr-1.5 h-3.5 w-3.5" />
              )}
              <span>{t("erpInvoice.downloadOriginalPdf", "Tải PDF Gốc")}</span>
            </Button>
          )}
        </div>
      </div>
    );
  },
);
