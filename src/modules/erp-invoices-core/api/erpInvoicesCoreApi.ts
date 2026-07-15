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
  branchId?: string | null;
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
  licensePlate?: string | null;
  settlementOrder?: string | null;
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
  pdfFiles?: any[] | null;
  xmlFileKey?: string | null;
  xmlImportId?: string | null;
  createdAt?: string;
  updatedAt?: string;
  items?: ErpInvoiceItem[];
  voucherNetOffs?: {
    id: string;
    bankTransactionId: string;
    netOffAmount: number;
    bankTransaction?: any;
  }[];
}

export interface CreateErpInvoicePayload {
  branchId?: string;
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
  partner_tax_code?: string;
  date_from?: string;
  date_to?: string;
  status?: string;
  tag_id?: string;
  page?: number;
  pageSize?: number;
  sort_by?: string;
  sort_order?: "asc" | "desc";
  export_type?: "summary" | "detailed";
  column_search?: string;
  column_filters?: string;
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
  note?: string;
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

  getInvoiceColumnOptions: async (
    column: string,
    search: string,
    page: number = 1,
    pageSize: number = 20,
    filtersStr?: string,
    direction?: "IN" | "OUT",
  ) => {
    const res = await axiosInstance.get(`${BASE}/column-options`, {
      params: {
        column,
        search,
        page,
        pageSize,
        column_filters: filtersStr,
        direction,
      },
    });
    return res.data as {
      items: string[];
      total: number;
      page: number;
      totalPages: number;
    };
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
      { timeout: 300000 },
    );
    return data;
  },

  linkVouchers: async (
    id: string,
    payload: { bankTransactionId: string; netOffAmount?: number }[],
  ): Promise<{ message: string }> => {
    const { data } = await axiosInstance.post<{ message: string }>(
      `${BASE}/${id}/net-off-vouchers`,
      payload,
    );
    return data;
  },

  removeVoucherLink: async (
    id: string,
    voucherId: string,
  ): Promise<{ message: string }> => {
    const { data } = await axiosInstance.delete<{ message: string }>(
      `${BASE}/${id}/net-off-vouchers/${voucherId}`,
    );
    return data;
  },

  bulkDownloadXml: async (payload: {
    token: string;
    direction: "IN" | "OUT";
  }) => {
    const { data } = await axiosInstance.post<{
      message: string;
      count: number;
    }>(`${BASE}/portal/bulk-download-xml`, payload);
    return data;
  },

  getPortalToken: async (): Promise<{ token: string }> => {
    const { data } = await axiosInstance.get<{ token: string }>(
      `${BASE}/portal/token`,
    );
    return data;
  },

  savePortalToken: async (token: string): Promise<{ message: string }> => {
    const { data } = await axiosInstance.post<{ message: string }>(
      `${BASE}/portal/token`,
      { token },
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

  uploadPdfs: async (
    id: string,
    files: File[],
  ): Promise<{ success: boolean; pdfFiles: any[] }> => {
    const formData = new FormData();
    files.forEach((f) => formData.append("files", f));
    const { data } = await axiosInstance.post<{
      success: boolean;
      pdfFiles: any[];
    }>(`${BASE}/${id}/pdfs`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },

  getPdfBlob: async (id: string, key: string): Promise<Blob> => {
    const { data } = await axiosInstance.get<Blob>(
      `${BASE}/${id}/pdfs/${encodeURIComponent(key)}/content`,
      { responseType: "blob" },
    );
    return data;
  },

  getPdfDownloadUrl: async (
    id: string,
    key: string,
    inline?: boolean,
  ): Promise<{ url: string }> => {
    const { data } = await axiosInstance.get<{ url: string }>(
      `${BASE}/${id}/pdfs/${encodeURIComponent(key)}/download-url`,
      { params: { inline } },
    );
    return data;
  },

  downloadPdfsZip: async (id: string): Promise<Blob> => {
    const { data } = await axiosInstance.get<Blob>(`${BASE}/${id}/pdfs/zip`, {
      responseType: "blob",
    });
    return data;
  },

  bulkDownloadFiles: async (payload: {
    query: { date_from?: string; date_to?: string; direction?: string };
    types: string[];
  }): Promise<Blob> => {
    const { data } = await axiosInstance.post<Blob>(
      `${BASE}/bulk-download-files`,
      payload,
      { responseType: "blob", timeout: 600000 },
    );
    return data;
  },

  deletePdf: async (
    id: string,
    key: string,
  ): Promise<{ success: boolean; pdfFiles: any[] }> => {
    const { data } = await axiosInstance.delete<{
      success: boolean;
      pdfFiles: any[];
    }>(`${BASE}/${id}/pdfs/${encodeURIComponent(key)}`);
    return data;
  },

  exportExcel: async (params: ErpInvoiceListParams): Promise<Blob> => {
    const { data } = await axiosInstance.get<Blob>(`${BASE}/export/excel`, {
      params,
      responseType: "blob",
    });
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
  pdfAttached?: { filename: string; invoiceNo: string }[];
  pdfOrphans?: { filename: string; reason: string }[];
}
