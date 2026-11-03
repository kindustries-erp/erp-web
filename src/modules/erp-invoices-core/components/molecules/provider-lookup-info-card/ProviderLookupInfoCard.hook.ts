import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";

interface UseProviderLookupInfoCardParams {
  lookupUrl?: string | null;
  invoiceId: string;
  onDownloadPdf?: (invoiceId: string) => Promise<void> | void;
}

export function useProviderLookupInfoCard({
  lookupUrl,
  invoiceId,
  onDownloadPdf,
}: UseProviderLookupInfoCardParams) {
  const { t } = useTranslation("erpInvoices");
  const [copiedValue, setCopiedValue] = useState<string | null>(null);

  const handleCopy = useCallback(
    async (value: string) => {
      try {
        await navigator.clipboard.writeText(value);
        setCopiedValue(value);
        toast.success(t("lookupCopied", "Đã sao chép vào bộ nhớ tạm"));
        setTimeout(() => setCopiedValue(null), 2000);
      } catch {
        toast.error(t("lookupCopyFailed", "Không thể sao chép"));
      }
    },
    [t],
  );

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
      // Lỗi đã được xử lý ở hook gọi (toast)
    }
  }, [invoiceId, onDownloadPdf]);

  return {
    copiedValue,
    handleCopy,
    handleOpenPortal,
    handleTriggerDownload,
  };
}
