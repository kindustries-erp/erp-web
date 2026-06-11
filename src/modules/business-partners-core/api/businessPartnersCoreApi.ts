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

const BASE = "/api/v1/business-partners";

export const businessPartnersCoreApi = {
  list: async (params?: {
    page?: number;
    pageSize?: number;
    search?: string;
    partnerType?: string;
  }): Promise<BusinessPartnerCoreListResult> => {
    const { data } = await axiosInstance.get<BusinessPartnerCoreListResult>(
      BASE,
      {
        params: {
          page: params?.page ?? 1,
          pageSize: params?.pageSize ?? 50,
          ...(params?.search ? { search: params.search } : {}),
          ...(params?.partnerType ? { partnerType: params.partnerType } : {}),
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
