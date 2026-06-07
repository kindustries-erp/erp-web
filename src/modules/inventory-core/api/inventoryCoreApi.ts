import axiosInstance from "@/core/api/axiosInstance";
import type { PaginatedResponse, ListParams } from "@/shared/types/pagination";

export interface ErpInventoryItem {
  id: string;
  sku: string;
  itemName: string;
  uom: string;
  itemType: string;
  status?: string | null;
  createdAt?: string;
  updatedAt?: string | null;
}

export interface CreateInventoryItemPayload {
  sku: string;
  itemName: string;
  uom: string;
  itemType: string;
  status?: string;
}

export type UpdateInventoryItemPayload = Partial<CreateInventoryItemPayload>;

const BASE = "/api/v1/inventory/items";

function p(params: ListParams = {}) {
  return {
    page: params.page ?? 1,
    pageSize: params.pageSize ?? 20,
    ...(params.search ? { search: params.search } : {}),
  };
}

export const inventoryCoreApi = {
  list: async (
    params?: ListParams,
  ): Promise<PaginatedResponse<ErpInventoryItem>> => {
    const { data } = await axiosInstance.get<
      PaginatedResponse<ErpInventoryItem>
    >(BASE, { params: p(params) });
    return data;
  },
  get: async (id: string): Promise<ErpInventoryItem> => {
    const { data } = await axiosInstance.get<ErpInventoryItem>(`${BASE}/${id}`);
    return data;
  },
  create: async (
    payload: CreateInventoryItemPayload,
  ): Promise<ErpInventoryItem> => {
    const { data } = await axiosInstance.post<ErpInventoryItem>(BASE, payload);
    return data;
  },
  update: async (
    id: string,
    payload: UpdateInventoryItemPayload,
  ): Promise<ErpInventoryItem> => {
    const { data } = await axiosInstance.patch<ErpInventoryItem>(
      `${BASE}/${id}`,
      payload,
    );
    return data;
  },
};
