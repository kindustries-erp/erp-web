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

export interface InventoryMovement {
  id: string;
  transactionDate: string;
  transactionType: string;
  documentType?: string | null;
  documentId?: string | null;
  qtyIn: number;
  qtyOut: number;
  unitCost?: number | null;
  balanceAfter: number;
  notes?: string | null;
  createdAt?: string;
}

export interface InventoryMovementsPayload {
  item: Pick<ErpInventoryItem, "id" | "sku" | "itemName" | "uom" | "itemType">;
  currentOnHand: number;
  movements: InventoryMovement[];
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

type InventoryItemDetailResponse = {
  message: string;
  data: ErpInventoryItem;
};

type InventoryMovementsResponse = {
  message: string;
  data: InventoryMovementsPayload;
};

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
    const { data } = await axiosInstance.get<InventoryItemDetailResponse>(
      `${BASE}/${id}`,
    );
    return data.data;
  },
  movements: async (id: string): Promise<InventoryMovementsPayload> => {
    const { data } = await axiosInstance.get<InventoryMovementsResponse>(
      `${BASE}/${id}/movements`,
    );
    return data.data;
  },
  create: async (
    payload: CreateInventoryItemPayload,
  ): Promise<ErpInventoryItem> => {
    const { data } = await axiosInstance.post<InventoryItemDetailResponse>(
      BASE,
      payload,
    );
    return data.data;
  },
  update: async (
    id: string,
    payload: UpdateInventoryItemPayload,
  ): Promise<ErpInventoryItem> => {
    const { data } = await axiosInstance.patch<InventoryItemDetailResponse>(
      `${BASE}/${id}`,
      payload,
    );
    return data.data;
  },
};
