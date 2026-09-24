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

  // Classification breakdowns: Sửa chữa chung
  caseCountSuaChuaChung?: number;
  billedSuaChuaChung?: number;
  paidSuaChuaChung?: number;
  receivableSuaChuaChung?: number;
  receivableWithInvoiceSuaChuaChung?: number;
  receivableNoInvoiceSuaChuaChung?: number;
  rateSuaChuaChung?: number;
  costSuaChuaChung?: number;
  paidCostSuaChuaChung?: number;
  payableCostSuaChuaChung?: number;
  payableCostWithInvoiceSuaChuaChung?: number;
  payableCostNoInvoiceSuaChuaChung?: number;
  costRateSuaChuaChung?: number;

  // Classification breakdowns: Ký gửi / Nội bộ
  caseCountKyGuiNoiBo?: number;
  billedKyGuiNoiBo?: number;
  paidKyGuiNoiBo?: number;
  receivableKyGuiNoiBo?: number;
  receivableWithInvoiceKyGuiNoiBo?: number;
  receivableNoInvoiceKyGuiNoiBo?: number;
  rateKyGuiNoiBo?: number;
  costKyGuiNoiBo?: number;
  paidCostKyGuiNoiBo?: number;
  payableCostKyGuiNoiBo?: number;
  payableCostWithInvoiceKyGuiNoiBo?: number;
  payableCostNoInvoiceKyGuiNoiBo?: number;
  costRateKyGuiNoiBo?: number;

  // Classification breakdowns: OJ Ngoài
  caseCountOj?: number;
  billedOj?: number;
  paidOj?: number;
  receivableOj?: number;
  receivableWithInvoiceOj?: number;
  receivableNoInvoiceOj?: number;
  rateOj?: number;
  costOj?: number;
  paidCostOj?: number;
  payableCostOj?: number;
  payableCostWithInvoiceOj?: number;
  payableCostNoInvoiceOj?: number;
  costRateOj?: number;

  // Classification breakdowns: Khác / Chưa phân loại
  caseCountOther?: number;
  billedOther?: number;
  paidOther?: number;
  receivableOther?: number;
  receivableWithInvoiceOther?: number;
  receivableNoInvoiceOther?: number;
  rateOther?: number;
  costOther?: number;
  paidCostOther?: number;
  payableCostOther?: number;
  payableCostWithInvoiceOther?: number;
  payableCostNoInvoiceOther?: number;
  costRateOther?: number;
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
  revenue: number;
  percentage: number;
  revenuePercentage: number;
}

export interface GarageClassificationDistributionItem {
  classificationKey: string;
  classificationName: string;
  count: number;
  revenue: number;
  percentage: number;
  revenuePercentage: number;
}

export interface GarageConversionFunnelStage {
  count: number;
  amount: number;
  rate?: number;
}

export interface GarageConversionFunnelClassificationItem {
  name: string;
  totalCount: number;
  totalAmount: number;
  inProgressCount: number;
  inProgressAmount: number;
  completedCount: number;
  completedAmount: number;
  cancelledCount: number;
  cancelledAmount: number;
  completionRate: number;
  cancellationRate: number;
}

export interface GarageConversionFunnel {
  totalIntake: GarageConversionFunnelStage;
  inProgress: GarageConversionFunnelStage;
  completed: GarageConversionFunnelStage;
  cancelled: GarageConversionFunnelStage;
  byClassification: {
    SUA_CHUA_CHUNG: GarageConversionFunnelClassificationItem;
    KY_GUI_NOI_BO: GarageConversionFunnelClassificationItem;
    OJ_NGOAI: GarageConversionFunnelClassificationItem;
    KHAC: GarageConversionFunnelClassificationItem;
  };
}

export interface GarageDashboardStatsResponse {
  trend: GarageTrendItem[];
  collectionSummary: GarageCollectionSummary;
  costPaymentSummary: GarageCostPaymentSummary;
  statusDistribution: GarageStatusDistributionItem[];
  statusDistributionByMonth?: Record<string, GarageStatusDistributionItem[]>;
  classificationDistribution?: GarageClassificationDistributionItem[];
  classificationDistributionByMonth?: Record<
    string,
    GarageClassificationDistributionItem[]
  >;
  conversionFunnel?: GarageConversionFunnel;
  conversionFunnelByMonth?: Record<string, GarageConversionFunnel>;
  availableMonths?: string[];
}

export interface GarageKpiPeriod {
  totalRevenue: number;
  totalCost: number;
  totalProfit: number;
  totalTienCoThue?: number;
  totalPaid?: number;
  totalReceivable?: number;
  collectionRate?: number;
  totalCount: number;
  revenueChart: number[];
  costChart: number[];
  profitChart: number[];
  tienCoThueChart?: number[];
  paidChart?: number[];
  receivableChart?: number[];
  labels: string[];
}

export interface GarageProjectedPipelineItem {
  name: string;
  count: number;
  amount: number;
}

export interface GarageProjectedPipeline {
  totalCount: number;
  totalAmount: number;
  byClassification: {
    SUA_CHUA_CHUNG: GarageProjectedPipelineItem;
    KY_GUI_NOI_BO: GarageProjectedPipelineItem;
    OJ_NGOAI: GarageProjectedPipelineItem;
    KHAC: GarageProjectedPipelineItem;
  };
}

export interface GarageCheckpointKpisResponse {
  month: GarageKpiPeriod;
  week: GarageKpiPeriod;
  day: GarageKpiPeriod;
  projectedToday?: GarageProjectedPipeline;
  projectedMonth?: GarageProjectedPipeline;
}

export interface GarageCheckpointCaseItem {
  id: string;
  soChungTu: string;
  bienSoXe: string;
  khachHangCode: string;
  khachHangName: string;
  tenTinhTrangDichVu: string;
  classification?: string;
  doanhThu: number;
  chiPhi: number;
  loiNhuan: number;
  tienCoThue: number;
  tienDaThanhToan: number;
  tienConPhaiThanhToan: number;
  hasInvoice?: boolean;
  ngayHoanThanhCongViec?: string;
  ngayPhatSinh: string;
}

export interface GarageCheckpointSummary {
  totalCount: number;
  totalTienCoThue: number;
  totalRevenue: number;
  totalCost: number;
  totalProfit: number;
  totalPaid: number;
  totalRemaining: number;
  collectionRate: number;
  paidCount: number;
  remainingCount: number;
  unpaidCount: number;
}

export interface GarageClassificationSummaryItem {
  name: string;
  count: number;
  amount: number;
  paid: number;
  remaining: number;
}

export interface GarageCheckpointCasesResponse {
  items: GarageCheckpointCaseItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  summary?: GarageCheckpointSummary;
  classificationSummary?: Record<string, GarageClassificationSummaryItem>;
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
    search?: string;
    payment_status?: "all" | "remaining" | "paid" | "unpaid";
    classification?: string;
    sort_by?: string;
    sort_order?: "ASC" | "DESC";
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
