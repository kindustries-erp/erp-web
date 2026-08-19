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
    filtersStr?: string,
  ) => {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
      q,
    });
    if (from) params.append("from", from);
    if (to) params.append("to", to);
    if (filtersStr) params.append("filtersStr", filtersStr);

    const res = await axiosInstance.get(`${BASE}/cases?${params.toString()}`, {
      headers: {
        "x-greenway-branch-id": branchId || "",
      },
    });
    return res.data;
  },

  getCaseColumnOptions: async (
    branchId: string,
    column: string,
    search: string = "",
    page: number = 1,
    pageSize: number = 20,
    filtersStr?: string,
  ) => {
    const res = await axiosInstance.get(`${BASE}/cases/column-options`, {
      params: {
        column,
        search,
        page,
        pageSize,
        filtersStr,
      },
      headers: {
        "x-greenway-branch-id": branchId || "",
      },
    });
    return res.data as {
      items: string[];
      total: number;
      page: number;
      totalPages: number;
    };
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

  // ─── Case Traceability, Financial Summary & Settlements ───────────────────
  getCaseTraceabilityGraph: async (caseId: string) => {
    const res = await axiosInstance.get(
      `${BASE}/cases/${caseId}/traceability-graph`,
    );
    return res.data;
  },

  getCaseFinancialSummary: async (caseId: string) => {
    const res = await axiosInstance.get(
      `${BASE}/cases/${caseId}/financial-summary`,
    );
    return res.data;
  },

  getCaseSettlements: async (caseId: string) => {
    const res = await axiosInstance.get(`${BASE}/cases/${caseId}/settlements`);
    return res.data;
  },

  getSmartSettlementSuggestions: async (
    caseId: string,
    type: "RECEIPT" | "PAYMENT" = "RECEIPT",
  ): Promise<GarageSmartSettlementSuggestionItem[]> => {
    const res = await axiosInstance.get(
      `${BASE}/cases/${caseId}/smart-settlement-suggestions`,
      {
        params: { type },
      },
    );
    return res.data;
  },

  addCaseSettlement: async (
    caseId: string,
    payload: {
      bankTransactionId?: string;
      settlementType: "RECEIPT" | "PAYMENT";
      sourceChannel?: "ON_SYSTEM" | "OFF_SYSTEM_MANUAL";
      category?: string;
      amount: number;
      transDate?: string;
      partnerName?: string;
      note?: string;
    },
  ) => {
    const res = await axiosInstance.post(
      `${BASE}/cases/${caseId}/settlements`,
      payload,
    );
    return res.data;
  },

  removeCaseSettlement: async (caseId: string, settlementId: string) => {
    const res = await axiosInstance.delete(
      `${BASE}/cases/${caseId}/settlements/${settlementId}`,
    );
    return res.data;
  },

  // ─── Customer Debt & Aging ───────────────────────────────────────────────
  getCustomersDebt: async (params: {
    branchId: string;
    page?: number;
    pageSize?: number;
    q?: string;
    from?: string;
    to?: string;
    sorts?: string[];
    filtersStr?: string;
    column_filters?: string;
    column_search?: string;
  }) => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append("page", params.page.toString());
    if (params.pageSize)
      queryParams.append("pageSize", params.pageSize.toString());
    if (params.q) queryParams.append("q", params.q);
    if (params.from) queryParams.append("from", params.from);
    if (params.to) queryParams.append("to", params.to);
    if (params.sorts && params.sorts.length > 0) {
      params.sorts.forEach((s) => queryParams.append("sorts", s));
    }
    if (params.filtersStr) queryParams.append("filtersStr", params.filtersStr);
    if (params.column_filters)
      queryParams.append("column_filters", params.column_filters);
    if (params.column_search)
      queryParams.append("column_search", params.column_search);

    const res = await axiosInstance.get(
      `${BASE}/cases/customers-debt?${queryParams.toString()}`,
      {
        headers: {
          "x-greenway-branch-id": params.branchId || "",
        },
      },
    );
    return res.data;
  },

  getCustomersDebtColumnOptions: async (
    branchId: string,
    column: string,
    search: string = "",
    page: number = 1,
    pageSize: number = 20,
    filtersStr?: string,
  ) => {
    const res = await axiosInstance.get(
      `${BASE}/cases/customers-debt/column-options`,
      {
        params: { column, search, page, pageSize, filtersStr },
        headers: { "x-greenway-branch-id": branchId || "" },
      },
    );
    return res.data as {
      items: string[];
      total: number;
      page: number;
      totalPages: number;
    };
  },

  getCasesByCustomer: async (branchId: string, customerCode: string) => {
    const res = await axiosInstance.get(
      `${BASE}/cases/by-customer/${encodeURIComponent(customerCode)}`,
      {
        headers: { "x-greenway-branch-id": branchId || "" },
      },
    );
    return res.data;
  },

  // ─── Supplier Debt & Aging ───────────────────────────────────────────────
  getSuppliersDebt: async (params: {
    branchId: string;
    page?: number;
    pageSize?: number;
    q?: string;
    from?: string;
    to?: string;
    sorts?: string[];
    filtersStr?: string;
    column_filters?: string;
    column_search?: string;
  }) => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append("page", params.page.toString());
    if (params.pageSize)
      queryParams.append("pageSize", params.pageSize.toString());
    if (params.q) queryParams.append("q", params.q);
    if (params.from) queryParams.append("from", params.from);
    if (params.to) queryParams.append("to", params.to);
    if (params.sorts && params.sorts.length > 0) {
      params.sorts.forEach((s) => queryParams.append("sorts", s));
    }
    if (params.filtersStr) queryParams.append("filtersStr", params.filtersStr);
    if (params.column_filters)
      queryParams.append("column_filters", params.column_filters);
    if (params.column_search)
      queryParams.append("column_search", params.column_search);

    const res = await axiosInstance.get(
      `${BASE}/payables/suppliers-debt?${queryParams.toString()}`,
      {
        headers: {
          "x-greenway-branch-id": params.branchId || "",
        },
      },
    );
    return res.data;
  },

  getSuppliersDebtColumnOptions: async (
    branchId: string,
    column: string,
    search: string = "",
    page: number = 1,
    pageSize: number = 20,
    filtersStr?: string,
  ) => {
    const res = await axiosInstance.get(
      `${BASE}/payables/suppliers-debt/column-options`,
      {
        params: { column, search, page, pageSize, filtersStr },
        headers: { "x-greenway-branch-id": branchId || "" },
      },
    );
    return res.data as {
      items: string[];
      total: number;
      page: number;
      totalPages: number;
    };
  },

  getCasesBySupplier: async (branchId: string, supplierId: string) => {
    const res = await axiosInstance.get(
      `${BASE}/payables/by-supplier/${encodeURIComponent(supplierId)}/cases`,
      {
        headers: { "x-greenway-branch-id": branchId || "" },
      },
    );
    return res.data;
  },
};

export interface GarageSmartSettlementSuggestionItem {
  txn: {
    id: string;
    transDate: string;
    referenceNumber?: string;
    seqNo?: string;
    description: string;
    debitAmount: number;
    creditAmount: number;
    sourceType: string;
    correspondentName?: string;
    bankAccount?: {
      bankName?: string;
      accountNumber?: string;
    };
    cashBook?: {
      name?: string;
    };
    remainingAmount: number;
  };
  score: {
    score: number;
    amountMatch: boolean;
    codeMatch: boolean;
    plateMatch: boolean;
    customerMatch: boolean;
    badge:
      | "PERFECT"
      | "HIGH"
      | "LIKELY"
      | "POSSIBLE"
      | "NOTICE_STRONG"
      | "NOTICE";
  };
  matchedKeywords: string[];
}
