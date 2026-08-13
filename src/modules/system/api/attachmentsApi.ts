import axiosInstance, { API_BASE_URL } from "@/core/api/axiosInstance";

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

export async function getAttachmentsPagedApi(params: {
  page?: number;
  pageSize?: number;
  search?: string;
  documentType?: string;
  sort?: string[];
  dateFrom?: string;
  dateTo?: string;
  filtersStr?: string;
}): Promise<AttachmentPagedResponse> {
  const query = new URLSearchParams();
  if (params.page) query.append("page", String(params.page));
  if (params.pageSize) query.append("pageSize", String(params.pageSize));
  if (params.search) query.append("search", params.search);
  if (params.documentType) query.append("documentType", params.documentType);
  if (params.sort) query.append("sort", params.sort.join(","));
  if (params.dateFrom) query.append("dateFrom", params.dateFrom);
  if (params.dateTo) query.append("dateTo", params.dateTo);

  const { data } = await axiosInstance.get(`/api/v1/erp-attachments`, {
    params: {
      page: params.page,
      pageSize: params.pageSize,
      search: params.search,
      document_type: params.documentType,
      sort: params.sort?.join(","),
      dateFrom: params.dateFrom,
      dateTo: params.dateTo,
      filtersStr: params.filtersStr,
    },
  });
  return data;
}

export async function getAttachmentOptionsApi(params: {
  columnKey: string;
  search: string;
  pageParam: number;
  filtersStr?: string;
}): Promise<{
  items: { label: string; value: string }[];
  total: number;
  next: number | null;
}> {
  const pageSize = 50;
  const { data } = await axiosInstance.get(
    `/api/v1/erp-attachments/column-options`,
    {
      params: {
        column: params.columnKey,
        search: params.search,
        page: params.pageParam,
        pageSize,
        column_filters: params.filtersStr,
      },
    },
  );
  return {
    items: data.items,
    total: data.total,
    next: data.page < data.totalPages ? data.page + 1 : null,
  };
}

export async function uploadAttachmentApi(
  files: File[],
  documentType?: string,
  module?: string,
): Promise<{ success: boolean; attachments: ErpAttachment[] }> {
  const formData = new FormData();
  files.forEach((f) => formData.append("files", f));
  if (documentType) formData.append("documentType", documentType);
  if (module) {
    formData.append("module", module);
  }

  const { data } = await axiosInstance.post(
    "/api/v1/erp-attachments/upload",
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    },
  );
  return data;
}

export async function deleteAttachmentApi(id: string): Promise<void> {
  await axiosInstance.delete(`/api/v1/erp-attachments/${id}`);
}

export function getFileViewUrl(attachmentId: string): string {
  return `${API_BASE_URL}/api/v1/erp-attachments/${encodeURIComponent(attachmentId)}/content`;
}

export async function getAttachmentContentBlobApi(
  attachmentId: string,
): Promise<Blob> {
  const { data } = await axiosInstance.get(
    `/api/v1/erp-attachments/${encodeURIComponent(attachmentId)}/content`,
    { responseType: "blob" },
  );
  return data;
}

export async function getAttachmentDownloadUrlApi(
  id: string,
  inline?: boolean,
): Promise<{ url: string }> {
  const { data } = await axiosInstance.get(
    `/api/v1/erp-attachments/${id}/download-url`,
    { params: { inline: inline ? "true" : undefined } },
  );
  return data;
}
