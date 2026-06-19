import axiosInstance from "@/core/api/axiosInstance";
import type { PaginatedResponse, ListParams } from "@/shared/types/pagination";

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
};
