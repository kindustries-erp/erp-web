import axiosInstance from "@/core/api/axiosInstance";

const BASE = "/api/v1/greenway";

export const garageApi = {
  getBranches: async () => {
    const res = await axiosInstance.get(`${BASE}/branches`);
    return res.data;
  },

  getCases: async (
    branchId?: string,
    page: number = 1,
    pageSize: number = 20,
    q: string = "",
  ) => {
    const params = new URLSearchParams();
    params.append("page", page.toString());
    params.append("pageSize", pageSize.toString());
    if (q) params.append("q", q);

    const res = await axiosInstance.get(`${BASE}/cases?${params.toString()}`, {
      headers: {
        "x-greenway-branch-id": branchId || "",
      },
    });
    return res.data;
  },

  syncBranches: async () => {
    const res = await axiosInstance.post(`${BASE}/sync/branches`);
    return res.data;
  },

  syncCases: async (branchId: string, from?: string, to?: string) => {
    const params = new URLSearchParams();
    if (from) params.append("from", from);
    if (to) params.append("to", to);

    const res = await axiosInstance.post(
      `${BASE}/sync/cases?${params.toString()}`,
      {},
      {
        headers: {
          "x-greenway-branch-id": branchId,
        },
      },
    );
    return res.data;
  },

  syncCaseDetail: async (branchId: string, caseId: string) => {
    const res = await axiosInstance.post(
      `${BASE}/sync/cases/${caseId}/detail`,
      {},
      {
        headers: {
          "x-greenway-branch-id": branchId,
        },
      },
    );
    return res.data;
  },

  syncReceivables: async (branchId: string, from?: string, to?: string) => {
    const params = new URLSearchParams();
    if (from) params.append("from", from);
    if (to) params.append("to", to);

    const res = await axiosInstance.post(
      `${BASE}/sync/receivables?${params.toString()}`,
      {},
      {
        headers: {
          "x-greenway-branch-id": branchId,
        },
      },
    );
    return res.data;
  },

  syncPayables: async (branchId: string, from?: string, to?: string) => {
    const params = new URLSearchParams();
    if (from) params.append("from", from);
    if (to) params.append("to", to);

    const res = await axiosInstance.post(
      `${BASE}/sync/payables?${params.toString()}`,
      {},
      {
        headers: {
          "x-greenway-branch-id": branchId,
        },
      },
    );
    return res.data;
  },

  getDashboard: async (branchId: string, from?: string, to?: string) => {
    const params = new URLSearchParams();
    if (from) params.append("from", from);
    if (to) params.append("to", to);

    const res = await axiosInstance.get(
      `${BASE}/dashboard?${params.toString()}`,
      {
        headers: {
          "x-greenway-branch-id": branchId,
        },
      },
    );
    return res.data;
  },

  getReceivables: async (branchId: string) => {
    const res = await axiosInstance.get(`${BASE}/receivables`, {
      headers: {
        "x-greenway-branch-id": branchId,
      },
    });
    return res.data;
  },

  getPayables: async (branchId: string) => {
    const res = await axiosInstance.get(`${BASE}/payables`, {
      headers: {
        "x-greenway-branch-id": branchId,
      },
    });
    return res.data;
  },

  getCaseServices: async (caseId: string) => {
    const res = await axiosInstance.get(`${BASE}/cases/${caseId}/services`);
    return res.data;
  },

  getCasePayments: async (caseId: string) => {
    const res = await axiosInstance.get(`${BASE}/cases/${caseId}/payments`);
    return res.data;
  },
  getGrossProfit: async (branchId: string, from?: string, to?: string) => {
    const params = new URLSearchParams();
    if (from) params.append("from", from);
    if (to) params.append("to", to);
    const res = await axiosInstance.get(`/api/v1/kgara/reports/gross-profit-detail?${params.toString()}`, {
      headers: { "x-kgara-branch-id": branchId },
    });
    return res.data;
  },
  getGrossProfitJournal: async (branchId: string, from?: string, to?: string) => {
    const params = new URLSearchParams();
    if (from) params.append("from", from);
    if (to) params.append("to", to);
    const res = await axiosInstance.get(`/api/v1/kgara/reports/gross-profit-detail/journal?${params.toString()}`, {
      headers: { "x-kgara-branch-id": branchId },
    });
    return res.data;
  },
};
