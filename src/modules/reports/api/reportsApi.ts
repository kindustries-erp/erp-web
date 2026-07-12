import axiosInstance from "@/core/api/axiosInstance";

export interface ReportStatusItem {
  status: string;
  count: number;
}

export interface ReportTrendItem {
  month: string;
  qty: number;
}

export interface SalesTopCustomerItem {
  customerId: string | null;
  customerName: string;
  orders: number;
  qty: number;
}

export interface PurchasingTopSupplierItem {
  supplierId: string | null;
  supplierName: string;
  orders: number;
  qty: number;
}

export interface ReportColorItem {
  color: string;
  qty: number;
  customers: string;
}

export interface SalesDashboardResponse {
  dateFrom: string | null;
  dateTo: string | null;
  kpi: {
    totalOrders: number;
    totalQty: number;
    completionRate: number;
  };
  statusBreakdown: ReportStatusItem[];
  trend: ReportTrendItem[];
  topCustomers: SalesTopCustomerItem[];
  colorBreakdown: ReportColorItem[];
}

export interface PurchasingDashboardResponse {
  dateFrom: string | null;
  dateTo: string | null;
  kpi: {
    totalOrders: number;
    totalQty: number;
    completionRate: number;
  };
  statusBreakdown: ReportStatusItem[];
  trend: ReportTrendItem[];
  topSuppliers: PurchasingTopSupplierItem[];
}

export const reportsApi = {
  async getSalesDashboard(params?: { dateFrom?: string; dateTo?: string }) {
    const { data } = await axiosInstance.get<SalesDashboardResponse>(
      "/api/v1/reports/sales-dashboard",
      { params },
    );
    return data;
  },

  async getPurchasingDashboard(params?: {
    dateFrom?: string;
    dateTo?: string;
  }) {
    const { data } = await axiosInstance.get<PurchasingDashboardResponse>(
      "/api/v1/reports/purchasing-dashboard",
      { params },
    );
    return data;
  },
};
