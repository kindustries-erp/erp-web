import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";

interface UseProviderLookupInfoCardParams {
  lookupCode?: string | null;
  lookupUrl?: string | null;
  invoiceId: string;
  onDownloadPdf?: (invoiceId: string) => Promise<void> | void;
}

export function useProviderLookupInfoCard({
  lookupCode,
  lookupUrl,
  invoiceId,
  onDownloadPdf,
}: UseProviderLookupInfoCardParams) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  const handleCopyCode = useCallback(async () => {
    if (!lookupCode) return;
    try {
      await navigator.clipboard.writeText(lookupCode);
      setCopied(true);
      toast.success(
        t(
          "erpInvoice.copiedLookupCode",
          "Đã sao chép mã tra cứu vào bộ nhớ tạm",
        ),
      );
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error(t("erpInvoice.copyFailed", "Không thể sao chép mã tra cứu"));
    }
  }, [lookupCode, t]);

  const handleOpenPortal = useCallback(() => {
    if (!lookupUrl) return;
    const cleanUrl = lookupUrl.startsWith("http")
      ? lookupUrl
      : `https://${lookupUrl}`;
    window.open(cleanUrl, "_blank", "noopener,noreferrer");
  }, [lookupUrl]);

  const handleTriggerDownload = useCallback(async () => {
    if (!onDownloadPdf) return;
    try {
      await onDownloadPdf(invoiceId);
    } catch {
      // Error handled by parent or toast in callback
    }
  }, [invoiceId, onDownloadPdf]);

  return {
    copied,
    handleCopyCode,
    handleOpenPortal,
    handleTriggerDownload,
  };
}
