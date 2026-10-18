import { type FileEntry } from "@/modules/erp-invoices-core/hooks/useInvoiceXmlUpload";

export interface InvoiceXmlImportModalProps {
  open: boolean;
  files: FileEntry[];
  direction: "IN" | "OUT";
  onConfirm: (
    selectedFiles: FileEntry[],
    manualMatches: Record<string, string>,
  ) => void;
  onCancel: () => void;
}

export type ImportPreviewModalProps = InvoiceXmlImportModalProps;
