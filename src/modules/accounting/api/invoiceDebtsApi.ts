import axiosInstance from "@/core/api/axiosInstance";

export type InvoicePartnerType = "CUSTOMER" | "SUPPLIER";

export interface InvoiceDebtItem {
  taxCode: string;
  partnerName: string;
  address?: string;
  invoiceCount: number;
  totalAmount: number;
  paidAmount: number;
  balanceAmount: number;
  maxAgingDays: number;
  weightedAgingDays?: number;
  latestInvoiceDate: string | null;
  // Aging Buckets breakdown
  aging0To30?: number;
  aging31To60?: number;
  aging61To90?: number;
  agingOver90?: number;
  count0To30?: number;
  count31To60?: number;
  count61To90?: number;
  countOver90?: number;
}

export interface InvoiceDebtSummary {
  totalPartners: number;
  totalInvoiceCount: number;
  grandTotalAmount: number;
  grandTotalPaid: number;
  grandTotalBalance: number;
  grandTotalAging0To30?: number;
  grandTotalAging31To60?: number;
  grandTotalAging61To90?: number;
  grandTotalAgingOver90?: number;
  cumulativeTotalAmount?: number;
  cumulativePaidAmount?: number;
  cumulativeBalanceAmount?: number;
  cumulativeInvoiceCount?: number;
  cumulativePartnersCount?: number;
  cumulativeAging0To30?: number;
  cumulativeAging31To60?: number;
  cumulativeAging61To90?: number;
  cumulativeAgingOver90?: number;
}

export interface InvoiceDebtsResponse {
  items: InvoiceDebtItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  summary: InvoiceDebtSummary;
}

export interface ColumnOptionItem {
  label: string;
  value: string;
}

export interface ColumnOptionsResponse {
  items: ColumnOptionItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  next: number | null;
}

export interface PartnerInvoiceDetailItem {
  id: string;
  invoiceNo: string;
  serialNo: string;
  invoiceDate: string;
  direction: "IN" | "OUT";
  sellerName?: string;
  sellerTaxCode?: string;
  sellerAddress?: string;
  buyerName?: string;
  buyerTaxCode?: string;
  buyerAddress?: string;
  preVatAmount: number;
  vatAmount: number;
  totalAmount: number;
  paidAmount: number;
  balanceAmount: number;
  agingDays: number;
  status: string;
  taxInvoiceStatus?: number;
  description?: string;
}

export interface InvoiceCashTrend {
  label: string;
  cashIn: number;
  cashOut: number;
}

export interface InvoicePartnerStatsResponse {
  cashTrend: InvoiceCashTrend[];
}

export interface GetInvoiceDebtsQueryParams {
  partner_type?: InvoicePartnerType;
  page?: number;
  pageSize?: number;
  search?: string;
  date_from?: string;
  date_to?: string;
  branch_id?: string;
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
  column_search?: string;
  column_filters?: string;
}

export interface InvoiceDebtExportHistoryItem {
  jobId: string;
  fileName: string;
  status: "RUNNING" | "COMPLETED" | "FAILED";
  current: number;
  total: number;
  message: string;
  createdAt: string;
  finishedAt?: string;
  expiresAt?: string;
  dateFrom?: string;
  dateTo?: string;
  partnerType?: string;
  canDownload: boolean;
}

export interface InvoiceDebtExportHistoryResponse {
  items: InvoiceDebtExportHistoryItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface InvoiceDebtExportBackgroundStartResult {
  jobId: string;
  message: string;
  reused?: boolean;
}

async function resolveBlobErrorMessage(
  error: any,
  fallback: string,
): Promise<string> {
  const data = error?.response?.data;
  if (data instanceof Blob) {
    try {
      const text = await data.text();
      const parsed = JSON.parse(text);
      return parsed?.message || text || fallback;
    } catch {
      return fallback;
    }
  }
  return error?.response?.data?.message || error?.message || fallback;
}

const BASE = "/api/v1/erp-invoices/debts";

export const invoiceDebtsApi = {
  getDebts: async (
    params?: GetInvoiceDebtsQueryParams,
  ): Promise<InvoiceDebtsResponse> => {
    const { data } = await axiosInstance.get<InvoiceDebtsResponse>(BASE, {
      params,
    });
    return data;
  },

  getColumnOptions: async (params: {
    partner_type?: InvoicePartnerType;
    column_key: string;
    search?: string;
    page?: number;
    pageSize?: number;
    filters?: string;
    date_from?: string;
    date_to?: string;
    branch_id?: string;
  }): Promise<ColumnOptionsResponse> => {
    const { data } = await axiosInstance.get<ColumnOptionsResponse>(
      `${BASE}/column-options`,
      {
        params,
      },
    );
    return data;
  },

  getPartnerInvoices: async (
    taxCode: string,
    params?: {
      partner_type?: InvoicePartnerType;
      date_from?: string;
      date_to?: string;
      partner_name?: string;
    },
  ): Promise<PartnerInvoiceDetailItem[]> => {
    const { data } = await axiosInstance.get<PartnerInvoiceDetailItem[]>(
      `${BASE}/${encodeURIComponent(taxCode)}/invoices`,
      {
        params,
      },
    );
    return data;
  },

  getPartnerStats: async (
    taxCode: string,
    params?: {
      date_from?: string;
      date_to?: string;
    },
  ): Promise<InvoicePartnerStatsResponse> => {
    const { data } = await axiosInstance.get<InvoicePartnerStatsResponse>(
      `/api/v1/erp-invoices/dashboard/partners/${encodeURIComponent(taxCode)}/stats`,
      {
        params,
      },
    );
    return data;
  },

  exportExcel: async (params?: GetInvoiceDebtsQueryParams): Promise<Blob> => {
    try {
      const { data } = await axiosInstance.get<Blob>(`${BASE}/export/excel`, {
        params,
        responseType: "blob",
      });
      return data;
    } catch (error: any) {
      throw new Error(
        await resolveBlobErrorMessage(error, "Xuất Excel công nợ thất bại"),
      );
    }
  },

  startExportExcelBackground: async (
    params: GetInvoiceDebtsQueryParams,
  ): Promise<InvoiceDebtExportBackgroundStartResult> => {
    const { data } =
      await axiosInstance.post<InvoiceDebtExportBackgroundStartResult>(
        `${BASE}/export/excel/background`,
        params,
      );
    return data;
  },

  downloadExportExcelBackground: async (jobId: string): Promise<Blob> => {
    try {
      const { data } = await axiosInstance.get<Blob>(
        `${BASE}/export/excel/background/${encodeURIComponent(jobId)}/download`,
        {
          responseType: "blob",
        },
      );
      return data;
    } catch (error: any) {
      throw new Error(
        await resolveBlobErrorMessage(error, "Tải file Excel công nợ thất bại"),
      );
    }
  },

  listExportExcelBackgroundHistory: async (
    page = 1,
    pageSize = 10,
  ): Promise<InvoiceDebtExportHistoryResponse> => {
    const { data } = await axiosInstance.get<InvoiceDebtExportHistoryResponse>(
      `${BASE}/export/excel/background/history`,
      {
        params: {
          page,
          pageSize,
        },
      },
    );
    return data;
  },
};
