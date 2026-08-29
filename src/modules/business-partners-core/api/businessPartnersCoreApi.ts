import axiosInstance from "@/core/api/axiosInstance";

// ─── Types (khớp với erp_business_partners trên Neon) ─────────────────────────

export interface ErpBusinessPartner {
  id: string;
  code: string;
  name: string;
  displayName?: string | null;
  partnerType: "VENDOR" | "CUSTOMER" | string;
  taxCode?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  contactName?: string | null;
  status: "ACTIVE" | "INACTIVE" | string;
  notes?: string | null;
  isDeleted?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBusinessPartnerCoreDto {
  code: string;
  name: string;
  partnerType: "VENDOR" | "CUSTOMER";
  displayName?: string;
  taxCode?: string;
  phone?: string;
  email?: string;
  address?: string;
  contactName?: string;
  status?: string;
  notes?: string;
}

export type UpdateBusinessPartnerCoreDto =
  Partial<CreateBusinessPartnerCoreDto>;

export interface BusinessPartnerCoreListResult {
  items: ErpBusinessPartner[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ColumnOptionItem {
  label: string;
  value: string;
}

export interface ColumnOptionsResult {
  items: ColumnOptionItem[];
  total: number;
  next: number | null;
}

export interface ListBusinessPartnersParams {
  page?: number;
  pageSize?: number;
  search?: string;
  partnerType?: string;
  sort?: string;
  sortField?: string;
  sortOrder?: string;
  column_filters?: string;
  column_search?: string;
  date_from?: string;
  date_to?: string;
  status?: string;
}

const BASE = "/api/v1/business-partners";

export const businessPartnersCoreApi = {
  list: async (
    params?: ListBusinessPartnersParams,
  ): Promise<BusinessPartnerCoreListResult> => {
    const { data } = await axiosInstance.get<BusinessPartnerCoreListResult>(
      BASE,
      {
        params: {
          page: params?.page ?? 1,
          pageSize: params?.pageSize ?? 50,
          ...(params?.search ? { search: params.search } : {}),
          ...(params?.partnerType ? { partnerType: params.partnerType } : {}),
          ...(params?.sort ? { sort: params.sort } : {}),
          ...(params?.sortField ? { sortField: params.sortField } : {}),
          ...(params?.sortOrder ? { sortOrder: params.sortOrder } : {}),
          ...(params?.column_filters
            ? { column_filters: params.column_filters }
            : {}),
          ...(params?.column_search
            ? { column_search: params.column_search }
            : {}),
          ...(params?.date_from ? { date_from: params.date_from } : {}),
          ...(params?.date_to ? { date_to: params.date_to } : {}),
          ...(params?.status ? { status: params.status } : {}),
        },
      },
    );
    return data;
  },

  getColumnOptions: async (params: {
    column: string;
    search?: string;
    page?: number;
    pageSize?: number;
    filters?: string;
    partnerType?: string;
  }): Promise<ColumnOptionsResult> => {
    const { data } = await axiosInstance.get<ColumnOptionsResult>(
      `${BASE}/column-options`,
      {
        params: {
          column: params.column,
          ...(params.search ? { search: params.search } : {}),
          page: params.page ?? 1,
          pageSize: params.pageSize ?? 20,
          ...(params.filters ? { filters: params.filters } : {}),
          ...(params.partnerType ? { partnerType: params.partnerType } : {}),
        },
      },
    );
    return data;
  },

  get: async (id: string): Promise<ErpBusinessPartner> => {
    const { data } = await axiosInstance.get<{
      message: string;
      data: ErpBusinessPartner;
    }>(`${BASE}/${id}`);
    return data.data;
  },

  create: async (
    dto: CreateBusinessPartnerCoreDto,
  ): Promise<ErpBusinessPartner> => {
    const { data } = await axiosInstance.post<{
      message: string;
      data: ErpBusinessPartner;
    }>(BASE, dto);
    return data.data;
  },

  update: async (
    id: string,
    dto: UpdateBusinessPartnerCoreDto,
  ): Promise<ErpBusinessPartner> => {
    const { data } = await axiosInstance.patch<{
      message: string;
      data: ErpBusinessPartner;
    }>(`${BASE}/${id}`, dto);
    return data.data;
  },

  remove: async (id: string): Promise<ErpBusinessPartner> => {
    const { data } = await axiosInstance.delete<{
      message: string;
      data: ErpBusinessPartner;
    }>(`${BASE}/${id}`);
    return data.data;
  },
};
