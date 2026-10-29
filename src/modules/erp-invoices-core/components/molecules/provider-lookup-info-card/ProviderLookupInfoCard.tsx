import React from "react";
import { useTranslation } from "react-i18next";
import { Building2, ExternalLink, Download } from "lucide-react";
import { DrawerSection, V2Button } from "@/v2/shared/components";
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
      <DrawerSection
        title={
          <span className="inline-flex items-center gap-1.5 truncate">
            <Building2 className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <span>
              {providerName ||
                providerCode ||
                t("lookupProvider", "Nhà cung cấp")}
            </span>
          </span>
        }
        titleExtra={
          <OriginalPdfStatusBadge
            pdfFileKey={pdfFileKey}
            pdfSource={pdfSource}
            providerCode={providerCode}
            pdfError={pdfError}
          />
        }
        collapsible={true}
        defaultCollapsed={false}
        className={className}
      >
        <div className="flex flex-col gap-2.5 pt-1 text-sm">
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
              <V2Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleOpenPortal}
                className="h-7 flex-1 text-xs"
                leftIcon={<ExternalLink className="h-3.5 w-3.5" />}
              >
                <span>{t("lookupOpenPortal", "Mở cổng tra cứu")}</span>
              </V2Button>
            )}

            {onDownloadPdf && (
              <V2Button
                type="button"
                variant="primary"
                size="sm"
                isLoading={isDownloading}
                onClick={handleTriggerDownload}
                className="h-7 flex-1 bg-emerald-600 text-xs text-white hover:bg-emerald-700"
                leftIcon={<Download className="h-3.5 w-3.5" />}
              >
                <span>{t("lookupDownloadPdf", "Tải PDF gốc")}</span>
              </V2Button>
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
      </DrawerSection>
    );
  },
);
