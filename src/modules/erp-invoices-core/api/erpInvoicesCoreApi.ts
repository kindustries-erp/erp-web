import axiosInstance from "@/core/api/axiosInstance";

export interface ErpInvoiceItem {
  id?: string;
  invoiceId?: string;
  description?: string;
  unit?: string;
  quantity?: number;
  unitPrice?: number;
  invoiceSubcategory?: string;
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
  taxInvoiceType?: string | null;
  isValid?: boolean;
  validatedAt?: string | null;
  validatedBy?: string | null;
  source?: string | null;
  sellerName?: string | null;
  sellerTaxCode?: string | null;
  sellerAddress?: string | null;
  sellerBank?: string | null;
  buyerName?: string | null;
  buyerPersonalName?: string | null;
  buyerCccd?: string | null;
  buyerTaxCode?: string | null;
  buyerAddress?: string | null;
  description?: string | null;
  licensePlate?: string | null;
  settlementOrder?: string | null;
  invoiceCategory?: string | null;
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
  taxInvoiceStatus?: number | null;
  taxProcessStatus?: number | null;
  relatedInvoiceNo?: string | null;
  relatedSerialNo?: string | null;
  createdAt?: string;
  updatedAt?: string;
  postingStatus?: string | null;
  postingDate?: string | null;
  journalEntryId?: string | null;
  items?: ErpInvoiceItem[];
  voucherNetOffs?: {
    id: string;
    bankTransactionId: string;
    netOffAmount: number;
    bankTransaction?: any;
  }[];
  attachments?: {
    attachmentId: string;
    attachment: import("@/modules/system/api/attachmentsApi").ErpAttachment;
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
  isValid?: boolean;
  items?: ErpInvoiceItem[];
  pendingDocumentChanges?: {
    action: "ADD" | "REMOVE";
    type: "PO" | "BANK";
    refId: string;
    amount?: number;
  }[];
  accountingEnabled?: boolean;
  pendingDeletedPdfs?: string[];
  pendingAddedAttachments?: import("../components/ErpInvoicePdfUpload").PendingAttachment[];
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
  column_search?: string;
  column_filters?: string;
  unlinked_po_id?: string;
}

export interface ErpInvoiceListResponse {
  items: ErpInvoice[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface BranchStatEntry {
  branchId: string | null;
  branchName: string;
  monthTotal: number;
  monthPreVat: number;
  weekTotal: number;
  weekPreVat: number;
  dayTotal: number;
  dayPreVat: number;
}

export interface ErpInvoiceStats {
  monthTotal: number;
  monthPreVat: number;
  monthChart: number[];
  monthPreVatChart: number[];
  weekTotal: number;
  weekPreVat: number;
  weekChart: number[];
  weekPreVatChart: number[];
  dayTotal: number;
  dayPreVat: number;
  dayChart: number[];
  dayPreVatChart: number[];
  byBranch?: BranchStatEntry[];
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
  token?: string;
  cookies?: string;
  dateFrom: string;
  dateTo: string;
  type?: "purchase" | "sold";
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

export interface InvoiceExportBackgroundStartResult {
  jobId: string;
  message: string;
  reused?: boolean;
}

export interface InvoiceExportHistoryItem {
  jobId: string;
  fileName: string;
  status: "RUNNING" | "COMPLETED" | "FAILED";
  current: number;
  total: number;
  message: string;
  createdAt: string;
  finishedAt?: string;
  expiresAt?: string;
  dateFrom?: string;
  dateTo?: string;
  canDownload: boolean;
}

export interface InvoiceExportHistoryResponse {
  items: InvoiceExportHistoryItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface InvoiceExportProgressEvent {
  processId: "invoice-xlsx-export" | "ping";
  jobId?: string;
  current: number;
  total: number;
  isRunning: boolean;
  completed: boolean;
  ready: boolean;
  failed: boolean;
  message?: string;
  fileName?: string;
}

const BASE = "/api/v1/erp-invoices";

function extractErrorMessageFromPayload(payload: any): string | null {
  if (!payload) return null;
  if (typeof payload === "string") return payload;
  if (typeof payload?.message === "string") return payload.message;
  if (Array.isArray(payload?.message)) {
    return payload.message.join(", ");
  }
  if (typeof payload?.error === "string") return payload.error;
  return null;
}

async function resolveBlobErrorMessage(
  error: any,
  fallback: string,
): Promise<string> {
  const responseData = error?.response?.data;

  if (responseData instanceof Blob) {
    try {
      const text = (await responseData.text())?.trim();
      if (text) {
        try {
          const parsed = JSON.parse(text);
          const parsedMsg = extractErrorMessageFromPayload(parsed);
          if (parsedMsg) return parsedMsg;
        } catch {
          return text;
        }
      }
    } catch {
      // Ignore blob parsing errors and fall back to common paths.
    }
  }

  const directMsg = extractErrorMessageFromPayload(responseData);
  if (directMsg) return directMsg;

  if (typeof error?.message === "string" && error.message.trim()) {
    return error.message;
  }

  return fallback;
}

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

  getStats: async (
    direction?: "IN" | "OUT",
    dateFrom?: string,
    dateTo?: string,
  ): Promise<ErpInvoiceStats> => {
    const { data } = await axiosInstance.get<ErpInvoiceStats>(`${BASE}/stats`, {
      params: { direction, dateFrom, dateTo },
    });
    return data;
  },

  get: async (id: string): Promise<ErpInvoice> => {
    const { data } = await axiosInstance.get<{ data: ErpInvoice }>(
      `${BASE}/${id}`,
    );
    return data.data;
  },

  getBulkNetOffs: async (ids: string[]): Promise<any[]> => {
    const { data } = await axiosInstance.post<any[]>(`${BASE}/bulk-net-offs`, {
      ids,
    });
    return data;
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

  bulkSetBranch: async (ids: string[], branchId: string | null) => {
    const { data } = await axiosInstance.patch<{
      updated: number;
      ids: string[];
    }>(`${BASE}/bulk-set-branch`, { ids, branchId });
    return data;
  },

  bulkSetNotes: async (ids: string[], notes: string) => {
    const { data } = await axiosInstance.patch<{
      updated: number;
      ids: string[];
    }>(`${BASE}/bulk-set-notes`, { ids, notes });
    return data;
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

  getLinkedCases: async (invoiceId: string) => {
    const res = await axiosInstance.get(
      `/api/v1/greenway/invoices/${invoiceId}/linked-cases`,
    );
    return res.data;
  },

  syncDetail: async (id: string, token?: string): Promise<ErpInvoice> => {
    const { data } = await axiosInstance.post<ErpInvoice>(
      `${BASE}/${id}/sync-detail`,
      token ? { token } : {},
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

  bulkDownloadXml: async (params: {
    token?: string;
    cookies?: string;
    direction: "IN" | "OUT";
  }): Promise<{ message: string; count: number }> => {
    const { data } = await axiosInstance.post<{
      message: string;
      count: number;
    }>(`${BASE}/portal/bulk-download-xml`, params);
    return data;
  },

  getPortalCaptcha: async (): Promise<{
    content: string;
    key: string;
    text?: string;
  }> => {
    const { data } = await axiosInstance.get<{
      content: string;
      key: string;
      text?: string;
    }>(`${BASE}/portal/captcha`);
    return data;
  },

  loginPortal: async (payload: {
    username: string;
    password?: string;
    cvalue: string;
    ckey: string;
  }): Promise<{ success: boolean; token: string; message: string }> => {
    const { data } = await axiosInstance.post<{
      success: boolean;
      token: string;
      message: string;
    }>(`${BASE}/portal/login`, payload);
    return data;
  },

  getPortalConfig: async (): Promise<{
    token: string;
    cookies: string;
    username?: string;
    hasPassword?: boolean;
  }> => {
    const { data } = await axiosInstance.get<{
      token: string;
      cookies: string;
      username?: string;
      hasPassword?: boolean;
    }>(`${BASE}/portal/token`);
    return data;
  },

  savePortalConfig: async (
    token: string,
    cookies?: string,
    username?: string,
    password?: string,
  ): Promise<{ message: string }> => {
    const { data } = await axiosInstance.post<{ message: string }>(
      `${BASE}/portal/token`,
      { token, cookies, username, password },
    );
    return data;
  },

  previewPdfMatch: async (
    filenames: string[],
    direction: "IN" | "OUT",
  ): Promise<
    Record<
      string,
      {
        id: string;
        invoiceNo: string;
        serialNo: string | null;
        totalAmount: string | null;
      } | null
    >
  > => {
    const res = await axiosInstance.post(`${BASE}/preview-pdf-match`, {
      filenames,
      direction,
    });
    return res.data;
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

  setValid: async (
    id: string,
    isValid: boolean,
  ): Promise<{ success: boolean }> => {
    const { data } = await axiosInstance.patch<{ success: boolean }>(
      `${BASE}/${id}/validate`,
      { isValid },
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
  ): Promise<{ success: boolean; attachments: any[] }> => {
    const formData = new FormData();
    files.forEach((f) => formData.append("files", f));
    const { data } = await axiosInstance.post<{
      success: boolean;
      attachments: any[];
    }>(`${BASE}/${id}/pdfs`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },

  getPdfBlob: async (id: string, key: string): Promise<Blob> => {
    try {
      const { data } = await axiosInstance.get<Blob>(
        `${BASE}/${id}/pdfs/${encodeURIComponent(key)}/content`,
        { responseType: "blob" },
      );
      return data;
    } catch (error: any) {
      throw new Error(
        await resolveBlobErrorMessage(error, "Không thể tải nội dung file PDF"),
      );
    }
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
    try {
      const { data } = await axiosInstance.get<Blob>(`${BASE}/${id}/pdfs/zip`, {
        responseType: "blob",
      });
      return data;
    } catch (error: any) {
      throw new Error(
        await resolveBlobErrorMessage(error, "Không thể tải file ZIP PDF"),
      );
    }
  },

  bulkDownloadFiles: async (payload: {
    query: { date_from?: string; date_to?: string; direction?: string };
    types: string[];
  }): Promise<Blob> => {
    try {
      const { data } = await axiosInstance.post<Blob>(
        `${BASE}/bulk-download-files`,
        payload,
        { responseType: "blob", timeout: 600000 },
      );
      return data;
    } catch (error: any) {
      throw new Error(
        await resolveBlobErrorMessage(error, "Tải ZIP hàng loạt thất bại"),
      );
    }
  },

  bulkDownloadSelected: async (payload: {
    ids: string[];
    types: string[];
  }): Promise<Blob> => {
    try {
      const { data } = await axiosInstance.post<Blob>(
        `${BASE}/bulk-download-selected`,
        payload,
        { responseType: "blob", timeout: 300000 },
      );
      return data;
    } catch (error: any) {
      throw new Error(
        await resolveBlobErrorMessage(
          error,
          "Tải ZIP hóa đơn đã chọn thất bại",
        ),
      );
    }
  },

  deletePdf: async (
    id: string,
    key: string,
  ): Promise<{ success: boolean; attachments: any[] }> => {
    const { data } = await axiosInstance.delete<{
      success: boolean;
      attachments: any[];
    }>(`${BASE}/${id}/pdfs/${encodeURIComponent(key)}`);
    return data;
  },

  linkAttachment: async (id: string, attachmentId: string): Promise<any> => {
    const { data } = await axiosInstance.post(
      `${BASE}/${id}/attachments/link`,
      {
        attachmentId,
      },
    );
    return data;
  },

  unlinkAttachment: async (id: string, attachmentId: string): Promise<any> => {
    const { data } = await axiosInstance.delete(
      `${BASE}/${id}/attachments/${attachmentId}`,
    );
    return data;
  },

  exportExcel: async (params: ErpInvoiceListParams): Promise<Blob> => {
    try {
      const { data } = await axiosInstance.get<Blob>(`${BASE}/export/excel`, {
        params,
        responseType: "blob",
      });
      return data;
    } catch (error: any) {
      throw new Error(
        await resolveBlobErrorMessage(error, "Xuất Excel thất bại"),
      );
    }
  },

  startExportExcelBackground: async (
    params: ErpInvoiceListParams,
  ): Promise<InvoiceExportBackgroundStartResult> => {
    const { data } =
      await axiosInstance.post<InvoiceExportBackgroundStartResult>(
        `${BASE}/export/excel/background`,
        params,
      );
    return data;
  },

  downloadExportExcelBackground: async (jobId: string): Promise<Blob> => {
    try {
      const { data } = await axiosInstance.get<Blob>(
        `${BASE}/export/excel/background/${jobId}/download`,
        {
          responseType: "blob",
        },
      );
      return data;
    } catch (error: any) {
      throw new Error(
        await resolveBlobErrorMessage(error, "Tai file Excel that bai"),
      );
    }
  },

  listExportExcelBackgroundHistory: async (
    page = 1,
    pageSize = 10,
  ): Promise<InvoiceExportHistoryResponse> => {
    const { data } = await axiosInstance.get<InvoiceExportHistoryResponse>(
      `${BASE}/export/excel/background/history`,
      {
        params: {
          page,
          pageSize,
        },
      },
    );
    return data;
  },

  postInvoice: async (
    id: string,
    payload: {
      postingDate: string;
      documentDate?: string;
      description?: string;
      lines: {
        accountId: string;
        debit: number;
        credit: number;
        description?: string;
      }[];
    },
  ): Promise<ErpInvoice> => {
    const { data } = await axiosInstance.post<ErpInvoice>(
      `${BASE}/${id}/post`,
      payload,
    );
    return data;
  },

  unpostInvoice: async (id: string): Promise<ErpInvoice> => {
    const { data } = await axiosInstance.post<ErpInvoice>(
      `${BASE}/${id}/unpost`,
    );
    return data;
  },

  getTraceabilityGraph: async (
    id: string,
  ): Promise<import("@/shared/types/traceability").TraceabilityGraphData> => {
    const { data } = await axiosInstance.get<{
      rootId: string;
      rootType: any;
      nodes: any[];
      edges: any[];
      summary: any;
    }>(`${BASE}/${id}/traceability-graph`);
    return data as any;
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
  pdfAttached?: {
    filename: string;
    invoiceNo: string;
    invoiceId?: string;
    serialNo?: string | null;
    sellerName?: string | null;
    totalAmount?: string | null;
  }[];
  pdfOrphans?: { filename: string; reason: string }[];
}
