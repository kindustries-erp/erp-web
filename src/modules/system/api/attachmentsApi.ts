/** Chỉ còn kiểu dữ liệu: client V1 `erp-attachments` đã gỡ, file hóa đơn dùng `invoiceFilesV2Api`. */

export interface ErpAttachment {
  id: string;
  fileName: string;
  fileKey: string;
  fileSize: number;
  mimeType: string;
  documentType: string;
  module?: string;
  createdAt: string;
  invoiceLinks?: {
    invoice?: { id: string; invoiceNo: string; direction: "IN" | "OUT" };
  }[];
  _isLegacy?: boolean;
}

export interface AttachmentPagedResponse {
  items: ErpAttachment[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
