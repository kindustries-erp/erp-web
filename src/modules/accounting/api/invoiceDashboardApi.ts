import axiosInstance from "@/core/api/axiosInstance";

export interface InvoiceCashTrendItem {
  label: string;
  cashIn: number;
  cashOut: number;
  netCash?: number;
  vatIn?: number;
  vatOut?: number;
}

export interface InvoiceDashboardStatsResponse {
  cashTrend: InvoiceCashTrendItem[];
}

export interface InvoiceDashboardStatsParams {
  date_from?: string;
  date_to?: string;
  branch_id?: string;
}

export interface InvoiceDebtsAnalyticsSummary {
  totalReceivable: number;
  paidReceivable: number;
  remainingReceivable: number;
  totalPayable: number;
  paidPayable: number;
  remainingPayable: number;
  netBalance: number;
  collectionRate: number;
  paymentRate: number;
}

export interface InvoiceAgingComparisonItem {
  bracket: "0_30" | "31_60" | "61_90" | "over_90";
  label: string;
  receivableAmount: number;
  payableAmount: number;
  netAmount: number;
}

export interface TimeHorizonItem {
  receivable: number;
  payable: number;
  net: number;
}

export interface InvoiceTimeHorizons {
  nextWeekDue: TimeHorizonItem;
  nextMonthDue: TimeHorizonItem;
  overdue30To90: TimeHorizonItem;
  criticalOverdue90Plus: TimeHorizonItem;
}

export interface TopDebtPartnerItem {
  taxCode: string;
  partnerName: string;
  totalAmount: number;
  balanceAmount: number;
  overdueAmount: number;
  maxAgingDays: number;
}

export interface InvoiceDebtsAnalyticsResponse {
  summary: InvoiceDebtsAnalyticsSummary;
  agingComparison: InvoiceAgingComparisonItem[];
  timeHorizons: InvoiceTimeHorizons;
  cashTrend: (InvoiceCashTrendItem & { netCash: number })[];
  topReceivableCustomers: TopDebtPartnerItem[];
  topPayableSuppliers: TopDebtPartnerItem[];
}

export const invoiceDashboardApi = {
  getStats: async (
    params?: InvoiceDashboardStatsParams,
  ): Promise<InvoiceDashboardStatsResponse> => {
    const { data } = await axiosInstance.get<InvoiceDashboardStatsResponse>(
      "/api/v1/erp-invoices/dashboard/stats",
      { params },
    );
    return data;
  },

  getDebtsAnalytics: async (
    params?: InvoiceDashboardStatsParams,
  ): Promise<InvoiceDebtsAnalyticsResponse> => {
    const { data } = await axiosInstance.get<InvoiceDebtsAnalyticsResponse>(
      "/api/v1/erp-invoices/dashboard/debts-analytics",
      { params },
    );
    return data;
  },
};
