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

export interface ErpPurchaseOrder {
  id: string;
  poNo: string;
  supplierId?: string | null;
  supplierName?: string | null;
  orderDate: string;
  expectedDate?: string | null;
  status?: string | null;
  remarks?: string | null;
  createdAt?: string;
  lines?: ErpPoLine[];
}

export interface CreatePoPayload {
  poNo?: string;
  supplierId?: string;
  orderDate: string;
  expectedDate?: string;
  status?: string;
  remarks?: string;
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
    const { data } = await axiosInstance.get<
      PaginatedResponse<ErpPurchaseOrder>
    >(BASE, {
      params: {
        page: params?.page ?? 1,
        pageSize: params?.pageSize ?? 20,
        ...(params?.search ? { search: params.search } : {}),
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
};
