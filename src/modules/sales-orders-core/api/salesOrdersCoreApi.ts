import axiosInstance from "@/core/api/axiosInstance";
import type { PaginatedResponse } from "@/shared/types/pagination";

export interface ErpSoLine {
  id?: string;
  itemId?: string;
  itemName?: string;
  qtyOrdered: string;
  qtyReserved?: string;
  qtyDelivered?: string;
  unitPrice?: string;
  amount?: string;
  selectedSerialIds?: string[];
}

export interface ErpSalesOrder {
  id: string;
  soNo: string;
  customerId?: string | null;
  customerName?: string | null;
  orderDate: string;
  expectedDeliveryDate?: string | null;
  status?: string | null;
  remarks?: string | null;
  createdAt?: string;
  lines?: ErpSoLine[];
  goodsIssues?: any[];
  serialLifecycles?: any[];
}

export interface CreateSoPayload {
  soNo: string;
  customerId?: string;
  orderDate: string;
  expectedDeliveryDate?: string;
  status?: string;
  remarks?: string;
  lines?: (Omit<ErpSoLine, "id" | "qtyReserved" | "qtyDelivered"> & {
    serialIds?: string[];
  })[];
}

export type UpdateSoPayload = Partial<CreateSoPayload>;

const BASE = "/api/v1/sales-orders";

type SoDetailResponse = {
  message: string;
  data: ErpSalesOrder;
};

export const salesOrdersCoreApi = {
  list: async (params?: any): Promise<PaginatedResponse<ErpSalesOrder>> => {
    const { data } = await axiosInstance.get<PaginatedResponse<ErpSalesOrder>>(
      BASE,
      {
        params: {
          page: params?.page ?? 1,
          pageSize: params?.pageSize ?? 20,
          ...(params?.search ? { search: params.search } : {}),
          ...(params?.column_search
            ? { column_search: params.column_search }
            : {}),
          ...(params?.column_filters
            ? { column_filters: params.column_filters }
            : {}),
          ...(params?.sortField ? { sortField: params.sortField } : {}),
          ...(params?.sortOrder ? { sortOrder: params.sortOrder } : {}),
          ...((params as any)?.notFullyIssued
            ? { notFullyIssued: (params as any).notFullyIssued }
            : {}),
          ...((params as any)?.status
            ? { status: (params as any).status }
            : {}),
        },
      },
    );
    return data;
  },
  getColumnOptions: async (
    column: string,
    search: string,
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
          ...(filtersStr ? { filtersStr } : {}),
        },
      },
    );
    return data;
  },
  get: async (id: string): Promise<ErpSalesOrder> => {
    const { data } = await axiosInstance.get<SoDetailResponse>(`${BASE}/${id}`);
    return data.data;
  },
  create: async (payload: CreateSoPayload): Promise<ErpSalesOrder> => {
    const { data } = await axiosInstance.post<SoDetailResponse>(BASE, payload);
    return data.data;
  },
  update: async (
    id: string,
    payload: UpdateSoPayload,
  ): Promise<ErpSalesOrder> => {
    const { data } = await axiosInstance.patch<SoDetailResponse>(
      `${BASE}/${id}`,
      payload,
    );
    return data.data;
  },
  reserve: async (
    id: string,
    warehouseCode?: string,
  ): Promise<ErpSalesOrder> => {
    const { data } = await axiosInstance.post<SoDetailResponse>(
      `${BASE}/${id}/reserve`,
      { warehouseCode },
    );
    return data.data;
  },
  unreserve: async (
    id: string,
    warehouseCode?: string,
  ): Promise<ErpSalesOrder> => {
    const { data } = await axiosInstance.post<SoDetailResponse>(
      `${BASE}/${id}/unreserve`,
      { warehouseCode },
    );
    return data.data;
  },
  confirmAllDelivery: async (id: string): Promise<ErpSalesOrder> => {
    const { data } = await axiosInstance.post<SoDetailResponse>(
      `${BASE}/${id}/confirm-all-delivery`,
    );
    return data.data;
  },
  remove: async (id: string): Promise<void> => {
    await axiosInstance.delete(`${BASE}/${id}`);
  },
  cancel: async (id: string): Promise<ErpSalesOrder> => {
    const { data } = await axiosInstance.post<SoDetailResponse>(
      `${BASE}/${id}/cancel`,
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
  exportXlsx: async (id: string): Promise<Blob> => {
    const { data } = await axiosInstance.get(`${BASE}/${id}/export/xlsx`, {
      responseType: "blob",
    });
    return data;
  },
};
