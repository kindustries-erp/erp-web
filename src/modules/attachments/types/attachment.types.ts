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

export const ATTACHMENT_TYPE_OPTIONS = [
  { value: "HOP_DONG", label: "Hợp đồng" },
  { value: "HOA_DON", label: "Hóa đơn" },
  { value: "BANG_KE", label: "Bảng kê" },
  { value: "KHAC", label: "Khác" },
];

export const ATTACHMENT_TYPE_LABEL: Record<string, string> = {
  HOP_DONG: "Hợp đồng",
  HOA_DON: "Hóa đơn",
  BANG_KE: "Bảng kê",
  KHAC: "Khác",
};

export function getAttachmentTypeLabel(
  type: string | null | undefined,
): string {
  if (!type) return "Khác";
  return ATTACHMENT_TYPE_LABEL[type] ?? type;
}

export const ATTACHMENT_MODULE_LABELS: Record<string, string> = {
  invoices: "Hóa đơn",
  purchases: "Mua hàng",
  sales: "Bán hàng",
  finance: "Kế toán",
  hr: "Nhân sự",
  inventory: "Kho",
};
