import axiosInstance from "@/core/api/axiosInstance";

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
  notes?: string | null;
  createdAt?: string;
  updatedAt?: string;
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
  notes?: string;
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
};
