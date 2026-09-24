import axiosInstance from "@/core/api/axiosInstance";

const BASE = "/api/v1/greenway";

export interface ExportCompletedCasesParams {
  branchId?: string;
  date_from?: string;
  date_to?: string;
  date_type?: "completion_date" | "case_date";
  classification?: string;
  status?: string;
  q?: string;
  customFileName?: string;
}

export interface KgaraCaseServiceRow {
  id: string;
  hdPhieuDichVuChiTietId?: string;
  hdPhieuDichVuId?: string;
  soChungTu?: string;
  bienSoXe?: string;
  khachHangCode?: string;
  khachHangName?: string;
  caseDate?: string;
  completionDate?: string;
  branchExternalId?: string;
  branchName?: string;
  status?: number;
  statusName?: string;
  classification?: string;
  sanPhamCode?: string;
  sanPhamName?: string;
  noiDungChiTiet?: string;
  loaiSanPhamCode?: string;
  donViTinhText?: string;
  soLuongHoaDon?: number;
  donGia?: number;
  tienChuaThue?: number;
  thueSuat?: number;
  tienCoThue?: number;
  soGioCongLam?: number;
  tienDichVu?: number;
  tienPhuTung?: number;
  giaVonPhuTung?: number;
  tyLeChietKhauCt?: number;
  tienChietKhauCt?: number;
  khoCode?: string;
  tienPhuPhi?: number;
}

export interface CaseServicesTotals {
  soLuongHoaDon: number;
  tienChuaThue: number;
  tienCoThue: number;
  tienDichVu: number;
  tienPhuTung: number;
  giaVonPhuTung: number;
  tienChietKhauCt: number;
  tienPhuPhi: number;
}

export interface CaseServicesResponse {
  data: KgaraCaseServiceRow[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
  totals?: {
    grandTotal: CaseServicesTotals;
    cumulative?: CaseServicesTotals;
  };
}

export const garageApi = {
  exportCompletedCasesExcel: async (
    params: ExportCompletedCasesParams,
  ): Promise<string> => {
    const searchParams = new URLSearchParams();
    if (params.date_from) searchParams.append("date_from", params.date_from);
    if (params.date_to) searchParams.append("date_to", params.date_to);
    if (params.date_type) searchParams.append("date_type", params.date_type);
    if (params.classification)
      searchParams.append("classification", params.classification);
    if (params.status) searchParams.append("status", params.status);
    if (params.branchId) searchParams.append("branch_id", params.branchId);
    if (params.q) searchParams.append("q", params.q);

    const res = await axiosInstance.get(
      `${BASE}/cases/export/excel?${searchParams.toString()}`,
      {
        responseType: "blob",
        headers: {
          "x-greenway-branch-id": params.branchId || "",
        },
      },
    );

    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    const timestamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
    const fileName =
      params.customFileName ||
      `Bang_ke_phieu_dich_vu_ket_thuc_${timestamp}.xlsx`;

    const blob = new Blob([res.data], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    return fileName;
  },

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
    includeDeleted?: string,
    sorts?: string | string[],
  ) => {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
      q,
    });
    if (from) params.append("from", from);
    if (to) params.append("to", to);
    if (filtersStr) params.append("filtersStr", filtersStr);
    if (includeDeleted) params.append("includeDeleted", includeDeleted);
    if (sorts) {
      if (Array.isArray(sorts)) {
        sorts.forEach((s) => params.append("sorts", s));
      } else {
        params.append("sorts", sorts);
      }
    }

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

