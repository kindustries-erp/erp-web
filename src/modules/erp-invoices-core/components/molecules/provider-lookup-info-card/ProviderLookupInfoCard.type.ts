import type { OriginalPdfLookupHint } from "../../../api/erpInvoicesCoreApi";

export interface ProviderLookupInfoCardProps {
  invoiceId: string;
  invoiceNo?: string;
  providerCode?: string | null;
  providerName?: string | null;
  lookupCode?: string | null;
  lookupUrl?: string | null;
  hints?: OriginalPdfLookupHint[];
  hasXml?: boolean;
  pdfFileKey?: string | null;
  pdfSource?: string | null;
  pdfError?: string | null;
  onDownloadPdf?: (invoiceId: string) => Promise<void> | void;
  isDownloading?: boolean;
  onUploadPdf?: (invoiceId: string, file: File) => Promise<void> | void;
  isUploading?: boolean;
  className?: string;
}
