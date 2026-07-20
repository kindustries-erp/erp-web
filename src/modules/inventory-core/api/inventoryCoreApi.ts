import axiosInstance from "@/core/api/axiosInstance";
import { dedupeRequest } from "@/shared/utils/requestCache";
import type {
  PaginatedResponse,
  ListParams as BaseListParams,
} from "@/shared/types/pagination";

export type ListParams = BaseListParams & {
  itemTypeId?: string;
  status?: string;
  ids?: string;
};

import type { InventoryConnectionsData } from "./../hooks/useInventoryGraph";

export type InventorySerialListParams = BaseListParams & {
  itemTypeId?: string;
  trackingPolicy?: string;
  itemId?: string;
  status?: string;
  salesOrderLineId?: string;
  ids?: string[];
  missingSerial?: boolean;
};

export interface InventorySerialRow {
  id: string;
  serialNo: string;
  itemId: string;
  vinId?: string | null;
  vinNo?: string | null;
  engineNo?: string | null;
  customId?: string | null;
  lotNo?: string | null;
  notes?: string | null;
  attributes?: Record<string, string> | null;
  status?: string;
  salesOrderLineId?: string | null;
  soId?: string | null;
  soNo?: string | null;
  createdAt: string;
  updatedAt?: string | null;
  item: {
    id: string;
    sku: string;
    itemName: string;
    itemType: string;
    trackingPolicyId?: string | null;
    trackingCategoryId?: string | null;
    trackingPolicyName?: string | null;
  };
  lifecycle?: any;
}

export interface ErpTrackingPolicy {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  isActive: boolean;
  isDeleted?: boolean;
}

export interface ErpInventoryItem {
  id: string;
  sku: string;
  itemName: string;
  uomId: string;
  uom?: { id: string; code: string; name: string };
  itemTypeId: string;
  itemType?: { id: string; code: string; name: string };
  status?: string | null;
  note?: string | null;
  /** FK → erp_tracking_policies */
  trackingPolicyId?: string | null;
  trackingPolicy?: ErpTrackingPolicy | null;
  /** FK → erp_tracking_categories */
  trackingCategoryId?: string | null;
  trackingCategory?: InventoryMasterOption | null;
  attributes?: string[];
  isDeleted?: boolean;
  createdAt?: string;
  updatedAt?: string | null;
}

export interface InventoryMasterOption {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  isActive: boolean;
  isDeleted?: boolean;
  createdAt?: string;
  updatedAt?: string | null;
}

export interface InventoryMovement {
  id: string;
  transactionDate: string;
  transactionType: string;
  documentType?: string | null;
  documentId?: string | null;
  documentNo?: string | null;
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
  uomId: string;
  itemTypeId: string;
  status?: string;
  note?: string;
  trackingPolicyId?: string;
  trackingCategoryId?: string;
  attributes?: string[];
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
const TRACKING_CATEGORY_BASE = "/api/v1/inventory/tracking-categories";
const TRACKING_POLICY_BASE = "/api/v1/inventory/tracking-policies";

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
    ...(params.sort?.length ? { sort: params.sort.join(",") } : {}),
    ...(params.search ? { search: params.search } : {}),
    ...(params.itemTypeId ? { itemTypeId: params.itemTypeId } : {}),
    ...(params.status ? { status: params.status } : {}),
    ...(params.ids ? { ids: params.ids } : {}),
  };
}