  getCaseServicesList: async (
    branchId: string,
    page: number = 1,
    pageSize: number = 20,
    q: string = "",
    from?: string,
    to?: string,
    serviceType?: string,
    filtersStr?: string,
    sorts?: string | string[],
  ): Promise<CaseServicesResponse> => {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
      q,
    });
    if (from) params.append("from", from);
    if (to) params.append("to", to);
    if (serviceType && serviceType !== "ALL")
      params.append("serviceType", serviceType);
    if (filtersStr) params.append("filtersStr", filtersStr);
    if (sorts) {
      if (Array.isArray(sorts)) {
        sorts.forEach((s) => params.append("sorts", s));
      } else {
        params.append("sorts", sorts);
      }
    }

    const res = await axiosInstance.get(
      `${BASE}/cases/services?${params.toString()}`,
      {
        headers: {
          "x-greenway-branch-id": branchId || "",
        },
      },
    );
    return res.data;
  },

  getCaseServiceColumnOptions: async (
    branchId: string,
    column: string,
    search: string = "",
    page: number = 1,
    pageSize: number = 20,
    filtersStr?: string,
    serviceType?: string,
  ) => {
    const res = await axiosInstance.get(
      `${BASE}/cases/services/column-options`,
      {
        params: {
          column,
          search,
          page,
          pageSize,
          filtersStr,
          serviceType: serviceType !== "ALL" ? serviceType : undefined,
        },
        headers: {
          "x-greenway-branch-id": branchId || "",
        },
      },
    );
    return res.data as {
      items: string[];
      total: number;
      page: number;
      totalPages: number;
    };
  },

  exportCaseServicesExcel: async (params: {
    branchId?: string;
    from?: string;
    to?: string;
    serviceType?: string;
    filtersStr?: string;
    sorts?: string | string[];
    q?: string;
    customFileName?: string;
  }): Promise<string> => {
    const searchParams = new URLSearchParams();
    if (params.from) searchParams.append("from", params.from);
    if (params.to) searchParams.append("to", params.to);
    if (params.serviceType && params.serviceType !== "ALL")
      searchParams.append("serviceType", params.serviceType);
    if (params.filtersStr) searchParams.append("filtersStr", params.filtersStr);
    if (params.branchId) searchParams.append("branch_id", params.branchId);
    if (params.q) searchParams.append("q", params.q);
    if (params.sorts) {
      if (Array.isArray(params.sorts)) {
        params.sorts.forEach((s) => searchParams.append("sorts", s));
      } else {
        searchParams.append("sorts", params.sorts);
      }
    }

    const res = await axiosInstance.get(
      `${BASE}/cases/services/export/excel?${searchParams.toString()}`,
      {
        responseType: "blob",
        headers: {
          "x-greenway-branch-id": params.branchId || "",
        },
      },
    );

    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    const timestamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
    const fileName =
      params.customFileName || `Chi_tiet_phieu_dich_vu_${timestamp}.xlsx`;

    const blob = new Blob([res.data], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    return fileName;
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

  updateCaseConfig: async (
    caseId: string,
    payload: { classification?: string | null; erpNotes?: string | null },
  ) => {
    const res = await axiosInstance.patch(
      `${BASE}/cases/${caseId}/config`,
      payload,
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

  syncCaseDetails: async (
    branchId?: string,
    from?: string,
    to?: string,
    force?: boolean,
  ) => {
    const params = new URLSearchParams();
    if (from) params.append("from", from);
    if (to) params.append("to", to);
    if (force) params.append("force", "true");
    if (branchId) params.append("branch_id", branchId);

    const res = await axiosInstance.post(
      `${BASE}/sync/case-details?${params.toString()}`,
      {},
      {
        headers: {
          "x-greenway-branch-id": branchId || "",
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

  addCaseLinkedInvoices: async (
    caseId: string,
    items: Array<{
      invoiceId: string;
      linkType: "IN" | "OUT";
      note?: string;
    }>,
  ) => {
    const res = await axiosInstance.post(
      `${BASE}/cases/${caseId}/linked-invoices`,
      { items },
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

  getSmartInvoiceSuggestions: async (
    caseId: string,
    direction: "IN" | "OUT" = "OUT",
  ): Promise<GarageSmartInvoiceSuggestionItem[]> => {
    const res = await axiosInstance.get(
      `${BASE}/cases/${caseId}/smart-invoice-suggestions`,
      {
        params: { direction },
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

  updateCaseSettlement: async (
    caseId: string,
    settlementId: string,
    payload: {
      amount?: number;
      category?: string;
      note?: string;
      transDate?: string;
      partnerName?: string;
    },
  ) => {
    const res = await axiosInstance.patch(
      `${BASE}/cases/${caseId}/settlements/${settlementId}`,
      payload,
    );
    return res.data;
  },

  // ─── Customer Debt & Aging ───────────────────────────────────────────────
  getCustomersDebt: async (params: {
    branchId?: string;
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
    branchId: string | undefined,
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
    alreadySettledForThisCase?: boolean;
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

export interface GarageSmartInvoiceSuggestionItem {
  invoice: {
    id: string;
    invoiceNo: string;
    serialNo?: string;
    invoiceDate: string;
    direction: "IN" | "OUT";
    sellerName?: string;
    buyerName?: string;
    sellerTaxCode?: string;
    buyerTaxCode?: string;
    totalAmount: number;
    preVatAmount: number;
    vatAmount: number;
    vatRate?: number;
    licensePlate?: string;
    settlementOrder?: string;
    description?: string;
    status?: string;
    xmlFileKey?: string;
    pdfFileKey?: string;
  };
  score: {
    score: number;
    amountMatch: boolean;
    plateMatch: boolean;
    orderMatch: boolean;
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
