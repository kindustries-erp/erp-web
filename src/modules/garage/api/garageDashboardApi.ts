import axiosInstance from "@/core/api/axiosInstance";

export interface GarageTrendItem {
  label: string;
  revenue: number;
  cost: number;
  profit: number;
  margin: number;
  paid: number;
  receivable: number;
  tienCoThue?: number;
  totalBilled?: number;
  collectionRate: number;
  paidCost: number;
  payableCost: number;
  costPaymentRate: number;
  collectionRateDiff: number;
  costPaymentRateDiff: number;
  caseCount: number;

  // Invoice breakdowns for Receivables
  caseCountWithInvoice?: number;
  caseCountNoInvoice?: number;
  billedWithInvoice?: number;
  paidWithInvoice?: number;
  receivableWithInvoice?: number;
  rateWithInvoice?: number;
  billedNoInvoice?: number;
  paidNoInvoice?: number;
  receivableNoInvoice?: number;
  rateNoInvoice?: number;

  // Invoice breakdowns for Payables
  costWithInvoice?: number;
  paidCostWithInvoice?: number;
  payableCostWithInvoice?: number;
  costRateWithInvoice?: number;
  costNoInvoice?: number;
  paidCostNoInvoice?: number;
  payableCostNoInvoice?: number;
  costRateNoInvoice?: number;
}

export interface GarageCollectionSummary {
  totalBilled: number;
  totalTienCoThue?: number;
  totalRevenue: number;
  totalPaid: number;
  totalReceivable: number;
  collectionRate: number;
}

export interface GarageCostPaymentSummary {
  totalCost: number;
  totalPaidCost: number;
  totalPayableCost: number;
  paymentRate: number;
}

export interface GarageStatusDistributionItem {
  statusCode: number;
  statusName: string;
  count: number;
  percentage: number;
}

export interface GarageDashboardStatsResponse {
  trend: GarageTrendItem[];
  collectionSummary: GarageCollectionSummary;
  costPaymentSummary: GarageCostPaymentSummary;
  statusDistribution: GarageStatusDistributionItem[];
  statusDistributionByMonth?: Record<string, GarageStatusDistributionItem[]>;
  availableMonths?: string[];
}

export interface GarageKpiPeriod {
  totalRevenue: number;
  totalCost: number;
  totalProfit: number;
  totalTienCoThue?: number;
  totalCount: number;
  revenueChart: number[];
  costChart: number[];
  profitChart: number[];
  tienCoThueChart?: number[];
  labels: string[];
}

export interface GarageCheckpointKpisResponse {
  month: GarageKpiPeriod;
  week: GarageKpiPeriod;
  day: GarageKpiPeriod;
}

export interface GarageCheckpointCaseItem {
  id: string;
  soChungTu: string;
  bienSoXe: string;
  khachHangCode: string;
  khachHangName: string;
  tenTinhTrangDichVu: string;
  doanhThu: number;
  chiPhi: number;
  loiNhuan: number;
  tienDaThanhToan: number;
  tienConPhaiThanhToan: number;
  ngayHoanThanhCongViec?: string;
  ngayPhatSinh: string;
}

export interface GarageCheckpointCasesResponse {
  items: GarageCheckpointCaseItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface GarageCustomerDebtInfo {
  customerCode: string;
  customerName: string;
  latestLicensePlate: string;
  totalRevenue: number;
  totalCost: number;
  totalGrossProfit: number;
  margin: number;
  paidAmount: number;
  receivableAmount: number;
  caseCount: number;
  lastVisitDate: string;
}

export interface GarageCustomersDebtResponse {
  items: GarageCustomerDebtInfo[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

const BASE = "/api/v1/greenway/dashboard";

export const garageDashboardApi = {
  getStats: async (params?: {
    date_from?: string;
    date_to?: string;
  }): Promise<GarageDashboardStatsResponse> => {
    const { data } = await axiosInstance.get<GarageDashboardStatsResponse>(
      `${BASE}/stats`,
      { params },
    );
    return data;
  },

  getCheckpointKpis: async (): Promise<GarageCheckpointKpisResponse> => {
    const { data } = await axiosInstance.get<GarageCheckpointKpisResponse>(
      `${BASE}/checkpoint-kpis`,
    );
    return data;
  },

  getCheckpointCases: async (params: {
    date_from: string;
    date_to: string;
    page?: number;
    pageSize?: number;
  }): Promise<GarageCheckpointCasesResponse> => {
    const { data } = await axiosInstance.get<GarageCheckpointCasesResponse>(
      `${BASE}/checkpoint-cases`,
      { params },
    );
    return data;
  },

  getCustomers: async (params?: {
    page?: number;
    pageSize?: number;
    search?: string;
    date_from?: string;
    date_to?: string;
    sortBy?: string;
    sortOrder?: "ASC" | "DESC";
    column_search?: string;
    column_filters?: string;
  }): Promise<GarageCustomersDebtResponse> => {
    const { data } = await axiosInstance.get<GarageCustomersDebtResponse>(
      `${BASE}/customers`,
      { params },
    );
    return data;
  },

  exportExcel: async (params?: {
    date_from?: string;
    date_to?: string;
  }): Promise<Blob> => {
    const { data } = await axiosInstance.get(`${BASE}/export`, {
      params,
      responseType: "blob",
    });
    return data;
  },
};
