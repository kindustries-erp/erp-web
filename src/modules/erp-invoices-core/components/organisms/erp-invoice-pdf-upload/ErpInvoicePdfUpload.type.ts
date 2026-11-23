export interface PendingAttachment {
  file: File;
  documentType: string;
}

/** Danh sách file đọc từ API V2 theo `invoiceId`; xóa chỉ đánh dấu chờ (UUID) và áp dụng khi lưu. */
export interface ErpInvoicePdfUploadProps {
  invoiceId: string | null;
  editMode: boolean;
  pendingDeletedPdfs?: string[];
  onPendingDeletePdf?: (id: string) => void;
  pendingAddedAttachments?: PendingAttachment[];
  onPendingAddedAttachmentsChange?: (files: PendingAttachment[]) => void;
  noCard?: boolean;
}
