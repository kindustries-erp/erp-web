import axiosInstance from "@/core/api/axiosInstance";
import type { PaginatedResponse, ListParams } from "@/shared/types/pagination";

export interface ErpBomLine {
  id?: string;
  componentItemId?: string;
  componentItemName?: string;
  qtyRequired: string;
  uom: string;
  scrapRate?: string;
  notes?: string;
}

export interface ErpBom {
  id: string;
  bomCode: string;
  bomName: string;
  finishedGoodItemId?: string | null;
  finishedGoodItemName?: string | null;
  version: string;
  status?: string | null;
  effectiveFrom?: string | null;
  effectiveTo?: string | null;
  notes?: string | null;
  createdAt?: string;
  lines?: ErpBomLine[];
}

export interface CreateBomPayload {
  bomCode: string;
  bomName: string;
  finishedGoodItemId?: string;
  version: string;
  status?: string;
  effectiveFrom?: string;
  effectiveTo?: string;
  notes?: string;
  lines?: Omit<ErpBomLine, "id">[];
}

export type UpdateBomPayload = Partial<CreateBomPayload>;

const BASE = "/api/v1/bom";

export const bomCoreApi = {
  list: async (params?: ListParams): Promise<PaginatedResponse<ErpBom>> => {
    const { data } = await axiosInstance.get<PaginatedResponse<ErpBom>>(BASE, {
      params: {
        page: params?.page ?? 1,
        pageSize: params?.pageSize ?? 20,
        ...(params?.search ? { search: params.search } : {}),
      },
    });
    return data;
  },
  get: async (id: string): Promise<ErpBom> => {
    const { data } = await axiosInstance.get<ErpBom>(`${BASE}/${id}`);
    return data;
  },
  create: async (payload: CreateBomPayload): Promise<ErpBom> => {
    const { data } = await axiosInstance.post<ErpBom>(BASE, payload);
    return data;
  },
  update: async (id: string, payload: UpdateBomPayload): Promise<ErpBom> => {
    const { data } = await axiosInstance.patch<ErpBom>(
      `${BASE}/${id}`,
      payload,
    );
    return data;
  },
};
