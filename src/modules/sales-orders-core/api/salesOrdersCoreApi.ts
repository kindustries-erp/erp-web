import axiosInstance from "@/core/api/axiosInstance";
import type { PaginatedResponse, ListParams } from "@/shared/types/pagination";

export interface ErpSoLine {
  id?: string;
  itemId?: string;
  itemName?: string;
  qtyOrdered: string;
  qtyReserved?: string;
  qtyDelivered?: string;
  unitPrice?: string;
  amount?: string;
}

export interface ErpSalesOrder {
  id: string;
  soNo: string;
  customerId?: string | null;
  customerName?: string | null;
  orderDate: string;
  status?: string | null;
  remarks?: string | null;
  createdAt?: string;
  lines?: ErpSoLine[];
}

export interface CreateSoPayload {
  soNo: string;
  customerId?: string;
  orderDate: string;
  status?: string;
  remarks?: string;
  lines?: Omit<ErpSoLine, "id" | "qtyReserved" | "qtyDelivered">[];
}

export type UpdateSoPayload = Partial<CreateSoPayload>;

const BASE = "/api/v1/sales-orders";

export const salesOrdersCoreApi = {
  list: async (
    params?: ListParams,
  ): Promise<PaginatedResponse<ErpSalesOrder>> => {
    const { data } = await axiosInstance.get<PaginatedResponse<ErpSalesOrder>>(
      BASE,
      {
        params: {
          page: params?.page ?? 1,
          pageSize: params?.pageSize ?? 20,
          ...(params?.search ? { search: params.search } : {}),
        },
      },
    );
    return data;
  },
  get: async (id: string): Promise<ErpSalesOrder> => {
    const { data } = await axiosInstance.get<ErpSalesOrder>(`${BASE}/${id}`);
    return data;
  },
  create: async (payload: CreateSoPayload): Promise<ErpSalesOrder> => {
    const { data } = await axiosInstance.post<ErpSalesOrder>(BASE, payload);
    return data;
  },
  update: async (
    id: string,
    payload: UpdateSoPayload,
  ): Promise<ErpSalesOrder> => {
    const { data } = await axiosInstance.patch<ErpSalesOrder>(
      `${BASE}/${id}`,
      payload,
    );
    return data;
  },
  reserve: async (
    id: string,
    warehouseCode?: string,
  ): Promise<ErpSalesOrder> => {
    const { data } = await axiosInstance.post<ErpSalesOrder>(
      `${BASE}/${id}/reserve`,
      { warehouseCode },
    );
    return data;
  },
  unreserve: async (
    id: string,
    warehouseCode?: string,
  ): Promise<ErpSalesOrder> => {
    const { data } = await axiosInstance.post<ErpSalesOrder>(
      `${BASE}/${id}/unreserve`,
      { warehouseCode },
    );
    return data;
  },
};
