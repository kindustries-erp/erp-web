import axiosInstance from "@/core/api/axiosInstance";
import {
  erpInvoiceDashboardApi,
  type InvoiceDashboardStats,
  type InvoiceDashboardPartnersResponse,
  type InvoicePartnerInfo,
} from "@/modules/erp-invoices-core/api/erpInvoiceDashboardApi";

export interface DashboardDateParams {
  dateFrom?: string;
  dateTo?: string;
  branchId?: string;
}

export interface PaginatedParams extends DashboardDateParams {
  page?: number;
  pageSize?: number;
  columnSearch?: Record<string, string>;
  columnFilters?: Record<string, string[]>;
  sorts?: string[];
  search?: string;
}

export interface SettlementRow {
  settlementOrder: string;
  period: string;
  licensePlate: string;
  invoiceCount: number;
  totalPreVat: number;
  totalVat: number;
  totalAmount: number;
  totalNetoff: number;
  remaining: number;
}

export interface SettlementOrdersResponse {
  items: SettlementRow[];
  total: number;
  page: number;
  totalPages: number;
  summary?: {
    totalPreVat: number;
    totalVat: number;
    totalAmount: number;
    totalNetoff: number;
    remaining: number;
  };
}

export interface VinfastPartsSummary {
  summary: {
    revenue: number;
    cogs: number;
    grossProfit: number;
    inventoryValue: number;
    totalBuy: number;
    totalSell: number;
    profit: number;
    byVehicleType: {
      CAR: {
        revenue: number;
        cogs: number;
        grossProfit: number;
        inventoryValue: number;
      };
      MOTORBIKE: {
        revenue: number;
        cogs: number;
        grossProfit: number;
        inventoryValue: number;
      };
    };
  };
  charts: {
    revenue: number[];
    cogs: number[];
    grossProfit: number[];
    inventoryValue: number[];
  };
  trend: Array<{
    month: string;
    revenue: number;
    cogs: number;
    grossProfit: number;
    inventoryValue: number;
    totalBuy: number;
    totalSell: number;
    profit: number;
  }>;
}

export interface VinfastPartsTableRow {
  itemCode: string;
  itemName: string;
  qtyBought: number;
  amountBought: number;
  qtySold: number;
  amountSold: number;
  profit: number;
}

export interface VinfastPartsTableResponse {
  items: VinfastPartsTableRow[];
  total: number;
  page: number;
  totalPages: number;
}

export const workshopDashboardApi = {
  getInvoiceStats: (
    params?: DashboardDateParams,
  ): Promise<InvoiceDashboardStats> =>
    erpInvoiceDashboardApi.getStats({
      date_from: params?.dateFrom,
      date_to: params?.dateTo,
      branch_id: params?.branchId,
    }),

  getInvoicePartners: (
    params?: PaginatedParams,
  ): Promise<InvoiceDashboardPartnersResponse> =>
    erpInvoiceDashboardApi.getPartners({
      page: params?.page,
      pageSize: params?.pageSize,
      search: params?.search,
      date_from: params?.dateFrom,
      date_to: params?.dateTo,
      branch_id: params?.branchId,
      sortBy: params?.sorts?.[0]?.startsWith("-")
        ? params.sorts[0].slice(1)
        : params?.sorts?.[0],
      sortOrder: params?.sorts?.[0]?.startsWith("-") ? "DESC" : "ASC",
      column_search: params?.columnSearch
        ? JSON.stringify(params.columnSearch)
        : undefined,
      column_filters: params?.columnFilters
        ? JSON.stringify(params.columnFilters)
        : undefined,
    }),

  getSettlementOrders: async (
    params?: PaginatedParams,
  ): Promise<SettlementOrdersResponse> => {
    const res = await axiosInstance.get("/api/v1/reports/settlement-orders", {
      params: {
        page: params?.page ?? 1,
        limit: params?.pageSize ?? 50,
        dateFrom: params?.dateFrom,
        dateTo: params?.dateTo,
        search: params?.search,
        sortBy: params?.sorts?.[0]?.startsWith("-")
          ? params.sorts[0].slice(1)
          : params?.sorts?.[0],
        sortDir: params?.sorts?.[0]?.startsWith("-") ? "DESC" : "ASC",
        columnSearch: params?.columnSearch
          ? JSON.stringify(params.columnSearch)
          : undefined,
        columnFilters: params?.columnFilters
          ? JSON.stringify(params.columnFilters)
          : undefined,
      },
    });
    return res.data;
  },

  getSettlementSummary: async (
    params?: DashboardDateParams,
  ): Promise<{
    totalOrders: number;
    totalSettled: number;
    totalRemaining: number;
    totalAmount: number;
    totalNetoff: number;
  }> => {
    const res = await workshopDashboardApi.getSettlementOrders({
      ...params,
      page: 1,
      pageSize: 200,
    });
    const items = res.items || [];
    return {
      totalOrders: res.total || items.length,
      totalSettled: items.reduce(
        (acc, r) => acc + (Number(r.totalNetoff) || 0),
        0,
      ),
      totalRemaining: items.reduce(
        (acc, r) => acc + (Number(r.remaining) || 0),
        0,
      ),
      totalAmount: items.reduce(
        (acc, r) => acc + (Number(r.totalAmount) || 0),
        0,
      ),
      totalNetoff: items.reduce(
        (acc, r) => acc + (Number(r.totalNetoff) || 0),
        0,
      ),
    };
  },

  getSettlementColumnOptions: async (params: {
    columnKey: string;
    search: string;
    page: number;
    limit: number;
    filtersStr?: string;
    dateFrom?: string;
    dateTo?: string;
  }) => {
    const res = await axiosInstance.get(
      "/api/v1/reports/settlement-orders/column-options",
      { params },
    );
    return res.data;
  },

  getVinfastPartsSummary: async (
    params?: DashboardDateParams & {
      vehicleType?: string;
      groupBy?: string;
      itemCode?: string;
    },
  ): Promise<VinfastPartsSummary> => {
    const res = await axiosInstance.get(
      "/api/v1/reports/vinfast-parts-dashboard",
      {
        params: {
          dateFrom: params?.dateFrom,
          dateTo: params?.dateTo,
          vehicleType: params?.vehicleType,
          groupBy: params?.groupBy || "month",
          itemCode: params?.itemCode,
        },
      },
    );
    return res.data;
  },

  getVinfastPartsTable: async (
    params: PaginatedParams & { vehicleType: "CAR" | "MOTORBIKE" },
  ): Promise<VinfastPartsTableResponse> => {
    const res = await axiosInstance.get(
      "/api/v1/reports/vinfast-parts-dashboard-table",
      {
        params: {
          dateFrom: params.dateFrom,
          dateTo: params.dateTo,
          vehicleType: params.vehicleType,
          page: params.page ?? 1,
          limit: params.pageSize ?? 50,
          column_search: params.columnSearch
            ? JSON.stringify(params.columnSearch)
            : undefined,
          column_filters: params.columnFilters
            ? JSON.stringify(params.columnFilters)
            : undefined,
          sorts: params.sorts ? params.sorts.join(",") : undefined,
        },
      },
    );
    return res.data;
  },
};

export type { InvoicePartnerInfo, InvoiceDashboardPartnersResponse };
