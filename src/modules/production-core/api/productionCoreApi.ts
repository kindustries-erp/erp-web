import axiosInstance from "@/core/api/axiosInstance";
import type { PaginatedResponse, ListParams } from "@/shared/types/pagination";

export interface ExecuteProductionPayload {
  finishedGoodItemId: string;
  qtyToProduce: string;
  warehouseCode?: string;
  referenceNo?: string;
  plannedStartDate?: string;
  plannedEndDate?: string;
  notes?: string;
  outputMetadata?: Record<string, unknown>;
  status?: string;
  bomId?: string;
  materialOverrides?: Array<{
    originalItemId: string;
    alternativeItemId: string;
    notes?: string;
  }>;
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
export interface ErpProducedVehicle {
  id: string;
  vin: string;
  engineNo?: string | null;
  serialNo?: string | null;
  attributes?: Record<string, unknown> | null;
  notes?: string | null;
  createdAt?: string;
}

export interface ErpProducedSerial {
  id: string;
  serialNo?: string | null;
  lotNo?: string | null;
  notes?: string | null;
  createdAt?: string;
}

export interface ErpProductionOrder {
  id: string;
  referenceNo?: string | null;
  status?: string | null;
  finishedGoodItemId?: string | null;
  finishedGoodItemName?: string | null;
  finishedGoodItemCode?: string | null;
  finishedGoodItem?: {
    id: string;
    itemCode?: string | null;
    itemName?: string | null;
    trackingPolicy?: string | null;
  } | null;
  qtyProduced?: string | null;
  qtyToProduce?: string | null;
  plannedStartDate?: string | null;
  plannedEndDate?: string | null;
  notes?: string | null;
  warehouseCode?: string | null;
  createdAt?: string;
  lines?: ErpProductionOrderMaterial[];
  materials?: ErpProductionOrderMaterial[];
  outputMetadata?: Record<string, unknown> | null;
  producedVehicles?: ErpProducedVehicle[];
  producedSerials?: ErpProducedSerial[];
  bomVersion?: string | null;
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
  itemCode?: string | null;
  itemTypeCode?: string | null;
  originalItemId?: string | null;
  originalItemName?: string | null;
  originalItemCode?: string | null;
  alternativeItemId?: string | null;
  alternativeItemName?: string | null;
  alternativeNotes?: string | null;
}

export interface ProductionOrderMasterOption {
  value: string;
  label: string;
  details: ErpProductionOrder;
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
        ...(params?.sort && params.sort.length > 0
          ? { sort: params.sort.join(",") }
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
  explodePreview: async (
    bomId: string,
    qtyToProduce: number,
  ): Promise<{
    flatMaterials: ErpProductionOrderMaterial[];
    explosionTree: Record<string, unknown>[];
  }> => {
    const { data } = await axiosInstance.get<{
      flatMaterials: ErpProductionOrderMaterial[];
      explosionTree: Record<string, unknown>[];
    }>(`/api/v1/production/explode-preview`, {
      params: { bomId, qtyToProduce },
    });
    return data;
  },
  update: async (
    id: string,
    payload: ExecuteProductionPayload,
  ): Promise<ErpProductionOrder> => {
    const { data } = await axiosInstance.patch<{
      message: string;
      data: ErpProductionOrder;
    }>(`${BASE_ORDERS}/${id}`, payload);
    return data.data;
  },
  remove: async (id: string): Promise<{ id: string }> => {
    const { data } = await axiosInstance.delete<{
      message: string;
      data: { id: string };
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

  start: async (
    id: string,
    payload: { qtyToManufacture: number; warehouseCode?: string },
  ): Promise<{
    id: string;
    referenceNo?: string;
    status?: string;
    goodsIssueId?: string;
    goodsIssueNo?: string;
    qtyToManufacture: number;
  }> => {
    const { data } = await axiosInstance.post<{
      message: string;
      data: {
        id: string;
        referenceNo?: string;
        status?: string;
        goodsIssueId?: string;
        goodsIssueNo?: string;
        qtyToManufacture: number;
      };
    }>(`/api/v1/production/orders/${id}/start`, payload);
    return data.data;
  },

  complete: async (
    id: string,
    payload: {
      qtyFinished: number;
      warehouseCode?: string;
      unitCost?: number;
      identifiers?: Array<{
        vinNo?: string;
        engineNo?: string;
        serialNo?: string;
        lotNo?: string;
        notes?: string;
        attributes?: Record<string, string>;
      }>;
    },
  ): Promise<{
    id: string;
    referenceNo?: string;
    status?: string;
    qtyToProduce?: string;
    qtyProduced?: string;
    goodsReceiptId?: string;
    goodsReceiptNo?: string;
    qtyFinished: number;
  }> => {
    const { data } = await axiosInstance.post<{
      message: string;
      data: {
        id: string;
        referenceNo?: string;
        status?: string;
        qtyToProduce?: string;
        qtyProduced?: string;
        goodsReceiptId?: string;
        goodsReceiptNo?: string;
        qtyFinished: number;
      };
    }>(`/api/v1/production/orders/${id}/complete`, payload);
    return data.data;
  },

  getNextReferenceNo: async (): Promise<string> => {
    const { data } = await axiosInstance.get<string>(
      "/api/v1/production/orders/next-reference-no",
    );
    // API returns the string directly (not wrapped in { data: ... })
    return typeof data === "string"
      ? data
      : ((data as unknown as { data?: string }).data ?? "");
  },

  getProductionOrderColumnOptions: async (params: {
    columnKey: string;
    search: string;
    pageParam: number;
    filtersStr?: string;
  }) => {
    const { data } = await axiosInstance.get<{
      items: string[];
      total: number;
      page: number;
      pageSize: number;
      totalPages: number;
    }>("/api/v1/production/orders/column-options", {
      params: {
        column: params.columnKey,
        search: params.search,
        page: params.pageParam,
        pageSize: 20,
        filters: params.filtersStr,
      },
    });
    return {
      items: data.items.map((i) => ({ label: i, value: i })),
      total: data.total,
      next: data.page < data.totalPages ? data.page + 1 : null,
    };
  },

  listMasterOptions: async (
    params?: ListParams,
  ): Promise<ProductionOrderMasterOption[]> => {
    const res = await productionCoreApi.list({
      page: params?.page ?? 1,
      pageSize: params?.pageSize ?? 200,
      ...(params?.search ? { search: params.search } : {}),
      ...(params?.status ? { status: params.status } : {}),
      ...(params?.dateFrom ? { dateFrom: params.dateFrom } : {}),
      ...(params?.dateTo ? { dateTo: params.dateTo } : {}),
      ...(params?.finishedGoodItemId
        ? { finishedGoodItemId: params.finishedGoodItemId }
        : {}),
    });

    return (res.items ?? [])
      .filter((item) => !["DRAFT", "CANCELLED"].includes(item.status || ""))
      .map((item) => ({
        value: item.id,
        label: item.referenceNo || item.finishedGoodItemName || item.id,
        details: item,
      }));
  },
  exportXlsx: async (id: string): Promise<Blob> => {
    const response = await axiosInstance.get(
      `${BASE_ORDERS}/${id}/export-xlsx`,
      {
        responseType: "blob",
      },
    );
    return response.data;
  },
};
