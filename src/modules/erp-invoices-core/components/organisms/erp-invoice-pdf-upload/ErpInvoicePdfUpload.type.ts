export interface PendingAttachment {
  file: File;
  documentType: string;
}

export interface ErpInvoicePdfUploadProps {
  invoiceId: string | null;
  attachments: { attachmentId: string; attachment: any }[] | null;
  pdfFileKey?: string | null;
  pdfFiles?: Array<{
    key: string;
    filename: string;
    uploadedAt: string;
  }> | null;
  editMode: boolean;
  pendingDeletedPdfs?: string[];
  onPendingDeletePdf?: (key: string) => void;
  pendingAddedAttachments?: PendingAttachment[];
  onPendingAddedAttachmentsChange?: (files: PendingAttachment[]) => void;
  onLinkExistingAttachment?: (attachmentId: string) => void;
  onUnlinkAttachment?: (attachmentId: string) => void;
  noCard?: boolean;
}
