import axiosInstance from "@/core/api/axiosInstance";
import type { PaginatedResponse, ListParams } from "@/shared/types/pagination";

export interface ErpGiLine {
  id?: string;
  salesOrderLineId?: string;
  productionOrderMaterialId?: string;
  itemId?: string;
  itemName?: string;
  serialId?: string;
  serialNo?: string;
  vehicleId?: string;
  vehicleVin?: string;
  frameNo?: string;
  engineNo?: string;
  qtyIssued: string;
  unitCost?: string;
  amount?: string;
}

export interface ErpGoodsIssue {
  id: string;
  issueNo: string;
  issueDate: string;
  issueType: string;
  customerId?: string | null;
  customerName?: string | null;
  productionOrderId?: string | null;
  status?: string | null;
  remarks?: string | null;
  createdAt?: string;
  isDeleted?: boolean;
  lines?: ErpGiLine[];
}

export interface CreateGiLinePayload {
  salesOrderLineId?: string;
  productionOrderMaterialId?: string;
  itemId?: string;
  itemName?: string;
  serialId?: string;
  serialNo?: string;
  vehicleId?: string;
  vehicleVin?: string;
  frameNo?: string;
  engineNo?: string;
  qtyIssued: string;
  unitCost?: string;
  amount?: string;
}

export interface CreateGiPayload {
  issueNo: string;
  issueDate: string;
  issueType: string;
  customerId?: string;
  productionOrderId?: string;
  status?: string;
  remarks?: string;
  lines?: CreateGiLinePayload[];
}

export type UpdateGiPayload = Partial<CreateGiPayload>;

const BASE = "/api/v1/goods-issues";

type GiDetailResponse = { message: string; data: ErpGoodsIssue };

export const goodsIssuesCoreApi = {
  list: async (
    params?: ListParams,
  ): Promise<PaginatedResponse<ErpGoodsIssue>> => {
    const { data } = await axiosInstance.get<PaginatedResponse<ErpGoodsIssue>>(
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
  get: async (id: string): Promise<ErpGoodsIssue> => {
    const { data } = await axiosInstance.get<GiDetailResponse>(`${BASE}/${id}`);
    return data.data;
  },
  create: async (payload: CreateGiPayload): Promise<ErpGoodsIssue> => {
    const { data } = await axiosInstance.post<GiDetailResponse>(BASE, payload);
    return data.data;
  },
  update: async (
    id: string,
    payload: UpdateGiPayload,
  ): Promise<ErpGoodsIssue> => {
    const { data } = await axiosInstance.patch<GiDetailResponse>(
      `${BASE}/${id}`,
      payload,
    );
    return data.data;
  },
  post: async (id: string, warehouseCode?: string): Promise<ErpGoodsIssue> => {
    const { data } = await axiosInstance.post<GiDetailResponse>(
      `${BASE}/${id}/post`,
      { warehouseCode },
    );
    return data.data;
  },
  remove: async (id: string): Promise<ErpGoodsIssue> => {
    const { data } = await axiosInstance.delete<GiDetailResponse>(
      `${BASE}/${id}`,
    );
    return data.data;
  },
  cancel: async (id: string): Promise<ErpGoodsIssue> => {
    const { data } = await axiosInstance.post<GiDetailResponse>(
      `${BASE}/${id}/cancel`,
      {},
    );
    return data.data;
  },
};
