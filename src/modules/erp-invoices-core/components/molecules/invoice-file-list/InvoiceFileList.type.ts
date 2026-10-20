import { type NormalizedInvoiceDocument } from "../invoice-document-preview-frame";

export type { NormalizedInvoiceDocument };

export interface InvoiceFileListProps {
  documents: NormalizedInvoiceDocument[];
  activeDocId: string | null;
  onSelectDoc: (id: string) => void;
  onDownloadDoc: (doc: NormalizedInvoiceDocument) => void;
  onDeleteDoc: (doc: NormalizedInvoiceDocument) => void;
}
