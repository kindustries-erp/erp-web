import axiosInstance from "@/core/api/axiosInstance";

export interface InventoryDashboardStats {
  totalSkus: number;
  totalStockValue: number;
  totalReceiptsCount: number;
  totalIssuesCount: number;
  lowStockCount: number;
  zeroStockCount: number;
  stockTrend: Array<{
    label: string;
    receiptValue: number;
    issueValue: number;
    receiptQty: number;
    issueQty: number;
  }>;
  typeBreakdown: Array<{
    itemTypeId: string;
    itemTypeName: string;
    stockValue: number;
    stockQty: number;
    percentage: number;
  }>;
  topStockItems: Array<{
    itemId: string;
    sku: string;
    itemName: string;
    itemTypeName: string;
    qtyOnHand: number;
    unitCost: number;
    stockValue: number;
  }>;
  topIssuedItems: Array<{
    itemId: string;
    sku: string;
    itemName: string;
    itemTypeName: string;
    totalIssued: number;
    currentStock: number;
  }>;
  alertItems: Array<{
    itemId: string;
    sku: string;
    itemName: string;
    qtyOnHand: number;
    lastIssueDate: string | null;
    alertType: "zero_stock" | "low_stock" | "slow_moving";
  }>;
  vehicleBomStats: Array<{
    bomName: string;
    currentStock: number;
    issuedInPeriod: number;
    receivedInPeriod: number;
  }>;
  vehicleTrend: Array<{
    periodLabel: string;
    receiptsByBom: Record<string, number>;
    issuesByBom: Record<string, number>;
  }>;
}

export const inventoryDashboardApi = {
  getDashboardStats: async (params: {
    startDate?: string;
    endDate?: string;
    itemTypeId?: string;
    warehouseCode?: string;
  }): Promise<InventoryDashboardStats> => {
    const { data } = await axiosInstance.get("/api/v1/inventory/dashboard", {
      params,
    });
    return data.data;
  },
};
