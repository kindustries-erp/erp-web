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

export interface InventoryMasterOption {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  isActive: boolean;
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

export interface CreateInventoryMasterPayload {
  code: string;
  name: string;
  description?: string;
  isActive?: boolean;
}

export type UpdateInventoryMasterPayload =
  Partial<CreateInventoryMasterPayload>;

const BASE = "/api/v1/inventory/items";
const UOM_BASE = "/api/v1/inventory/uoms";
const ITEM_TYPE_BASE = "/api/v1/inventory/item-types";

type InventoryItemDetailResponse = {
  message: string;
  data: ErpInventoryItem;
};

type InventoryMovementsResponse = {
  message: string;
  data: InventoryMovementsPayload;
};

type InventoryMasterDetailResponse = {
  message: string;
  data: InventoryMasterOption;
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
  listUoms: async (
    params?: ListParams & { isActive?: boolean },
  ): Promise<PaginatedResponse<InventoryMasterOption>> => {
    const { data } = await axiosInstance.get<
      PaginatedResponse<InventoryMasterOption>
    >(UOM_BASE, {
      params: {
        ...p(params),
        ...(params?.isActive !== undefined
          ? { isActive: params.isActive }
          : {}),
      },
    });
    return data;
  },
  createUom: async (
    payload: CreateInventoryMasterPayload,
  ): Promise<InventoryMasterOption> => {
    const { data } = await axiosInstance.post<InventoryMasterDetailResponse>(
      UOM_BASE,
      payload,
    );
    return data.data;
  },
  updateUom: async (
    id: string,
    payload: UpdateInventoryMasterPayload,
  ): Promise<InventoryMasterOption> => {
    const { data } = await axiosInstance.patch<InventoryMasterDetailResponse>(
      `${UOM_BASE}/${id}`,
      payload,
    );
    return data.data;
  },
  listItemTypes: async (
    params?: ListParams & { isActive?: boolean },
  ): Promise<PaginatedResponse<InventoryMasterOption>> => {
    const { data } = await axiosInstance.get<
      PaginatedResponse<InventoryMasterOption>
    >(ITEM_TYPE_BASE, {
      params: {
        ...p(params),
        ...(params?.isActive !== undefined
          ? { isActive: params.isActive }
          : {}),
      },
    });
    return data;
  },
  createItemType: async (
    payload: CreateInventoryMasterPayload,
  ): Promise<InventoryMasterOption> => {
    const { data } = await axiosInstance.post<InventoryMasterDetailResponse>(
      ITEM_TYPE_BASE,
      payload,
    );
    return data.data;
  },
  updateItemType: async (
    id: string,
    payload: UpdateInventoryMasterPayload,
  ): Promise<InventoryMasterOption> => {
    const { data } = await axiosInstance.patch<InventoryMasterDetailResponse>(
      `${ITEM_TYPE_BASE}/${id}`,
      payload,
    );
    return data.data;
  },
};
