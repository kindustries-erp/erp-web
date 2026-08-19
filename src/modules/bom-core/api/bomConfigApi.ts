import axiosInstance from "@/core/api/axiosInstance";

export type BomAttributeFieldType =
  | "TEXT"
  | "NUMBER"
  | "SELECT"
  | "DATE"
  | "CHECKBOX";

export interface BomAttributeOption {
  label: string;
  value: string;
}

export interface BomAttributeDef {
  id: string;
  categoryId: string;
  code: string;
  name: string;
  fieldType: BomAttributeFieldType;
  options?: BomAttributeOption[] | null;
  sortOrder: number;
  isRequired: boolean;
  isActive?: boolean;
  usageCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface BomCategory {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  isActive?: boolean;
  attributeDefs?: BomAttributeDef[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateBomCategoryPayload {
  code: string;
  name: string;
  description?: string;
  isActive?: boolean;
}

export type UpdateBomCategoryPayload = Partial<CreateBomCategoryPayload>;

export interface CreateBomAttributeDefPayload {
  categoryId: string;
  code: string;
  name: string;
  fieldType: BomAttributeFieldType;
  options?: BomAttributeOption[];
  sortOrder?: number;
  isRequired?: boolean;
  isActive?: boolean;
}

export type UpdateBomAttributeDefPayload =
  Partial<CreateBomAttributeDefPayload>;

const BASE = "/api/v1/bom-config";

export const bomConfigApi = {
  getCategories: async (): Promise<BomCategory[]> => {
    const { data } = await axiosInstance.get<BomCategory[]>(
      `${BASE}/categories`,
    );
    return data;
  },

  createCategory: async (
    payload: CreateBomCategoryPayload,
  ): Promise<BomCategory> => {
    const { data } = await axiosInstance.post<BomCategory>(
      `${BASE}/categories`,
      payload,
    );
    return data;
  },

  updateCategory: async (
    id: string,
    payload: UpdateBomCategoryPayload,
  ): Promise<BomCategory> => {
    const { data } = await axiosInstance.patch<BomCategory>(
      `${BASE}/categories/${id}`,
      payload,
    );
    return data;
  },

  deleteCategory: async (id: string): Promise<void> => {
    await axiosInstance.delete(`${BASE}/categories/${id}`);
  },

  getAttributeDefs: async (categoryId?: string): Promise<BomAttributeDef[]> => {
    const { data } = await axiosInstance.get<BomAttributeDef[]>(
      `${BASE}/attribute-defs`,
      {
        params: categoryId ? { categoryId } : undefined,
      },
    );
    return data;
  },

  createAttributeDef: async (
    payload: CreateBomAttributeDefPayload,
  ): Promise<BomAttributeDef> => {
    const { data } = await axiosInstance.post<BomAttributeDef>(
      `${BASE}/attribute-defs`,
      payload,
    );
    return data;
  },

  updateAttributeDef: async (
    id: string,
    payload: UpdateBomAttributeDefPayload,
  ): Promise<BomAttributeDef> => {
    const { data } = await axiosInstance.patch<BomAttributeDef>(
      `${BASE}/attribute-defs/${id}`,
      payload,
    );
    return data;
  },

  deleteAttributeDef: async (id: string): Promise<void> => {
    await axiosInstance.delete(`${BASE}/attribute-defs/${id}`);
  },
};
