import axiosInstance from "@/core/api/axiosInstance";

export interface ErpInvoiceItem {
  id?: string;
  invoiceId?: string;
  description?: string;
  preVatAmount: number | string;
  vatRate?: number | string | null;
  vatAmount: number | string;
  discountAmount: number | string;
  totalAmount: number | string;
}

export interface ErpInvoice {
  id: string;
  invoiceNo: string;
  serialNo?: string | null;
  invoiceDate: string;
  direction: "IN" | "OUT";
  status: string;
  sellerName?: string | null;
  sellerTaxCode?: string | null;
  sellerAddress?: string | null;
  sellerBank?: string | null;
  buyerName?: string | null;
  buyerTaxCode?: string | null;
  buyerAddress?: string | null;
  description?: string | null;
  preVatAmount: string;
  vatRate?: string | null;
  vatAmount: string;
  discountAmount: string;
  totalAmount: string;
  purchaseOrderId?: string | null;
  salesOrderId?: string | null;
  paymentDocumentNos?: string | null;
  notes?: string | null;
  // R2 Storage
  pdfFileKey?: string | null;
  xmlFileKey?: string | null;
  xmlImportId?: string | null;
  createdAt?: string;
  updatedAt?: string;
  items?: ErpInvoiceItem[];
}

export interface CreateErpInvoicePayload {
  invoiceNo: string;
  serialNo?: string;
  invoiceDate: string;
  direction: "IN" | "OUT";
  status?: string;
  sellerName?: string;
  sellerTaxCode?: string;
  sellerAddress?: string;
  sellerBank?: string;
  buyerName?: string;
  buyerTaxCode?: string;
  buyerAddress?: string;
  description?: string;
  preVatAmount?: number;
  vatRate?: number;
  vatAmount?: number;
  discountAmount?: number;
  totalAmount?: number;
  purchaseOrderId?: string;
  salesOrderId?: string;
  paymentDocumentNos?: string;
  notes?: string;
  items?: ErpInvoiceItem[];
}

export type UpdateErpInvoicePayload = Partial<CreateErpInvoicePayload>;

export interface ErpInvoiceListParams {
  direction?: "IN" | "OUT";
  search?: string;
  date_from?: string;
  date_to?: string;
  status?: string;
  page?: number;
  pageSize?: number;
  sort_by?: string;
  sort_order?: "asc" | "desc";
}

export interface ErpInvoiceListResponse {
  items: ErpInvoice[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

const BASE = "/api/v1/erp-invoices";

export const erpInvoicesCoreApi = {
  list: async (
    params?: ErpInvoiceListParams,
  ): Promise<ErpInvoiceListResponse> => {
    const { data } = await axiosInstance.get<ErpInvoiceListResponse>(BASE, {
      params,
    });
    return data;
  },

  get: async (id: string): Promise<ErpInvoice> => {
    const { data } = await axiosInstance.get<{ data: ErpInvoice }>(
      `${BASE}/${id}`,
    );
    return data.data;
  },

  create: async (payload: CreateErpInvoicePayload): Promise<ErpInvoice> => {
    const { data } = await axiosInstance.post<{ data: ErpInvoice }>(
      BASE,
      payload,
    );
    return data.data;
  },

  update: async (
    id: string,
    payload: UpdateErpInvoicePayload,
  ): Promise<ErpInvoice> => {
    const { data } = await axiosInstance.patch<{ data: ErpInvoice }>(
      `${BASE}/${id}`,
      payload,
    );
    return data.data;
  },

  remove: async (id: string): Promise<void> => {
    await axiosInstance.delete(`${BASE}/${id}`);
  },

  cancel: async (id: string): Promise<ErpInvoice> => {
    const { data } = await axiosInstance.post<{ data: ErpInvoice }>(
      `${BASE}/${id}/cancel`,
    );
    return data.data;
  },

  // ---------------------------------------------------------------------------
  // Bulk XML import
  // ---------------------------------------------------------------------------

  bulkImportBuyerXml: async (files: File[]): Promise<BulkImportResult> => {
    const formData = new FormData();
    files.forEach((f) => formData.append("files", f));
    const { data } = await axiosInstance.post<BulkImportResult>(
      `${BASE}/bulk-import-xml/buyer`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
    return data;
  },

  bulkImportSellerXml: async (files: File[]): Promise<BulkImportResult> => {
    const formData = new FormData();
    files.forEach((f) => formData.append("files", f));
    const { data } = await axiosInstance.post<BulkImportResult>(
      `${BASE}/bulk-import-xml/seller`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
    return data;
  },

  // ---------------------------------------------------------------------------
  // Pre-signed URLs
  // ---------------------------------------------------------------------------

  getDownloadUrl: async (
    id: string,
    type: "pdf" | "xml",
  ): Promise<{ url: string; expiresAt: string }> => {
    const { data } = await axiosInstance.get<{
      url: string;
      expiresAt: string;
    }>(`${BASE}/${id}/download-url`, { params: { type } });
    return data;
  },

  getUploadUrl: async (
    id: string,
    fileType: "pdf" | "xml",
  ): Promise<{ url: string; key: string; expiresAt: string }> => {
    const { data } = await axiosInstance.post<{
      url: string;
      key: string;
      expiresAt: string;
    }>(`${BASE}/${id}/upload-url`, { fileType });
    return data;
  },
};

// ---------------------------------------------------------------------------
// Bulk Import types
// ---------------------------------------------------------------------------

export interface BulkImportSkippedItem {
  filename: string;
  invoiceNo: string;
  sellerName: string | null;
  sellerTaxCode: string | null;
  reason: "DUPLICATE";
}

export interface BulkImportErrorItem {
  filename: string;
  reason: string;
}

export interface BulkImportResult {
  importId: string;
  direction: "IN" | "OUT";
  total: number;
  created: number;
  skipped: BulkImportSkippedItem[];
  errors: BulkImportErrorItem[];
}
