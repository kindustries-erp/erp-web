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

export interface ErpPoItemRow {
  id: string;
  purchaseOrderId: string;
  poNo: string;
  orderDate: string | null;
  expectedDate: string | null;
  supplierId: string | null;
  supplierName: string;
  itemId: string | null;
  itemCode: string | null;
  itemName: string;
  description: string | null;
  qtyOrdered: string;
  qtyReceived: string;
  unitPrice: string | null;
  amount: string | null;
  lineNo: number;
  status: string;
}

export interface QueryPurchaseOrderItemsParams extends ListParams {
  supplier_id?: string;
  purchase_order_id?: string;
  status?: string;
  date_from?: string;
  date_to?: string;
  column_filters?: string;
  column_search?: string;
  sort_by?: string;
  sort_order?: "ASC" | "DESC" | "asc" | "desc";
}

export interface PoSupplierStats {
  supplierId: string;
  totalOrders: number;
  totalSpend: number;
  totalReceivedAmount: number;
  pendingAmount: number;
  completionRate: number;
  lastOrderDate: string | null;
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

export interface ExportPoExcelRangeParams {
  date_from: string;
  date_to: string;
  supplier_id?: string;
  status?: string;
  fileName?: string;
}

export const purchaseOrdersCoreApi = {
  exportExcelByRange: async (
    params: ExportPoExcelRangeParams,
  ): Promise<string> => {
    const { date_from, date_to, supplier_id, status, fileName } = params;
    const response = await axiosInstance.get(`${BASE}/export/excel/range`, {
      params: {
        date_from,
        date_to,
        supplier_id: supplier_id || undefined,
        status: status && status !== "ALL" ? status : undefined,
      },
      responseType: "blob",
    });
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    const timestamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
    const generatedFileName =
      fileName || `bang-ke-mua-hang-theo-ky_${timestamp}.xlsx`;
    const url = URL.createObjectURL(response.data);
    const a = document.createElement("a");
    a.href = url;
    a.download = generatedFileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    return generatedFileName;
  },
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
  getItemsList: async (
    params?: QueryPurchaseOrderItemsParams,
  ): Promise<PaginatedResponse<ErpPoItemRow>> => {
    const { page, pageSize, search, ...rest } = params || {};
    const { data } = await axiosInstance.get<PaginatedResponse<ErpPoItemRow>>(
      `${BASE}/items`,
      {
        params: {
          page: page ?? 1,
          pageSize: pageSize ?? 20,
          ...(search ? { search } : {}),
          ...rest,
        },
      },
    );
    return data;
  },
  getItemsColumnOptions: async (
    column: string,
    search?: string,
    page: number = 1,
    pageSize: number = 20,
    filtersStr?: string,
    supplierId?: string,
  ): Promise<PaginatedResponse<string>> => {
    const { data } = await axiosInstance.get<PaginatedResponse<string>>(
      `${BASE}/items/column-options`,
      {
        params: {
          column,
          search: search || undefined,
          page,
          pageSize,
          filters: filtersStr,
          supplier_id: supplierId || undefined,
        },
      },
    );
    return data;
  },
  getSupplierStats: async (supplierId: string): Promise<PoSupplierStats> => {
    const { data } = await axiosInstance.get<PoSupplierStats>(
      `${BASE}/supplier-stats/${supplierId}`,
    );
    return data;
  },
};
