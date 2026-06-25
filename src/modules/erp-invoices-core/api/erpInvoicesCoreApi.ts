import axiosInstance from "@/core/api/axiosInstance";

export interface ErpInvoiceItem {
  id?: string;
  invoiceId?: string;
  description?: string;
  unit?: string;
  quantity?: number;
  unitPrice?: number;
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
  source?: string | null;
  sellerName?: string | null;
  sellerTaxCode?: string | null;
  sellerAddress?: string | null;
  sellerBank?: string | null;
  buyerName?: string | null;
  buyerTaxCode?: string | null;
  buyerAddress?: string | null;
  description?: string | null;
  invoiceType?: string | null;
  preVatAmount: string;
  vatRate?: string | null;
  vatAmount: string;
  discountAmount: string;
  totalAmount: string;
  purchaseOrderId?: string | null;
  salesOrderId?: string | null;
  paymentDocumentNos?: string | null;
  notes?: string | null;
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
  unit?: string;
  quantity?: number;
  unitPrice?: number;
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
  seller_name?: string;
  buyer_name?: string;
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

export interface PortalInvoiceDto {
  shdon: string;
  khhdon?: string | null;
  tdlap?: string | null;
  nbten?: string | null;
  nbmst?: string | null;
  tgtcthue?: string | number | null;
  tgtthue?: string | number | null;
  tgtttbso?: string | number | null;
  tthai?: number | string | null;
  direction?: "IN" | "OUT";
}

export interface PortalSyncPayload {
  token: string;
  dateFrom: string;
  dateTo: string;
  type: "purchase" | "sold";
}

export interface PortalSyncResult {
  total: number;
  imported: number;
  skipped: number;
  direction: "IN" | "OUT";
  errors?: string[];
  xmlDownloadQueued: number;
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

  reparseXml: async (id: string, token?: string): Promise<ErpInvoice> => {
    const { data } = await axiosInstance.post<ErpInvoice>(
      `${BASE}/${id}/reparse-xml`,
      { token },
    );
    return data;
  },

  syncDetail: async (id: string, token: string): Promise<ErpInvoice> => {
    const { data } = await axiosInstance.post<ErpInvoice>(
      `${BASE}/${id}/sync-detail`,
      { token },
    );
    return data;
  },

  portalSync: async (payload: PortalSyncPayload): Promise<PortalSyncResult> => {
    const { data } = await axiosInstance.post<PortalSyncResult>(
      `${BASE}/portal/sync`,
      payload,
    );
    return data;
  },

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
