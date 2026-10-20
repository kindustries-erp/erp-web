import axiosInstance from "@/core/api/axiosInstance";

export type GarageTimeHorizonKey =
  | "nextWeekDue"
  | "nextMonthDue"
  | "overdue30To90"
  | "criticalOverdue90Plus"
  | "forecastNext7Days"
  | "forecastNext30Days"
  | "expectedCashflow"
  | "defaultRiskProvision";

export interface GarageDebtsAnalyticsSummary {
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

export interface GarageAgingComparisonItem {
  bracket: "0_30" | "31_60" | "61_90" | "over_90";
  label: string;
  receivableAmount: number;
  payableAmount: number;
  netAmount: number;
}

export interface GarageTimeHorizonItem {
  receivable: number;
  payable: number;
  net: number;
}

export interface GarageTimeHorizonsOverview {
  nextWeekDue: GarageTimeHorizonItem;
  nextMonthDue: GarageTimeHorizonItem;
  overdue30To90: GarageTimeHorizonItem;
  criticalOverdue90Plus: GarageTimeHorizonItem;
}

export interface GarageForecastHorizonsOverview {
  next7Days: GarageTimeHorizonItem;
  next30Days: GarageTimeHorizonItem;
  expectedCashflow: GarageTimeHorizonItem;
  defaultRiskProvision: {
    receivableRisk: number;
    payableRisk: number;
    netRisk: number;
  };
}

export interface GarageCashTrendItem {
  label: string;
  cashIn: number;
  cashOut: number;
  netCash: number;
}

export interface GarageTopDebtPartnerItem {
  partnerCode: string;
  partnerName: string;
  totalAmount: number;
  balanceAmount: number;
  overdueAmount: number;
  maxAgingDays: number;
  caseCount: number;
}

export interface GarageDebtsAnalyticsResponse {
  summary: GarageDebtsAnalyticsSummary;
  agingComparison: GarageAgingComparisonItem[];
  timeHorizons: GarageTimeHorizonsOverview;
  forecastHorizons: GarageForecastHorizonsOverview;
  cashTrend: GarageCashTrendItem[];
  topReceivableCustomers: GarageTopDebtPartnerItem[];
  topPayableSuppliers: GarageTopDebtPartnerItem[];
}

export interface GarageTimeHorizonCaseItem {
  id: string;
  caseId?: string;
  soChungTu: string;
  bienSoXe?: string;
  customerCode?: string;
  customerName?: string;
  supplierCode?: string;
  supplierName?: string;
  direction: "OUT" | "IN";
  totalAmount: number;
  paidAmount: number;
  balanceAmount: number;
  completionDate: string;
  agingDays: number;
  branchExternalId: string;
  status: string;
  description?: string;
}

export interface GarageTimeHorizonCasesSummary {
  horizon: string;
  horizonLabel: string;
  receivableAmount: number;
  payableAmount: number;
  receivableTotalAmount: number;
  payableTotalAmount: number;
  receivedAmount: number;
  paidAmount: number;
  netAmount: number;
  receivableCount: number;
  payableCount: number;
  topPartners: Array<{
    partnerCode: string;
    partnerName: string;
    partnerType: "CUSTOMER" | "SUPPLIER";
    balanceAmount: number;
    caseCount: number;
    sharePercentage: number;
  }>;
  branchBreakdown: Array<{
    branchId: string;
    branchName: string;
    amount: number;
    caseCount: number;
  }>;
  monthlyTrend: Array<{
    month: string;
    receivable: number;
    payable: number;
    caseCount: number;
  }>;
}

export interface GarageTimeHorizonCasesResponse {
  summary: GarageTimeHorizonCasesSummary;
  items: GarageTimeHorizonCaseItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

const BASE = "/api/v1/greenway/dashboard";

export const garageDebtsAnalyticsApi = {
  getDebtsAnalytics: async (params?: {
    date_from?: string;
    date_to?: string;
    branch_id?: string;
  }) => {
    const res = await axiosInstance.get<GarageDebtsAnalyticsResponse>(
      `${BASE}/debts-analytics`,
      { params },
    );
    return res.data;
  },

  getTimeHorizonCases: async (
    horizon: string,
    params?: {
      date_from?: string;
      date_to?: string;
      branch_id?: string;
      direction?: "ALL" | "IN" | "OUT";
      search?: string;
      page?: number;
      pageSize?: number;
      sortBy?: string;
      sortOrder?: "ASC" | "DESC" | "asc" | "desc";
      column_search?: string;
      column_filters?: string;
    },
  ) => {
    const res = await axiosInstance.get<GarageTimeHorizonCasesResponse>(
      `${BASE}/time-horizons/${encodeURIComponent(horizon)}/cases`,
      { params },
    );
    return res.data;
  },
};
