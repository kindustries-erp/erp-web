import axiosInstance from "@/core/api/axiosInstance";

export interface InvoiceCashTrend {
  label: string;
  cashIn: number;
  cashOut: number;
}

export interface InvoiceDashboardStats {
  cashTrend: InvoiceCashTrend[];
}

export interface InvoicePartnerInfo {
  taxCode: string;
  partnerName: string;
  totalInAmount: number;
  totalOutAmount: number;
  payableAmount: number;
  receivableAmount: number;
}

export interface InvoiceDashboardPartnersResponse {
  items: InvoicePartnerInfo[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

const BASE = "/api/v1/erp-invoices/dashboard";

export const erpInvoiceDashboardApi = {
  getStats: async (params?: {
    date_from?: string;
    date_to?: string;
    branch_id?: string;
  }): Promise<InvoiceDashboardStats> => {
    const { data } = await axiosInstance.get<InvoiceDashboardStats>(
      `${BASE}/stats`,
      {
        params,
      },
    );
    return data;
  },

  getPartners: async (params?: {
    page?: number;
    pageSize?: number;
    search?: string;
    date_from?: string;
    date_to?: string;
    branch_id?: string;
    sortBy?: string;
    sortOrder?: "ASC" | "DESC";
  }): Promise<InvoiceDashboardPartnersResponse> => {
    const { data } = await axiosInstance.get<InvoiceDashboardPartnersResponse>(
      `${BASE}/partners`,
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
  ): Promise<InvoiceDashboardStats> => {
    const { data } = await axiosInstance.get<InvoiceDashboardStats>(
      `${BASE}/partners/${taxCode}/stats`,
      {
        params,
      },
    );
    return data;
  },
};
