export interface NormalizedInvoiceDocument {
  id: string;
  name: string;
  fileKey?: string;
  mimeType?: string;
  documentType?: string;
  size?: number;
  isLegacy?: boolean;
  isPending?: boolean;
  fileObj?: File;
  uploadedAt?: string;
  attachmentId?: string;
}

export interface InvoiceDocumentPreviewFrameProps {
  activeDoc: NormalizedInvoiceDocument | null;
  previewUrl: string | null;
  isLoading: boolean;
  onDownloadDoc: (doc: NormalizedInvoiceDocument) => void;
  onSwitchToTemplate?: () => void;
}
