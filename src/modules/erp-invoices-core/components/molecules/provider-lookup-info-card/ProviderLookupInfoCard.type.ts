export interface ProviderLookupInfoCardProps {
  invoiceId: string;
  invoiceNo: string;
  providerCode?: string | null;
  providerName?: string | null;
  lookupCode?: string | null;
  lookupUrl?: string | null;
  pdfFileKey?: string | null;
  pdfSource?: string | null;
  pdfError?: string | null;
  onDownloadPdf?: (invoiceId: string) => Promise<void> | void;
  isDownloading?: boolean;
  className?: string;
}
