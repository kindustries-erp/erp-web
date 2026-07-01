import axiosInstance from "@/core/api/axiosInstance";
import type { PaginatedResponse, ListParams } from "@/shared/types/pagination";

export interface ErpGrLine {
  id?: string;
  purchaseOrderLineId?: string;
  productionOrderMaterialId?: string;
  itemId?: string;
  itemName?: string;
  qtyReceived: string;
  unitCost?: string;
  amount?: string;
}

export interface ErpGoodsReceipt {
  id: string;
  receiptNo: string;
  purchaseOrderId?: string | null;
  productionOrderId?: string | null;
  supplierId?: string | null;
  supplierName?: string | null;
  receiptDate: string;
  status?: string | null;
  remarks?: string | null;
  createdAt?: string;
  isDeleted?: boolean;
  lines?: ErpGrLine[];
}

export interface CreateGrPayload {
  receiptNo?: string;
  purchaseOrderId?: string;
  productionOrderId?: string;
  supplierId?: string;
  receiptDate: string;
  status?: string;
  remarks?: string;
  lines?: Omit<ErpGrLine, "id">[];
}

export type UpdateGrPayload = Partial<CreateGrPayload>;

const BASE = "/api/v1/goods-receipts";

type GrDetailResponse = {
  message: string;
  data: ErpGoodsReceipt;
};

export const goodsReceiptsCoreApi = {
  list: async (
    params?: ListParams,
  ): Promise<PaginatedResponse<ErpGoodsReceipt>> => {
    const { data } = await axiosInstance.get<
      PaginatedResponse<ErpGoodsReceipt>
    >(BASE, {
      params: {
        page: params?.page ?? 1,
        pageSize: params?.pageSize ?? 20,
        ...(params?.search ? { search: params.search } : {}),
      },
    });
    return data;
  },
  get: async (id: string): Promise<ErpGoodsReceipt> => {
    const { data } = await axiosInstance.get<GrDetailResponse>(`${BASE}/${id}`);
    return data.data;
  },
  create: async (payload: CreateGrPayload): Promise<ErpGoodsReceipt> => {
    const { data } = await axiosInstance.post<GrDetailResponse>(BASE, payload);
    return data.data;
  },
  update: async (
    id: string,
    payload: UpdateGrPayload,
  ): Promise<ErpGoodsReceipt> => {
    const { data } = await axiosInstance.patch<GrDetailResponse>(
      `${BASE}/${id}`,
      payload,
    );
    return data.data;
  },
  post: async (
    id: string,
    warehouseCode?: string,
  ): Promise<ErpGoodsReceipt> => {
    const { data } = await axiosInstance.post<GrDetailResponse>(
      `${BASE}/${id}/post`,
      { warehouseCode },
    );
    return data.data;
  },
  cancel: async (id: string): Promise<ErpGoodsReceipt> => {
    const { data } = await axiosInstance.post<GrDetailResponse>(
      `${BASE}/${id}/cancel`,
      {},
    );
    return data.data;
  },
  remove: async (id: string): Promise<ErpGoodsReceipt> => {
    const { data } = await axiosInstance.delete<GrDetailResponse>(
      `${BASE}/${id}`,
    );
    return data.data;
  },
  exportXlsx: async (id: string): Promise<Blob> => {
    const response = await axiosInstance.get(`${BASE}/${id}/export-xlsx`, {
      responseType: "blob",
    });
    return response.data;
  },
  nextNo: async (date?: string): Promise<string> => {
    const { data } = await axiosInstance.get<{ nextNo: string }>(
      `${BASE}/next-no`,
      { params: date ? { date } : {} },
    );
    return data.nextNo;
  },
};
