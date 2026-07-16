import axiosInstance from "@/core/api/axiosInstance";

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
    const res = await axiosInstance.get(
      "/api/v1/accounting-core/chart-of-accounts",
      { params },
    );
    return res.data;
  },
};
