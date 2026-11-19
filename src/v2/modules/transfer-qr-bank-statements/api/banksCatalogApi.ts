import { v2HttpClient } from "@/v2/shared/api/v2HttpClient";

export interface BankCatalogItem {
  id: string;
  code: string;
  shortName: string;
  name: string;
  bin: string;
  logoUrl?: string | null;
  aliases: string[];
  isActive: boolean;
  transferSupported: boolean;
  lookupSupported: boolean;
  syncedAt?: string | null;
}

export interface GetBanksParams {
  page?: number;
  pageSize?: number;
  search?: string;
  column_filters?: string;
}

export interface BanksPaginatedResponse {
  items: BankCatalogItem[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    next: number | null;
    previous: number | null;
  };
}

export const banksCatalogApi = {
  getBanks: async (
    params?: GetBanksParams,
  ): Promise<BanksPaginatedResponse> => {
    const { data } = await v2HttpClient.get<BanksPaginatedResponse>(
      "/api/v2/banks-management",
      {
        params: {
          page: params?.page ?? 1,
          pageSize: params?.pageSize ?? 20,
          search: params?.search || undefined,
          column_filters:
            params?.column_filters || JSON.stringify({ is_active: true }),
        },
      },
    );
    return data;
  },
};
