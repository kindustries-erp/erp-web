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
  riskProbability?: number;
  expectedAmount?: number;
  riskAmount?: number;
  status: string;
  taxInvoiceStatus?: number;
  description?: string;
  branchId?: string;
}

export interface TimeHorizonTopPartnerItem {
  taxCode: string;
  partnerName: string;
  balanceAmount: number;
  contributingAmount?: number;
  sharePercentage?: number;
  invoiceCount: number;
  avgLagDays?: number;
  overdueCarriedAmount?: number;
  overdueInvoicesCount?: number;
  isOverdueLag?: boolean;
}

export interface TimeHorizonMonthlyTrendItem {
  month: string;
  outTotal: number;
  outPaid: number;
  outBalance: number;
  inTotal: number;
  inPaid: number;
  inBalance: number;
  invoiceCount: number;
}

export interface TimeHorizonAgingBreakdown {
  outAging0_30: number;
  outAging31_60: number;
  outAging61_90: number;
  outAgingOver90: number;
  inAging0_30: number;
  inAging31_60: number;
  inAging61_90: number;
  inAgingOver90: number;
}

export interface TimeHorizonMaturityBreakdown {
  outDueInPeriodAmount: number;
  outDueInPeriodCount: number;
  outOverdueCarriedAmount: number;
  outOverdueCarriedCount: number;
  inDueInPeriodAmount: number;
  inDueInPeriodCount: number;
  inOverdueCarriedAmount: number;
  inOverdueCarriedCount: number;
}

export interface TimeHorizonTicketSizeBuckets {
  outUnder10mAmount: number;
  outUnder10mCount: number;
  out10mTo50mAmount: number;
  out10mTo50mCount: number;
  out50mTo100mAmount: number;
  out50mTo100mCount: number;
  outOver100mAmount: number;
  outOver100mCount: number;

  inUnder10mAmount: number;
  inUnder10mCount: number;
  in10mTo50mAmount: number;
  in10mTo50mCount: number;
  in50mTo100mAmount: number;
  in50mTo100mCount: number;
  inOver100mAmount: number;
  inOver100mCount: number;
}

export interface TimeHorizonBranchBreakdownItem {
  branchId: string;
  branchName?: string;
  branchCode?: string;
  outAmount: number;
  outCount: number;
  inAmount: number;
  inCount: number;
}

/** Một điểm dữ liệu trong Lịch trình Dự báo Dòng tiền theo Ngày */
export interface TimeHorizonDailyForecastItem {
  /** 'OVERDUE' (quá hạn trôi sang) hoặc 'YYYY-MM-DD' (ngày cụ thể) */
  dateKey: string;
  outAmount: number; // Dự thu
  outCount: number;
  inAmount: number; // Dự chi
  inCount: number;
}

export interface TimeHorizonDetailSummary {
  horizon: string;
  horizonLabel: string;
  receivableAmount: number;
  payableAmount: number;
  receivableTotalAmount?: number;
  payableTotalAmount?: number;
  receivedAmount?: number;
  paidAmount?: number;
  receivableExpectedAmount?: number;
  payableExpectedAmount?: number;
  receivableRiskAmount?: number;
  payableRiskAmount?: number;
  netAmount: number;
  receivableCount: number;
  payableCount: number;
  topReceivablePartners: TimeHorizonTopPartnerItem[];
  topPayablePartners: TimeHorizonTopPartnerItem[];
  monthlyTrend?: TimeHorizonMonthlyTrendItem[];
  agingBreakdown?: TimeHorizonAgingBreakdown;
  maturityBreakdown?: TimeHorizonMaturityBreakdown;
  ticketSizeBuckets?: TimeHorizonTicketSizeBuckets;
  branchBreakdown?: TimeHorizonBranchBreakdownItem[];
  /** Chỉ trả về cho forecastNext7Days / forecastNext30Days */
  dailyForecastTimeline?: TimeHorizonDailyForecastItem[];
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
