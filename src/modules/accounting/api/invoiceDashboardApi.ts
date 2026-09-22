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

export interface ForecastHorizonsData {
  next7Days: TimeHorizonItem;
  next30Days: TimeHorizonItem;
  expectedCashflow: TimeHorizonItem;
  defaultRiskProvision: {
    receivableRisk: number;
    payableRisk: number;
    netRisk: number;
  };
}

export interface TopDebtPartnerItem {
  taxCode: string;
  partnerName: string;
  totalAmount: number;
  balanceAmount: number;
  overdueAmount: number;
  maxAgingDays: number;
}

export type TimeHorizonKey =
  | "nextWeekDue"
  | "nextMonthDue"
  | "overdue30To90"
  | "criticalOverdue90Plus"
  | "forecastNext7Days"
  | "forecastNext30Days"
  | "expectedCashflow"
  | "defaultRiskProvision";

export interface TimeHorizonInvoiceItem {
  id: string;
  invoiceNo: string;
  serialNo?: string;
  invoiceDate: string;
  direction: "IN" | "OUT";
  sellerName?: string;
  sellerTaxCode?: string;
  sellerAddress?: string;
  buyerName?: string;
  buyerTaxCode?: string;
  buyerPersonalName?: string;
  buyerCccd?: string;
  buyerAddress?: string;
  partnerName?: string;
  taxCode?: string;
  preVatAmount: number;
  vatAmount: number;
  totalAmount: number;
  paidAmount: number;
  balanceAmount: number;
  agingDays: number;
  partnerAvgLagDays?: number;
  estimatedSettlementDate?: string;
  recoveryProbability?: number;
  status: string;
  taxInvoiceStatus?: number;
  description?: string;
  branchId?: string;
}

export interface TimeHorizonTopPartnerItem {
  taxCode: string;
  partnerName: string;
  balanceAmount: number;
  invoiceCount: number;
}

export interface TimeHorizonDetailSummary {
  horizon: string;
  horizonLabel: string;
  receivableAmount: number;
  payableAmount: number;
  netAmount: number;
  receivableCount: number;
  payableCount: number;
  topReceivablePartners: TimeHorizonTopPartnerItem[];
  topPayablePartners: TimeHorizonTopPartnerItem[];
}

export interface TimeHorizonInvoicesResponse {
  summary: TimeHorizonDetailSummary;
  items: TimeHorizonInvoiceItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface GetTimeHorizonInvoicesParams {
  date_from?: string;
  date_to?: string;
  branch_id?: string;
  direction?: "ALL" | "IN" | "OUT";
  search?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
  column_search?: string;
  column_filters?: string;
}

export interface InvoiceDebtsAnalyticsResponse {
  summary: InvoiceDebtsAnalyticsSummary;
  agingComparison: InvoiceAgingComparisonItem[];
  timeHorizons: InvoiceTimeHorizons;
  forecastHorizons?: ForecastHorizonsData;
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

  getTimeHorizonInvoices: async (
    horizon: string,
    params?: GetTimeHorizonInvoicesParams,
  ): Promise<TimeHorizonInvoicesResponse> => {
    const { data } = await axiosInstance.get<TimeHorizonInvoicesResponse>(
      `/api/v1/erp-invoices/dashboard/time-horizons/${horizon}/invoices`,
      { params },
    );
    return data;
  },
};
