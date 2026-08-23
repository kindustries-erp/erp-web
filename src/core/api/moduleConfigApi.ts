import axiosInstance from "@/core/api/axiosInstance";

export const MODULE_KEYS = {
  BOM: "BOM",
  INVOICE: "INVOICE",
  BANK_TXN: "BANK_TXN",
} as const;

export type ModuleKey = (typeof MODULE_KEYS)[keyof typeof MODULE_KEYS] | string;

export type ModuleAttributeFieldType =
  | "TEXT"
  | "NUMBER"
  | "SELECT"
  | "DATE"
  | "CHECKBOX";

export interface ModuleAttributeOption {
  label: string;
  value: string;
}

export interface ModuleAttributeDef {
  id: string;
  categoryId: string;
  code: string;
  name: string;
  fieldType: ModuleAttributeFieldType;
  options?: ModuleAttributeOption[] | null;
  sortOrder: number;
  isRequired: boolean;
  isActive?: boolean;
  isDeleted?: boolean;
  usageCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ModuleCategory {
  id: string;
  moduleKey: string;
  code: string;
  name: string;
  description?: string | null;
  isActive?: boolean;
  isDeleted?: boolean;
  attributeDefs?: ModuleAttributeDef[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateModuleCategoryPayload {
  moduleKey: string;
  code: string;
  name: string;
  description?: string;
  isActive?: boolean;
}

export type UpdateModuleCategoryPayload = Partial<CreateModuleCategoryPayload>;

export interface CreateModuleAttributeDefPayload {
  categoryId: string;
  code: string;
  name: string;
  fieldType: ModuleAttributeFieldType;
  options?: ModuleAttributeOption[];
  sortOrder?: number;
  isRequired?: boolean;
  isActive?: boolean;
}

export type UpdateModuleAttributeDefPayload =
  Partial<CreateModuleAttributeDefPayload>;

const BASE = "/api/v1/module-config";

export const moduleConfigApi = {
  getCategories: async (moduleKey?: string): Promise<ModuleCategory[]> => {
    const { data } = await axiosInstance.get<ModuleCategory[]>(
      `${BASE}/categories`,
      {
        params: moduleKey ? { moduleKey } : undefined,
      },
    );
    return data;
  },

  createCategory: async (
    payload: CreateModuleCategoryPayload,
  ): Promise<ModuleCategory> => {
    const { data } = await axiosInstance.post<ModuleCategory>(
      `${BASE}/categories`,
      payload,
    );
    return data;
  },

  updateCategory: async (
    id: string,
    payload: UpdateModuleCategoryPayload,
  ): Promise<ModuleCategory> => {
    const { data } = await axiosInstance.patch<ModuleCategory>(
      `${BASE}/categories/${id}`,
      payload,
    );
    return data;
  },

  deleteCategory: async (id: string): Promise<void> => {
    await axiosInstance.delete(`${BASE}/categories/${id}`);
  },

  getAttributeDefs: async (
    categoryId?: string,
  ): Promise<ModuleAttributeDef[]> => {
    const { data } = await axiosInstance.get<ModuleAttributeDef[]>(
      `${BASE}/attribute-defs`,
      {
        params: categoryId ? { categoryId } : undefined,
      },
    );
    return data;
  },

  createAttributeDef: async (
    payload: CreateModuleAttributeDefPayload,
  ): Promise<ModuleAttributeDef> => {
    const { data } = await axiosInstance.post<ModuleAttributeDef>(
      `${BASE}/attribute-defs`,
      payload,
    );
    return data;
  },

  updateAttributeDef: async (
    id: string,
    payload: UpdateModuleAttributeDefPayload,
  ): Promise<ModuleAttributeDef> => {
    const { data } = await axiosInstance.patch<ModuleAttributeDef>(
      `${BASE}/attribute-defs/${id}`,
      payload,
    );
    return data;
  },

  deleteAttributeDef: async (id: string): Promise<void> => {
    await axiosInstance.delete(`${BASE}/attribute-defs/${id}`);
  },

  // ================= Entity Values =================

  getEntityValues: async (
    entityType: string,
    entityId: string,
  ): Promise<ModuleEntityValuesResponse> => {
    const { data } = await axiosInstance.get<ModuleEntityValuesResponse>(
      `${BASE}/values/${entityType}/${entityId}`,
    );
    return data;
  },

  saveEntityValues: async (
    entityType: string,
    entityId: string,
    payload: SaveModuleEntityValuesPayload,
  ): Promise<void> => {
    await axiosInstance.put(
      `${BASE}/values/${entityType}/${entityId}`,
      payload,
    );
  },
};

export interface ModuleEntityAttributeValueItem {
  id: string;
  attrDefId: string;
  attrCode?: string;
  attrName?: string;
  fieldType?: ModuleAttributeFieldType;
  valueText?: string | null;
}

export interface ModuleEntityValuesResponse {
  entityType: string;
  entityId: string;
  categoryId?: string | null;
  category?: ModuleCategory | null;
  attributes: Record<string, any>;
  attributeValues: ModuleEntityAttributeValueItem[];
}

export interface SaveModuleEntityValuesPayload {
  categoryId?: string | null;
  attributes?: Record<string, any>;
}
