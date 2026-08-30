import axiosInstance from "@/core/api/axiosInstance";
import type { PaginatedResponse, ListParams } from "@/shared/types/pagination";
import type { ErpInvoice } from "@/modules/erp-invoices-core/api/erpInvoicesCoreApi";

export interface ErpPoLine {
  id?: string;
  itemId?: string;
  itemName?: string;
  description?: string;
  qtyOrdered: string;
  qtyReceived?: string;
  unitPrice?: string;
  amount?: string;
}

export interface ErpPoReceiptLine {
  id?: string;
  lineNo?: number;
  itemId?: string | null;
  purchaseOrderLineId?: string | null;
  qtyReceived: string;
  unitCost?: string | null;
  amount?: string | null;
}

export interface ErpPoReceipt {
  id: string;
  receiptNo: string;
  receiptDate: string;
  status?: string | null;
  remarks?: string | null;
  createdAt?: string;
  lines?: ErpPoReceiptLine[];
}

export interface ErpPurchaseOrder {
  id: string;
  poNo: string;
  supplierId?: string | null;
  supplierName?: string | null;
  orderDate: string;
  expectedDate?: string | null;
  status?: string | null;
  remarks?: string | null;
  supplierInvoiceNo?: string | null;
  createdAt?: string;
  inventoryStatus?: string | null;
  receipts?: ErpPoReceipt[];
  lines?: ErpPoLine[];
}

export interface CreatePoPayload {
  poNo?: string;
  supplierId?: string;
  orderDate: string;
  expectedDate?: string;
  status?: string;
  remarks?: string;
  supplierInvoiceNo?: string;
  lines?: Omit<ErpPoLine, "id" | "qtyReceived">[];
}

export type UpdatePoPayload = Partial<CreatePoPayload>;

const BASE = "/api/v1/purchase-orders";

type PoDetailResponse = {
  message: string;
  data: ErpPurchaseOrder;
};

export const purchaseOrdersCoreApi = {
  list: async (
    params?: ListParams,
  ): Promise<PaginatedResponse<ErpPurchaseOrder>> => {
    const { page, pageSize, search, ...rest } = params || {};
    const { data } = await axiosInstance.get<
      PaginatedResponse<ErpPurchaseOrder>
    >(BASE, {
      params: {
        page: page ?? 1,
        pageSize: pageSize ?? 20,
        ...(search ? { search } : {}),
        ...rest,
      },
    });
    return data;
  },
  getColumnOptions: async (
    column: string,
    search?: string,
    page: number = 1,
    pageSize: number = 20,
    filtersStr?: string,
  ): Promise<PaginatedResponse<string>> => {
    const { data } = await axiosInstance.get<PaginatedResponse<string>>(
      `${BASE}/column-options`,
      {
        params: {
          column,
          search,
          page,
          pageSize,
          filters: filtersStr,
        },
      },
    );
    return data;
  },
  get: async (id: string): Promise<ErpPurchaseOrder> => {
    const { data } = await axiosInstance.get<PoDetailResponse>(`${BASE}/${id}`);
    return data.data;
  },
  create: async (payload: CreatePoPayload): Promise<ErpPurchaseOrder> => {
    const { data } = await axiosInstance.post<PoDetailResponse>(BASE, payload);
    return data.data;
  },
  update: async (
    id: string,
    payload: UpdatePoPayload,
  ): Promise<ErpPurchaseOrder> => {
    const { data } = await axiosInstance.patch<PoDetailResponse>(
      `${BASE}/${id}`,
      payload,
    );
    return data.data;
  },
  nextNo: async (date?: string): Promise<string> => {
    const { data } = await axiosInstance.get<{ nextNo: string }>(
      `${BASE}/next-no`,
      { params: date ? { date } : {} },
    );
    return data.nextNo;
  },
  remove: async (id: string): Promise<void> => {
    await axiosInstance.delete(`${BASE}/${id}`);
  },
  cancel: async (id: string): Promise<ErpPurchaseOrder> => {
    const { data } = await axiosInstance.post<PoDetailResponse>(
      `${BASE}/${id}/cancel`,
    );
    return data.data;
  },
  getLinkedInvoices: async (id: string): Promise<ErpInvoice[]> => {
    const { data } = await axiosInstance.get<ErpInvoice[]>(
      `${BASE}/${id}/invoices`,
    );
    return data;
  },
  linkInvoices: async (id: string, invoiceIds: string[]): Promise<void> => {
    await axiosInstance.post(`${BASE}/${id}/link-invoices`, { invoiceIds });
  },
  unlinkInvoice: async (id: string, invoiceId: string): Promise<void> => {
    await axiosInstance.delete(`${BASE}/${id}/invoices/${invoiceId}`);
  },
  exportExcel: async (
    id: string,
    poNo?: string,
    status?: string,
  ): Promise<void> => {
    const response = await axiosInstance.get(`${BASE}/${id}/export/excel`, {
      responseType: "blob",
    });
    const prefix =
      status === "DRAFT" ? "phieu-de-xuat-mua-hang" : "bang-ke-mua-hang";
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    const timestamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
    const filename = `${prefix}_${poNo || id}_${timestamp}.xlsx`;
    const url = URL.createObjectURL(response.data);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },
};
