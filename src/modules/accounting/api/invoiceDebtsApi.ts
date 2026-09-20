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
  latestInvoiceDate: string | null;
}

export interface InvoiceDebtSummary {
  totalPartners: number;
  totalInvoiceCount: number;
  grandTotalAmount: number;
  grandTotalPaid: number;
  grandTotalBalance: number;
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
  buyerName?: string;
  buyerTaxCode?: string;
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

const BASE = "/api/v1/erp-invoices/debts";

export const invoiceDebtsApi = {
  getDebts: async (params?: {
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
  }): Promise<InvoiceDebtsResponse> => {
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
};
