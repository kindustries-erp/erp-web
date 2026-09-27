import type {
  ErpInvoice,
  CreateErpInvoicePayload,
} from "../../api/erpInvoicesCoreApi";

export interface PendingAttachment {
  file: File;
  documentType: string;
}

export type DocumentTypeKey = "HOA_DON" | "HOP_DONG" | "BANG_KE" | "KHAC";

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

export interface InvoiceDocumentWorkspaceProps {
  detailInvoice: ErpInvoice | null;
  form?: CreateErpInvoicePayload;
  editMode?: boolean;
  fieldSet?: (key: string, value: unknown) => void;
  onLinkExistingAttachment?: (attachmentId: string) => void;
  onUnlinkAttachment?: (attachmentId: string) => void;
  onRefreshDetail?: () => void;
}
