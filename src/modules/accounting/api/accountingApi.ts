import axiosInstance from "@/core/api/axiosInstance";

export interface ChartOfAccountItem {
  id: string;
  account_code?: string;
  accountCode?: string;
  account_name?: string;
  accountName?: string;
  account_type?: string;
  accountType?: string;
  normal_balance?: string;
  parent_account_id?: string | null;
  parentId?: string | null;
  parent?: {
    id: string;
    accountCode?: string;
    accountName?: string;
    account_code?: string;
    account_name?: string;
  } | null;
  level?: number | null;
  is_cash_account?: boolean;
  is_receivable_account?: boolean;
  is_payable_account?: boolean;
  is_active?: boolean;
  isActive?: boolean;
  created_at?: string;
  createdAt?: string;
  updated_at?: string | null;
  updatedAt?: string | null;
}

export const accountingApi = {
  getJournalEntries: async (params: any) => {
    const cleanParams = Object.fromEntries(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      Object.entries(params).filter(([_, v]) => v !== undefined && v !== ""),
    );
    const res = await axiosInstance.get(
      "/api/v1/accounting-core/journal-entries",
      {
        params: cleanParams,
        paramsSerializer: { indexes: null },
      },
    );
    return res.data;
  },

  getJournalEntryById: async (id: string) => {
    const res = await axiosInstance.get(
      `/api/v1/accounting-core/journal-entries/${id}`,
    );
    return res.data.data;
  },

  getChartOfAccounts: async (params?: any) => {
    const cleanParams = params
      ? Object.fromEntries(
          Object.entries(params).filter(
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            ([_, v]) => v !== undefined && v !== "" && v !== null,
          ),
        )
      : undefined;
    const res = await axiosInstance.get(
      "/api/v1/accounting-core/chart-of-accounts",
      { params: cleanParams },
    );
    return res.data;
  },

  getColumnOptions: async (
    column: string,
    search?: string,
    page: number = 1,
    pageSize: number = 20,
    filtersStr?: string,
  ): Promise<{
    items: { label: string; value: string }[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }> => {
    const res = await axiosInstance.get(
      "/api/v1/accounting-core/chart-of-accounts/column-options",
      {
        params: {
          column,
          search,
          page,
          pageSize,
          filters: filtersStr,
        },
      },
    );
    return res.data;
  },

  getChartOfAccountById: async (id: string): Promise<ChartOfAccountItem> => {
    const res = await axiosInstance.get(
      `/api/v1/accounting-core/chart-of-accounts/${id}`,
    );
    return res.data.data;
  },

  createChartOfAccount: async (dto: any): Promise<ChartOfAccountItem> => {
    const res = await axiosInstance.post(
      "/api/v1/accounting-core/chart-of-accounts",
      dto,
    );
    return res.data.data;
  },

  updateChartOfAccount: async (
    id: string,
    dto: any,
  ): Promise<ChartOfAccountItem> => {
    const res = await axiosInstance.patch(
      `/api/v1/accounting-core/chart-of-accounts/${id}`,
      dto,
    );
    return res.data.data;
  },

  deleteChartOfAccount: async (id: string): Promise<void> => {
    await axiosInstance.delete(
      `/api/v1/accounting-core/chart-of-accounts/${id}`,
    );
  },
};
