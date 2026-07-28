import axiosInstance from "@/core/api/axiosInstance";

const BASE = "/api/v1/greenway";

export const garageApi = {
  getBranches: async () => {
    const res = await axiosInstance.get(`${BASE}/branches`);
    return res.data;
  },

  getCases: async (
    branchId: string,
    page: number = 1,
    pageSize: number = 20,
    q: string = "",
    from?: string,
    to?: string,
  ) => {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
      q,
    });
    if (from) params.append("from", from);
    if (to) params.append("to", to);

    const res = await axiosInstance.get(`${BASE}/cases?${params.toString()}`, {
      headers: {
        "x-greenway-branch-id": branchId || "",
      },
    });
    return res.data;
  },

  getCaseById: async (id: string) => {
    const res = await axiosInstance.get(`${BASE}/cases/${id}`);
    return res.data;
  },

  getCaseByExternalId: async (externalId: string, branchId?: string) => {
    let url = `${BASE}/cases/external/${externalId}`;
    if (branchId) url += `?branchId=${branchId}`;
    const res = await axiosInstance.get(url);
    return res.data;
  },

  getCaseByCode: async (code: string) => {
    const res = await axiosInstance.get(
      `${BASE}/cases/by-code/${encodeURIComponent(code)}`,
    );
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

  syncGrossProfit: async (branchId: string, from?: string, to?: string) => {
    const params = new URLSearchParams();
    if (from) params.append("from", from);
    if (to) params.append("to", to);

    const res = await axiosInstance.post(
      `${BASE}/sync/gross-profit?${params.toString()}`,
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

  getCaseLinkedInvoices: async (caseId: string) => {
    const res = await axiosInstance.get(
      `${BASE}/cases/${caseId}/linked-invoices`,
    );
    return res.data;
  },

  addCaseLinkedInvoice: async (
    caseId: string,
    invoiceId: string,
    linkType: "IN" | "OUT",
    note?: string,
  ) => {
    const res = await axiosInstance.post(
      `${BASE}/cases/${caseId}/linked-invoices`,
      { invoiceId, linkType, note },
    );
    return res.data;
  },

  removeCaseLinkedInvoice: async (caseId: string, linkedId: string) => {
    const res = await axiosInstance.delete(
      `${BASE}/cases/${caseId}/linked-invoices/${linkedId}`,
    );
    return res.data;
  },
  getGrossProfit: async (branchId: string, from?: string, to?: string) => {
    // Legacy mapping kept for compatibility if needed.
    const params = new URLSearchParams();
    if (from) params.append("from", from);
    if (to) params.append("to", to);
    const res = await axiosInstance.get(
      `/api/v1/kgara/reports/gross-profit-detail?${params.toString()}`,
      {
        headers: { "x-kgara-branch-id": branchId },
      },
    );
    return res.data;
  },

  getGrossProfitByCode: async (code: string) => {
    const res = await axiosInstance.get(
      `${BASE}/cases/by-code/${encodeURIComponent(code)}/gross-profit`,
    );
    return res.data;
  },

  getGrossProfitReport: async (
    branchId: string,
    from?: string,
    to?: string,
  ) => {
    const params = new URLSearchParams();
    if (from) params.append("from", from);
    if (to) params.append("to", to);
    const res = await axiosInstance.get(
      `${BASE}/cases/gross-profit-report?${params.toString()}`,
      {
        headers: { "x-greenway-branch-id": branchId },
      },
    );
    return res.data;
  },

  getGrossProfitLinkedInvoices: async (grossProfitId: string) => {
    const res = await axiosInstance.get(
      `${BASE}/gross-profit/${grossProfitId}/linked-invoices`,
    );
    return res.data;
  },

  addGrossProfitLinkedInvoice: async (
    grossProfitId: string,
    invoiceId: string,
    linkType: "IN" | "OUT",
    note?: string,
  ) => {
    const res = await axiosInstance.post(
      `${BASE}/gross-profit/${grossProfitId}/linked-invoices`,
      { invoiceId, linkType, note },
    );
    return res.data;
  },

  removeGrossProfitLinkedInvoice: async (
    grossProfitId: string,
    linkedId: string,
  ) => {
    const res = await axiosInstance.delete(
      `${BASE}/gross-profit/${grossProfitId}/linked-invoices/${linkedId}`,
    );
    return res.data;
  },

  getGrossProfitJournal: async (
    branchId: string,
    from?: string,
    to?: string,
  ) => {
    const params = new URLSearchParams();
    if (from) params.append("from", from);
    if (to) params.append("to", to);
    const res = await axiosInstance.get(
      `/api/v1/kgara/reports/gross-profit-detail/journal?${params.toString()}`,
      {
        headers: { "x-kgara-branch-id": branchId },
      },
    );
    return res.data;
  },
};
