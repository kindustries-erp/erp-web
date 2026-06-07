import axiosInstance from "@/core/api/axiosInstance";

export interface ExecuteProductionPayload {
  finishedGoodItemId: string;
  qtyToProduce: string;
  warehouseCode?: string;
  referenceNo?: string;
  outputMetadata?: Record<string, unknown>;
}

export interface ExecuteProductionResult {
  referenceNo?: string;
  status?: string;
  productionOrderId?: string;
  finishedGoodItemId?: string;
  qtyProduced?: string;
  materialsIssued?: Array<{
    itemId: string;
    itemName?: string;
    qtyIssued: string;
    uom?: string;
  }>;
  [key: string]: unknown;
}

export const productionCoreApi = {
  execute: async (
    payload: ExecuteProductionPayload,
  ): Promise<ExecuteProductionResult> => {
    const { data } = await axiosInstance.post<ExecuteProductionResult>(
      "/api/v1/production/execute",
      payload,
    );
    return data;
  },
};
