import React from "react";
import { useTranslation } from "react-i18next";
import { Building2, ExternalLink, Download, Loader2 } from "lucide-react";
import { Button } from "@/shared/components/ui/Button";
import { cn } from "@/shared/utils";
import { OriginalPdfStatusBadge } from "../../atoms/original-pdf-status-badge";
import { useProviderLookupInfoCard } from "./ProviderLookupInfoCard.hook";
import { LookupHintRow } from "./LookupHintRow";
import { ManualPdfUploadButton } from "./ManualPdfUploadButton";
import type { ProviderLookupInfoCardProps } from "./ProviderLookupInfoCard.type";

export const ProviderLookupInfoCard = React.memo(
  function ProviderLookupInfoCard({
    invoiceId,
    providerCode,
    providerName,
    lookupCode,
    lookupUrl,
    hints = [],
    hasXml = true,
    pdfFileKey,
    pdfSource,
    pdfError,
    onDownloadPdf,
    isDownloading,
    onUploadPdf,
    isUploading,
    className,
  }: ProviderLookupInfoCardProps) {
    const { t } = useTranslation("erpInvoices");
    const { copiedValue, handleCopy, handleOpenPortal, handleTriggerDownload } =
      useProviderLookupInfoCard({ lookupUrl, invoiceId, onDownloadPdf });

    const codeRows = [
      ...(lookupCode
        ? [{ label: t("lookupCode", "Mã tra cứu"), value: lookupCode }]
        : []),
      ...hints.map((h) => ({ label: h.label, value: h.value })),
    ];

    return (
      <div
        className={cn(
          "flex flex-col gap-2.5 rounded-lg border border-slate-200 bg-slate-50/70 p-3 text-sm dark:border-slate-800 dark:bg-slate-900/60",
          className,
        )}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-1.5 font-medium text-slate-800 dark:text-slate-100">
            <Building2 className="h-4 w-4 shrink-0 text-slate-500" />
            <span className="truncate">
              {providerName ||
                providerCode ||
                t("lookupProvider", "Nhà cung cấp")}
            </span>
          </div>
          <OriginalPdfStatusBadge
            pdfFileKey={pdfFileKey}
            pdfSource={pdfSource}
            providerCode={providerCode}
            pdfError={pdfError}
          />
        </div>

        {!hasXml && (
          <p className="text-xs text-amber-700 dark:text-amber-400">
            {t(
              "lookupNoXml",
              "Chưa có file XML trên hệ thống, chỉ tra cứu thủ công được",
            )}
          </p>
        )}

        {codeRows.map((row) => (
          <LookupHintRow
            key={`${row.label}-${row.value}`}
            label={row.label}
            value={row.value}
            copied={copiedValue === row.value}
            onCopy={handleCopy}
          />
        ))}

        <div className="flex flex-wrap items-center gap-2 pt-0.5">
          {lookupUrl && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleOpenPortal}
              className="h-7 flex-1 text-xs"
            >
              <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
              <span>{t("lookupOpenPortal", "Mở cổng tra cứu")}</span>
            </Button>
          )}

          {onDownloadPdf && (
            <Button
              type="button"
              variant="primary"
              size="sm"
              disabled={isDownloading}
              onClick={handleTriggerDownload}
              className="h-7 flex-1 bg-emerald-600 text-xs text-white hover:bg-emerald-700"
            >
              {isDownloading ? (
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              ) : (
                <Download className="mr-1.5 h-3.5 w-3.5" />
              )}
              <span>{t("lookupDownloadPdf", "Tải PDF gốc")}</span>
            </Button>
          )}

          {onUploadPdf && (
            <ManualPdfUploadButton
              invoiceId={invoiceId}
              onUpload={onUploadPdf}
              isUploading={isUploading}
            />
          )}
        </div>
        {onUploadPdf && (
          <p className="text-[11px] text-slate-500">
            {t(
              "lookupUploadHint",
              "Tải PDF từ cổng nhà cung cấp, rồi tải lên đây để hệ thống ghi nhận",
            )}
          </p>
        )}
      </div>
    );
  },
);
