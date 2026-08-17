import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { garageApi } from "../api/garageApi";

export interface GarageDashboardParams {
  branchId?: string;
  dateFrom?: string;
  dateTo?: string;
}

export function useGarageDashboardStats({
  branchId,
  dateFrom,
  dateTo,
}: GarageDashboardParams) {
  // Query 1: Gross Profit Report (Revenue, Cost, Profit Breakdown)
  const grossProfitQuery = useQuery({
    queryKey: ["garage", "grossProfitReport", branchId, dateFrom, dateTo],
    queryFn: () => garageApi.getGrossProfitReport(branchId!, dateFrom, dateTo),
    enabled: !!branchId,
    staleTime: 1000 * 60 * 2,
  });

  // Query 2: Cases List (for recent cases & status distribution)
  const casesQuery = useQuery({
    queryKey: ["garage", "cases", branchId, 1, 100, "", dateFrom, dateTo],
    queryFn: () => garageApi.getCases(branchId!, 1, 100, "", dateFrom, dateTo),
    enabled: !!branchId,
    staleTime: 1000 * 60 * 2,
  });

  // Aggregated calculations
  const stats = useMemo(() => {
    const profitData = grossProfitQuery.data;
    const casesData = casesQuery.data?.data || [];

    const totalRevenue =
      profitData?.results?.TongCong?.DoanhThu ??
      profitData?.TongCong?.DoanhThu ??
      0;
    const totalCost =
      profitData?.results?.TongCong?.ChiPhi ??
      profitData?.TongCong?.ChiPhi ??
      0;
    const totalGrossProfit =
      profitData?.results?.TongCong?.LaiGop ??
      profitData?.TongCong?.LaiGop ??
      0;
    const averageMargin =
      totalRevenue > 0 ? (totalGrossProfit / totalRevenue) * 100 : 0;

    const totalCases = casesQuery.data?.pagination?.total ?? casesData.length;
    const completedCases = casesData.filter(
      (c: any) =>
        c.tenTinhTrangDichVu?.toLowerCase().includes("kết thúc") ||
        c.tenTinhTrangDichVu?.toLowerCase().includes("hoàn thành") ||
        c.tenTinhTrangDichVu?.toLowerCase().includes("giao xe"),
    ).length;
    const inProgressCases = casesData.filter(
      (c: any) =>
        !c.tenTinhTrangDichVu?.toLowerCase().includes("kết thúc") &&
        !c.tenTinhTrangDichVu?.toLowerCase().includes("hoàn thành") &&
        !c.tenTinhTrangDichVu?.toLowerCase().includes("hủy"),
    ).length;

    // Trend chart data from Gross Profit Groups / Items
    const rawGroups = profitData?.results?.Groups || profitData?.Groups || [];
    const trendData = rawGroups.flatMap((g: any) => {
      const items = g.Items || [];
      return items.map((it: any) => ({
        name: it.VuViecCode || it.soChungTu || it.TenKhachHang || "Case",
        revenue: Number(it.DoanhThu) || 0,
        cost: Number(it.ChiPhi) || 0,
        profit: Number(it.LoiNhuan) || 0,
        margin:
          Number(it.DoanhThu) > 0
            ? ((Number(it.LoiNhuan) || 0) / Number(it.DoanhThu)) * 100
            : 0,
        date: it.createdAt || it.updatedAt || "",
      }));
    });

    // Status distribution
    const statusMap = new Map<string, number>();
    for (const c of casesData) {
      const st = c.tenTinhTrangDichVu || "Khác";
      statusMap.set(st, (statusMap.get(st) || 0) + 1);
    }
    const statusDistribution = Array.from(statusMap.entries()).map(
      ([name, value]) => ({
        name,
        value,
      }),
    );

    // Recent 10 cases
    const recentCases = casesData.slice(0, 10);

    return {
      totalRevenue,
      totalCost,
      totalGrossProfit,
      averageMargin,
      totalCases,
      completedCases,
      inProgressCases,
      trendData,
      statusDistribution,
      recentCases,
    };
  }, [grossProfitQuery.data, casesQuery.data]);

  const isLoading = grossProfitQuery.isLoading || casesQuery.isLoading;
  const isFetching = grossProfitQuery.isFetching || casesQuery.isFetching;

  const refetch = async () => {
    await Promise.all([grossProfitQuery.refetch(), casesQuery.refetch()]);
  };

  return {
    stats,
    isLoading,
    isFetching,
    refetch,
  };
}
