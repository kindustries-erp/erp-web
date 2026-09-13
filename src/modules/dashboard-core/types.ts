import type { UseQueryResult } from "@tanstack/react-query";

export interface DashboardKpi {
  totalCashIn: number;
  totalCashOut: number;
}

export interface CashflowTrendPoint {
  label: string;
  cashIn: number;
  cashOut: number;
}

export interface CategoryBreakdownItem {
  label: string;
  amount: number;
  color?: string;
}

export interface DashboardCashflow {
  totalCashIn: number;
  totalCashOut: number;
  cashTrend?: CashflowTrendPoint[];
  categoryBreakdown?: CategoryBreakdownItem[];
}

export interface SalesKpi {
  totalQty: number;
  totalOrders: number;
  completionRate: number;
}

export interface CustomerRow {
  customerId: string | number;
  customerName: string;
  qty: number;
}

export interface TrendPoint {
  month: string;
  qty: number;
}

export interface DashboardSales {
  kpi?: SalesKpi;
  topCustomers?: CustomerRow[];
  trend?: TrendPoint[];
}

export interface DashboardPurchasing {
  kpi?: SalesKpi;
}

export interface StockTrendPoint {
  label: string;
  receiptQty: number;
  issueQty: number;
}

export interface DashboardInventory {
  totalSkus: number;
  totalReceiptsCount: number;
  totalIssuesCount: number;
  lowStockCount: number;
  zeroStockCount: number;
  stockTrend?: StockTrendPoint[];
}

export interface CoreDashboardOverview {
  cashflow: DashboardCashflow;
  sales: DashboardSales;
  purchasing: DashboardPurchasing;
  inventory: DashboardInventory;
  cashTrendLabels: string[];
  cashTrendIn: number[];
  cashTrendOut: number[];
  salesLabels: string[];
  salesData: number[];
  donutItems: { label: string; value: number; color: string }[];
}

export interface SettlementSummaryRow {
  totalOrders: number;
  totalAmount: number;
  totalSettled: number;
  totalNetoff: number;
  totalRemaining: number;
}

export interface VinfastPartsSummaryPayload {
  summary: {
    revenue: number;
    cogs: number;
    grossProfit: number;
    inventoryValue: number;
    totalBuy: number;
    totalSell: number;
    profit: number;
  };
  trend: {
    month: string;
    revenue: number;
    cogs: number;
    grossProfit: number;
    inventoryValue: number;
    totalBuy: number;
    totalSell: number;
    profit: number;
  }[];
}

export interface WorkshopKpiGroups {
  invoiceStats: UseQueryResult<any, Error>;
  settlementSummary: UseQueryResult<SettlementSummaryRow, Error>;
  vinfastSummary: UseQueryResult<VinfastPartsSummaryPayload, Error>;
}
