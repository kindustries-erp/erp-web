import axiosInstance from "@/core/api/axiosInstance";

export interface ErpBankAccount {
  id: string;
  branchId: string;
  bankCode: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  currency: string;
  isActive: boolean;
  openingBalance?: number;
  periodDate?: string;
  createdAt: string;
}

export interface ErpCashBook {
  id: string;
  branchId: string;
  name: string;
  currency: string;
  isActive: boolean;
  openingBalance?: number;
  periodDate?: string;
  createdAt: string;
}

export const bankStatementApi = {
  getTransactions: async (params: {
    page?: number;
    pageSize?: number;
    sourceType?: "BANK" | "CASH";
    branchId?: string;
    bankAccountId?: string;
    cashBookId?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: "ASC" | "DESC";
    transactionType?: string;
    tagIds?: string[];
    column_search?: string;
    column_filters?: string;
    correspondentAccount?: string;
    correspondentName?: string;
  }) => {
    const cleanParams = Object.fromEntries(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      Object.entries(params).filter(([_, v]) => v !== undefined && v !== ""),
    );
    const res = await axiosInstance.get(
      "/api/v1/bank-transactions-core/transactions",
      {
        params: cleanParams,
        paramsSerializer: { indexes: null },
      },
    );
    return res.data;
  },

  getColumnOptions: async (
    column: string,
    search: string,
    page: number,
    pageSize: number,
    filtersStr?: string,
    sourceType?: "BANK" | "CASH",
  ) => {
    const res = await axiosInstance.get(
      "/api/v1/bank-transactions-core/transactions/column-options",
      {
        params: {
          column,
          search,
          page,
          pageSize,
          column_filters: filtersStr,
          sourceType,
        },
      },
    );
    return res.data;
  },

  getTransaction: async (id: string) => {
    const res = await axiosInstance.get(
      `/api/v1/bank-transactions-core/transactions/${id}`,
    );
    return res.data;
  },

  getDashboardStats: async (params: {
    startDate?: string;
    endDate?: string;
    sourceType?: "BANK" | "CASH";
    branchId?: string;
    tagIds?: string[];
    correspondentAccount?: string;
    correspondentName?: string;
  }): Promise<{
    totalCashIn: number;
    totalCashOut: number;
    netCashFlow: number;
    cashTrend: Array<{ label: string; cashIn: number; cashOut: number }>;
    categoryBreakdown: Array<{ label: string; color: string; amount: number }>;
    sourceBreakdown: Array<{
      label: string;
      cashIn: number;
      cashOut: number;
      trend: Array<{ label: string; cashIn: number; cashOut: number }>;
    }>;
    topTransactionsIn: Array<any>;
    topTransactionsOut: Array<any>;
  }> => {
    const cleanParams = Object.fromEntries(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      Object.entries(params).filter(([_, v]) => v !== undefined && v !== ""),
    );
    const res = await axiosInstance.get(
      "/api/v1/bank-transactions-core/dashboard-stats",
      {
        params: cleanParams,
        paramsSerializer: { indexes: null },
      },
    );
    return res.data;
  },

  getPartnerStats: async (params: {
    page?: number;
    pageSize?: number;
    startDate?: string;
    endDate?: string;
    sourceType?: "BANK" | "CASH";
    branchId?: string;
    tagIds?: string[];
  }) => {
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([_, v]) => v !== undefined && v !== ""),
    );
    const res = await axiosInstance.get(
      "/api/v1/bank-transactions-core/partner-stats",
      {
        params: cleanParams,
        paramsSerializer: { indexes: null },
      },
    );
    return res.data;
  },

  importFiles: async (data: {
    files: File[];
    branchId: string;
    bankAccountId?: string;
    cashBookId?: string;
  }): Promise<{ success: boolean; count: number; importBatchId: string }> => {
    const formData = new FormData();
    data.files.forEach((f) => formData.append("files", f));
    formData.append("branchId", data.branchId);
    if (data.bankAccountId)
      formData.append("bankAccountId", data.bankAccountId);
    if (data.cashBookId) formData.append("cashBookId", data.cashBookId);

    const res = await axiosInstance.post(
      "/api/v1/bank-transactions-core/transactions/import",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
    return res.data;
  },

  createManualTransaction: async (data: any): Promise<any> => {
    const res = await axiosInstance.post(
      "/api/v1/bank-transactions-core/transactions/manual",
      data,
    );
    return res.data;
  },

  updateTransaction: async (id: string, data: any): Promise<any> => {
    const res = await axiosInstance.patch(
      `/api/v1/bank-transactions-core/transactions/${id}`,
      data,
    );
    return res.data;
  },

  rollbackBatch: async (batchId: string) => {
    const res = await axiosInstance.delete(
      `/api/v1/bank-transactions-core/transactions/batch/${batchId}`,
    );
    return res.data;
  },

  getBankAccounts: async (
    branchId?: string,
    startDate?: string,
    endDate?: string,
  ): Promise<ErpBankAccount[]> => {
    const res = await axiosInstance.get(
      "/api/v1/bank-transactions-core/bank-accounts",
      { params: { branchId, startDate, endDate } },
    );
    return res.data;
  },
  createBankAccount: async (data: any) => {
    const res = await axiosInstance.post(
      "/api/v1/bank-transactions-core/bank-accounts",
      data,
    );
    return res.data;
  },
  updateBankAccount: async (id: string, data: any) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { branchId, ...payload } = data;
    const res = await axiosInstance.patch(
      `/api/v1/bank-transactions-core/bank-accounts/${id}`,
      payload,
    );
    return res.data;
  },

  deleteBankAccount: async (id: string) => {
    const res = await axiosInstance.delete(
      `/api/v1/bank-transactions-core/bank-accounts/${id}`,
    );
    return res.data;
  },

  getCashBooks: async (
    branchId?: string,
    startDate?: string,
    endDate?: string,
  ): Promise<ErpCashBook[]> => {
    const res = await axiosInstance.get(
      "/api/v1/bank-transactions-core/cash-books",
      { params: { branchId, startDate, endDate } },
    );
    return res.data;
  },
  createCashBook: async (data: any) => {
    const res = await axiosInstance.post(
      "/api/v1/bank-transactions-core/cash-books",
      data,
    );
    return res.data;
  },
  updateCashBook: async (id: string, data: any) => {
    const res = await axiosInstance.patch(
      `/api/v1/bank-transactions-core/cash-books/${id}`,
      data,
    );
    return res.data;
  },
  deleteCashBook: async (id: string) => {
    const res = await axiosInstance.delete(
      `/api/v1/bank-transactions-core/cash-books/${id}`,
    );
    return res.data;
  },

  // --- Statement Files ---
  getStatementFiles: async (params: {
    page?: number;
    pageSize?: number;
    branchId?: string;
    bankAccountId?: string;
    cashBookId?: string;
  }) => {
    const cleanParams = Object.fromEntries(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      Object.entries(params).filter(([_, v]) => v !== undefined && v !== ""),
    );
    const res = await axiosInstance.get(
      "/api/v1/bank-transactions-core/statement-files",
      {
        params: cleanParams,
      },
    );
    return res.data;
  },
  createStatementFile: async (data: any) => {
    const res = await axiosInstance.post(
      "/api/v1/bank-transactions-core/statement-files",
      data,
    );
    return res.data;
  },
  deleteStatementFile: async (id: string) => {
    const res = await axiosInstance.delete(
      `/api/v1/bank-transactions-core/statement-files/${id}`,
    );
    return res.data;
  },
};
