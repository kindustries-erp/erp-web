import axiosInstance from "@/core/api/axiosInstance";
import type { PaginatedResponse, ListParams } from "@/shared/types/pagination";

export interface ErpBomLine {
  id?: string;
  componentItemId?: string;
  componentItemCode?: string;
  componentItemName?: string;
  qtyRequired: string;
  uomId?: string;
  uom?: string;
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

type BomDetailResponse = {
  message: string;
  data: ErpBom;
};

export const bomCoreApi = {
  list: async (params?: ListParams): Promise<PaginatedResponse<ErpBom>> => {
    const { data } = await axiosInstance.get<PaginatedResponse<ErpBom>>(BASE, {
      params: {
        page: 1,
        pageSize: 50,
        ...params,
      },
    });
    return data;
  },
  getBomColumnOptions: async (params: {
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
    }>(`${BASE}/column-options`, {
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
  get: async (id: string): Promise<ErpBom> => {
    const { data } = await axiosInstance.get<BomDetailResponse>(
      `${BASE}/${id}`,
    );
    return data.data;
  },
  create: async (payload: CreateBomPayload): Promise<ErpBom> => {
    const { data } = await axiosInstance.post<BomDetailResponse>(BASE, payload);
    return data.data;
  },
  update: async (id: string, payload: UpdateBomPayload): Promise<ErpBom> => {
    const { data } = await axiosInstance.patch<BomDetailResponse>(
      `${BASE}/${id}`,
      payload,
    );
    return data.data;
  },
  remove: async (id: string): Promise<void> => {
    await axiosInstance.delete(`${BASE}/${id}`);
  },
  export: async (id: string, format: "xlsx" | "csv"): Promise<Blob> => {
    const { data } = await axiosInstance.get<Blob>(`${BASE}/${id}/export`, {
      params: { format },
      responseType: "blob",
    });
    return data;
  },
  downloadImportTemplate: async (): Promise<Blob> => {
    const { data } = await axiosInstance.get<Blob>(`${BASE}/import/template`, {
      responseType: "blob",
    });
    return data;
  },
  parseBomLines: async (file: File): Promise<ErpBomLine[]> => {
    const formData = new FormData();
    formData.append("file", file);
    const { data } = await axiosInstance.post<{
      message: string;
      data: ErpBomLine[];
    }>(`${BASE}/import/parse`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return data.data;
  },
};
