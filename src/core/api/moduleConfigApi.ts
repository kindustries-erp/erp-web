import axiosInstance from "@/core/api/axiosInstance";

export const MODULE_KEYS = {
  BOM: "BOM",
  INVOICE: "INVOICE",
  BANK_TXN: "BANK_TXN",
  GOODS_RECEIPT: "GOODS_RECEIPT",
  GOODS_ISSUE: "GOODS_ISSUE",
  INVENTORY_ADJUSTMENT: "INVENTORY_ADJUSTMENT",
} as const;

export type ModuleKey = (typeof MODULE_KEYS)[keyof typeof MODULE_KEYS] | string;

export type ModuleAttributeFieldType =
  | "TEXT"
  | "NUMBER"
  | "SELECT"
  | "DATE"
  | "CHECKBOX";

export interface ModuleAttributeOption {
  value: string;
  label: string;
  labelEn?: string;
  labels?: {
    vi?: string;
    en?: string;
    [key: string]: string | undefined;
  };
}

export interface ModuleAttributeDef {
  id: string;
  categoryId?: string | null;
  isGlobal?: boolean;
  moduleKeyGlobal?: string | null;
  code: string;
  name: string;
  nameEn?: string | null;
  fieldType: ModuleAttributeFieldType;
  options?: ModuleAttributeOption[] | null;
  sortOrder: number;
  isRequired: boolean;
  isActive?: boolean;
  isSystem?: boolean;
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
  nameEn?: string | null;
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
  nameEn?: string;
  description?: string;
  isActive?: boolean;
}

export type UpdateModuleCategoryPayload = Partial<CreateModuleCategoryPayload>;

export interface CreateModuleAttributeDefPayload {
  categoryId?: string | null;
  isGlobal?: boolean;
  moduleKeyGlobal?: string | null;
  code: string;
  name: string;
  nameEn?: string;
  fieldType: ModuleAttributeFieldType;
  options?: ModuleAttributeOption[];
  sortOrder?: number;
  isRequired?: boolean;
  isActive?: boolean;
  isSystem?: boolean;
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
    isGlobal?: boolean,
    moduleKey?: string,
  ): Promise<ModuleAttributeDef[]> => {
    const { data } = await axiosInstance.get<ModuleAttributeDef[]>(
      `${BASE}/attribute-defs`,
      {
        params: {
          ...(categoryId ? { categoryId } : {}),
          ...(isGlobal !== undefined ? { isGlobal } : {}),
          ...(moduleKey ? { moduleKey } : {}),
        },
      },
    );
    return data;
  },

  getGlobalAttributeDefs: async (
    moduleKey: string,
  ): Promise<ModuleAttributeDef[]> => {
    const { data } = await axiosInstance.get<ModuleAttributeDef[]>(
      `${BASE}/global-attribute-defs`,
      {
        params: { moduleKey },
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

  getAttributeOptionsUsage: async (
    id: string,
  ): Promise<Record<string, number>> => {
    const { data } = await axiosInstance.get<Record<string, number>>(
      `${BASE}/attribute-defs/${id}/options-usage`,
    );
    return data;
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
  nameEn?: string | null;
  fieldType?: ModuleAttributeFieldType;
  valueText?: string | null;
  isGlobal?: boolean;
}

export interface ModuleEntityValuesResponse {
  entityType: string;
  entityId: string;
  categoryId?: string | null;
  category?: ModuleCategory | null;
  attributes: Record<string, any>;
  globalAttributes?: Record<string, any>;
  globalAttributeDefs?: ModuleAttributeDef[];
  attributeValues: ModuleEntityAttributeValueItem[];
}

export interface SaveModuleEntityValuesPayload {
  categoryId?: string | null;
  attributes?: Record<string, any>;
  globalAttributes?: Record<string, any>;
}

/**
 * Helper tra cứu i18n cho tên danh mục (Hỗ trợ nameEn & locale)
 */
export function resolveCategoryName(
  cat?: {
    moduleKey?: string;
    code?: string;
    name: string;
    nameEn?: string | null;
  } | null,
  t?: (key: string, fallback: string) => string,
  locale: string = "vi",
): string {
  if (!cat) return "";
  if (locale === "en" && cat.nameEn) {
    return cat.nameEn;
  }
  if (!t || !cat.moduleKey || !cat.code) return cat.name;
  const key = `moduleConfig.category.${cat.moduleKey.toUpperCase()}.${cat.code.toUpperCase()}.name`;
  const translated = t(key, cat.name);
  if (locale === "en" && cat.nameEn && translated === cat.name) {
    return cat.nameEn;
  }
  return translated;
}

/**
 * Helper tra cứu i18n cho tên thuộc tính (Hỗ trợ nameEn & locale)
 */
export function resolveAttrName(
  attr: {
    code: string;
    name: string;
    nameEn?: string | null;
    isGlobal?: boolean;
    moduleKeyGlobal?: string | null;
  },
  moduleKey: string,
  categoryCode?: string | null,
  t?: (key: string, fallback?: any) => string,
  locale: string = "vi",
): string {
  if (locale === "en" && attr.nameEn) {
    return attr.nameEn;
  }
  if (!t) return attr.name;
  const modKey = (attr.moduleKeyGlobal || moduleKey).toUpperCase();
  const attrCode = attr.code.toLowerCase();

  let key = `moduleConfig.attr.${modKey}.${attrCode}.name`;
  if (attr.isGlobal) {
    key = `moduleConfig.attr.${modKey}.GLOBAL.${attrCode}.name`;
  } else if (categoryCode) {
    key = `moduleConfig.attr.${modKey}.${categoryCode.toUpperCase()}.${attrCode}.name`;
  }

  const translated = t(key, attr.name);
  if (locale === "en" && attr.nameEn && translated === attr.name) {
    return attr.nameEn;
  }
  return translated;
}

/**
 * Helper tra cứu nhãn đa ngôn ngữ cho Option (Hỗ trợ labels, labelEn, label & locale)
 */
export function resolveOptionLabel(
  opt?: ModuleAttributeOption | null,
  locale: string = "vi",
  t?: (key: string, fallback?: any) => string,
): string {
  if (!opt) return "";
  // 1. Lấy theo object labels cho đúng locale
  if (opt.labels && typeof opt.labels === "object" && opt.labels[locale]) {
    return opt.labels[locale]!;
  }
  // 2. Nếu locale = en và có labelEn
  if (locale === "en" && opt.labelEn) {
    return opt.labelEn;
  }
  // 3. Tra cứu từ hệ thống i18n dictionary nếu có key
  if (t) {
    const key = `moduleConfig.options.${opt.value}`;
    const translated = t(key, "");
    if (translated && translated !== key) {
      return translated;
    }
  }
  // 4. Fallback về nhãn tiếng Việt trong labels nếu có
  if (opt.labels?.vi) {
    return opt.labels.vi;
  }
  // 5. Fallback về label mặc định hoặc value
  return opt.label || opt.value;
}
