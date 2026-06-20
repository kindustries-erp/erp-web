import axiosInstance from "@/core/api/axiosInstance";
import type { PaginatedResponse, ListParams } from "@/shared/types/pagination";

export interface ExecuteProductionPayload {
  finishedGoodItemId: string;
  qtyToProduce: string;
  warehouseCode?: string;
  referenceNo?: string;
  plannedStartDate?: string;
  plannedEndDate?: string;
  outputMetadata?: Record<string, unknown>;
  status?: string;
}

export interface MaterialIssuedItem {
  itemId: string;
  itemName?: string;
  qtyIssued: string;
  uom?: string;
}

export interface ExecuteProductionResult {
  referenceNo?: string;
  status?: string;
  productionOrderId?: string;
  finishedGoodItemId?: string;
  finishedGoodItemName?: string;
  qtyProduced?: string;
  warehouseCode?: string;
  materialsIssued?: Array<{
    itemId: string;
    itemName?: string;
    uom?: string;
    qtyIssued: string;
    newStockQty?: string;
  }>;
  goodsIssue?: {
    id?: string;
    issueNo?: string;
    issueDate?: string;
    status?: string;
    issueType?: string;
    [key: string]: unknown;
  };
  finishedGoodReceipt?: {
    receiptNo?: string;
    status?: string;
    newStockQty?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

/** Shape of a production order record from GET /api/v1/production/orders */
export interface ErpProductionOrder {
  id: string;
  referenceNo?: string | null;
  status?: string | null;
  finishedGoodItemId?: string | null;
  finishedGoodItemName?: string | null;
  qtyProduced?: string | null;
  qtyToProduce?: string | null;
  plannedStartDate?: string | null;
  plannedEndDate?: string | null;
  warehouseCode?: string | null;
  createdAt?: string;
  lines?: ErpProductionOrderMaterial[];
  [key: string]: unknown;
}

export interface ErpProductionOrderMaterial {
  id: string;
  productionOrderId: string;
  itemId: string;
  qtyRequired: string;
  qtyIssued: string;
  uom?: string | null;
  itemName?: string | null;
}

const BASE_EXECUTE = "/api/v1/production/execute";
const BASE_ORDERS = "/api/v1/production/orders";

type ExecuteProductionResponse = {
  message: string;
  data: ExecuteProductionResult;
};

export const productionCoreApi = {
  execute: async (
    payload: ExecuteProductionPayload,
  ): Promise<ExecuteProductionResult> => {
    const { data } = await axiosInstance.post<ExecuteProductionResponse>(
      BASE_EXECUTE,
      payload,
    );
    return data.data;
  },

  list: async (
    params?: ListParams,
  ): Promise<PaginatedResponse<ErpProductionOrder>> => {
    const { data } = await axiosInstance.get<
      PaginatedResponse<ErpProductionOrder>
    >(BASE_ORDERS, {
      params: {
        page: params?.page ?? 1,
        pageSize: params?.pageSize ?? 20,
        ...(params?.search ? { search: params.search } : {}),
        ...(params?.status ? { status: params.status } : {}),
        ...(params?.dateFrom ? { dateFrom: params.dateFrom } : {}),
        ...(params?.dateTo ? { dateTo: params.dateTo } : {}),
        ...(params?.finishedGoodItemId
          ? { finishedGoodItemId: params.finishedGoodItemId }
          : {}),
      },
    });
    return data;
  },
  get: async (id: string): Promise<ErpProductionOrder> => {
    const { data } = await axiosInstance.get<{
      message: string;
      data: ErpProductionOrder;
    }>(`${BASE_ORDERS}/${id}`);
    return data.data;
  },
  cancel: async (id: string): Promise<ErpProductionOrder> => {
    const { data } = await axiosInstance.post<{
      message: string;
      data: ErpProductionOrder;
    }>(`/api/v1/production/${id}/cancel`);
    return data.data;
  },
  confirm: async (id: string): Promise<ErpProductionOrder> => {
    const { data } = await axiosInstance.post<{
      message: string;
      data: ErpProductionOrder;
    }>(`/api/v1/production/${id}/confirm`);
    return data.data;
  },
};
