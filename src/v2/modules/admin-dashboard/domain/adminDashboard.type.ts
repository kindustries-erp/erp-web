export interface AdminKpiItem {
  value: number;
  growthRate?: number;
  pendingCount?: number;
}

export interface AdminDashboardSummary {
  kpis: {
    revenue: AdminKpiItem;
    salesOrdersCount: AdminKpiItem;
    inventoryLowStockCount: AdminKpiItem;
    unpaidReceivables: AdminKpiItem;
  };
  recentPendingApprovals: Array<{
    id: string;
    type: string;
    code: string;
    total: number;
  }>;
  systemHealth: {
    activeUsers: number;
    lastSyncAt: string;
  };
}
