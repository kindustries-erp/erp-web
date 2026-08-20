import axiosInstance from "@/core/api/axiosInstance";

export interface GarageTrendItem {
  label: string;
  revenue: number;
  cost: number;
  profit: number;
  margin: number;
  caseCount: number;
  servicesRevenue: number;
  partsRevenue: number;
  partsCost: number;
}

export interface GarageDashboardStatsResponse {
  trend: GarageTrendItem[];
}

export interface GarageKpiPeriod {
  totalRevenue: number;
  totalCost: number;
  totalProfit: number;
  totalCount: number;
  revenueChart: number[];
  costChart: number[];
  profitChart: number[];
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
