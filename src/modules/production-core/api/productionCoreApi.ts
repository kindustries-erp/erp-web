import axiosInstance from "@/core/api/axiosInstance";
import type { PaginatedResponse, ListParams } from "@/shared/types/pagination";

export interface ExecuteProductionPayload {
  finishedGoodItemId: string;
  qtyToProduce: string;
  warehouseCode?: string;
  referenceNo?: string;
  outputMetadata?: Record<string, unknown>;
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
  warehouseCode?: string | null;
  createdAt?: string;
  [key: string]: unknown;
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
      },
    });
    return data;
  },
};