export const inventoryCoreApi = {
  list: async (
    params?: ListParams,
  ): Promise<PaginatedResponse<ErpInventoryItem>> => {
    const requestParams = p(params);
    const key = `inventory-items:list:${JSON.stringify(requestParams)}`;
    return dedupeRequest(key, async () => {
      const { data } = await axiosInstance.get<
        PaginatedResponse<ErpInventoryItem>
      >(BASE, { params: requestParams });
      return data;
    });
  },
  listSerials: async (
    params?: InventorySerialListParams,
  ): Promise<PaginatedResponse<InventorySerialRow>> => {
    const requestParams = {
      page: params?.page ?? 1,
      pageSize: params?.pageSize ?? 20,
      ...(params?.sort?.length ? { sort: params.sort.join(",") } : {}),
      ...(params?.search ? { search: params.search } : {}),
      ...(params?.itemTypeId ? { itemTypeId: params.itemTypeId } : {}),
      ...(params?.trackingPolicy
        ? { trackingPolicy: params.trackingPolicy }
        : {}),
      ...(params?.itemId ? { itemId: params.itemId } : {}),
      ...(params?.status ? { status: params.status } : {}),
      ...(params?.salesOrderLineId
        ? { salesOrderLineId: params.salesOrderLineId }
        : {}),
      ...(params?.ids?.length ? { ids: params.ids.join(",") } : {}),
      ...(params?.missingSerial !== undefined
        ? { missingSerial: params.missingSerial }
        : {}),
    };
    const key = `inventory-serials:list:${JSON.stringify(requestParams)}`;
    return dedupeRequest(key, async () => {
      const { data } = await axiosInstance.get<
        PaginatedResponse<InventorySerialRow>
      >("/api/v1/inventory/serials", { params: requestParams });
      return data;
    });
  },
  get: async (id: string): Promise<ErpInventoryItem> => {
    const { data } = await axiosInstance.get<InventoryItemDetailResponse>(
      `${BASE}/${id}`,
    );
    return data.data;
  },
  getConnections: async (id: string): Promise<InventoryConnectionsData> => {
    const { data } = await axiosInstance.get(`${BASE}/${id}/connections`);
    return data.data;
  },
  movements: async (id: string): Promise<InventoryMovementsPayload> => {
    const { data } = await axiosInstance.get<InventoryMovementsResponse>(
      `${BASE}/${id}/movements`,
    );
    return data.data;
  },
  getBalances: async (
    ids: string[],
  ): Promise<
    Record<
      string,
      { qtyOnHand: number; qtyReserved: number; availableQty: number }
    >
  > => {
    if (!ids || !ids.length) return {};
    const { data } = await axiosInstance.get(`${BASE}/balances`, {
      params: { ids: ids.join(",") },
    });
    return data.data || {};
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
    const requestParams = {
      ...p(params),
      ...(params?.isActive !== undefined ? { isActive: params.isActive } : {}),
    };
    const key = `inventory-uoms:list:${JSON.stringify(requestParams)}`;
    return dedupeRequest(key, async () => {
      const { data } = await axiosInstance.get<
        PaginatedResponse<InventoryMasterOption>
      >(UOM_BASE, {
        params: requestParams,
      });
      return data;
    });
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
    const requestParams = {
      ...p(params),
      ...(params?.isActive !== undefined ? { isActive: params.isActive } : {}),
    };
    const key = `inventory-item-types:list:${JSON.stringify(requestParams)}`;
    return dedupeRequest(key, async () => {
      const { data } = await axiosInstance.get<
        PaginatedResponse<InventoryMasterOption>
      >(ITEM_TYPE_BASE, {
        params: requestParams,
      });
      return data;
    });
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

  listTrackingCategories: async (
    params?: ListParams & { isActive?: boolean },
  ): Promise<PaginatedResponse<InventoryMasterOption>> => {
    const requestParams = {
      ...p(params),
      ...(params?.isActive !== undefined ? { isActive: params.isActive } : {}),
    };
    const key = `inventory-tracking-categories:list:${JSON.stringify(requestParams)}`;
    return dedupeRequest(key, async () => {
      const { data } = await axiosInstance.get<
        PaginatedResponse<InventoryMasterOption>
      >(TRACKING_CATEGORY_BASE, { params: requestParams });
      return data;
    });
  },
  createTrackingCategory: async (
    payload: CreateInventoryMasterPayload,
  ): Promise<InventoryMasterOption> => {
    const { data } = await axiosInstance.post<InventoryMasterDetailResponse>(
      TRACKING_CATEGORY_BASE,
      payload,
    );
    return data.data;
  },
  updateTrackingCategory: async (
    id: string,
    payload: UpdateInventoryMasterPayload,
  ): Promise<InventoryMasterOption> => {
    const { data } = await axiosInstance.patch<InventoryMasterDetailResponse>(
      `${TRACKING_CATEGORY_BASE}/${id}`,
      payload,
    );
    return data.data;
  },
  deleteUom: async (id: string): Promise<void> => {
    await axiosInstance.delete(`${UOM_BASE}/${id}`);
  },
  deleteItemType: async (id: string): Promise<void> => {
    await axiosInstance.delete(`${ITEM_TYPE_BASE}/${id}`);
  },
  deleteTrackingCategory: async (id: string): Promise<void> => {
    await axiosInstance.delete(`${TRACKING_CATEGORY_BASE}/${id}`);
  },
  delete: async (id: string): Promise<void> => {
    await axiosInstance.delete(`${BASE}/${id}`);
  },
  listTrackingPolicies: async (
    params?: ListParams & { isActive?: boolean },
  ): Promise<PaginatedResponse<ErpTrackingPolicy>> => {
    const requestParams = {
      ...p(params),
      ...(params?.isActive !== undefined ? { isActive: params.isActive } : {}),
    };
    const key = `inventory-tracking-policies:list:${JSON.stringify(requestParams)}`;
    return dedupeRequest(key, async () => {
      const { data } = await axiosInstance.get<
        PaginatedResponse<ErpTrackingPolicy>
      >(TRACKING_POLICY_BASE, { params: requestParams });
      return data;
    });
  },
  getSerial: async (id: string): Promise<InventorySerialRow> => {
    const { data } = await axiosInstance.get<InventorySerialRow>(
      `/api/v1/inventory/serials/${id}`,
    );
    return data;
  },
  updateSerial: async (
    id: string,
    payload: { notes?: string; attributes?: Record<string, string> },
  ): Promise<InventorySerialRow> => {
    const { data } = await axiosInstance.patch<InventorySerialRow>(
      `/api/v1/inventory/serials/${id}`,
      payload,
    );
    return data;
  },
  confirmDelivery: async (
    id: string,
    payload: { deliveryDate: string; notes?: string },
  ): Promise<any> => {
    const { data } = await axiosInstance.patch(
      `/api/v1/inventory/serials/${id}/confirm-delivery`,
      payload,
    );
    return data;
  },
  listSerialLifecycles: async (
    params?: any,
  ): Promise<PaginatedResponse<any>> => {
    const requestParams = {
      ...p(params),
      ...(params?.dealerId ? { dealerId: params.dealerId } : {}),
      ...(params?.dateFrom ? { deliveryDateFrom: params.dateFrom } : {}),
      ...(params?.dateTo ? { deliveryDateTo: params.dateTo } : {}),
      ...(params?.sortField ? { sortField: params.sortField } : {}),
      ...(params?.sortOrder ? { sortOrder: params.sortOrder } : {}),
      ...(params?.column_search ? { column_search: params.column_search } : {}),
      ...(params?.column_filters
        ? { column_filters: params.column_filters }
        : {}),
    };
    const key = `inventory-serial-lifecycles:list:${JSON.stringify(requestParams)}`;
    return dedupeRequest(key, async () => {
      const { data } = await axiosInstance.get<PaginatedResponse<any>>(
        `/api/v1/inventory/serial-lifecycles`,
        { params: requestParams },
      );
      return data;
    });
  },
  getSerialLifecycleColumnOptions: async (
    column: string,
    search: string,
    page: number = 1,
    pageSize: number = 20,
    columnFilters?: Record<string, string[]>,
  ): Promise<{
    items: string[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }> => {
    const params: any = {
      column,
      search,
      page,
      pageSize,
    };
    if (columnFilters && Object.keys(columnFilters).length > 0) {
      params.column_filters = JSON.stringify(columnFilters);
    }
    const key = `inventory-serial-lifecycles:column-options:${JSON.stringify(params)}`;
    return dedupeRequest(key, async () => {
      const { data } = await axiosInstance.get(
        `/api/v1/inventory/serial-lifecycles/column-options`,
        { params },
      );
      return data;
    });
  },
  updateSerialLifecycle: async (id: string, payload: any): Promise<any> => {
    const { data } = await axiosInstance.patch(
      `/api/v1/inventory/serial-lifecycles/${id}`,
      payload,
    );
    return data;
  },
};
