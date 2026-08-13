import React from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { LayoutDashboard } from "lucide-react";
import { DashboardTemplate } from "@/shared/components/DashboardTemplate";
import { useFilterPanel } from "@/shared/hooks/useFilterPanel";
import { getBranchesApi } from "@/modules/branches/api/branchApi";
import { dashboardCoreApi } from "@/modules/dashboard-core/api/dashboardCoreApi";
import { workshopDashboardApi } from "@/modules/workshop-dashboard/api/workshopDashboardApi";
import { DashboardTabsContent } from "@/modules/dashboard-core/components/DashboardTabsContent";
import type {
  CoreDashboardOverview,
  DashboardCashflow,
  DashboardSales,
  DashboardPurchasing,
  DashboardInventory,
  WorkshopKpiGroups,
  SettlementSummaryRow,
  VinfastPartsSummaryPayload,
} from "@/modules/dashboard-core/types";
import { DEFAULT_COLORS } from "@/modules/dashboard-core/components/DashboardTabsContent";

export function Dashboard() {
  const { t } = useTranslation("dashboard");
  const queryClient = useQueryClient();

  const { data: branches = [] } = useQuery({
    queryKey: ["branches"],
    queryFn: () => getBranchesApi(),
    staleTime: 1000 * 60 * 10,
  });

  const filterConfig = React.useMemo(() => {
    const custom: any[] = [
      {
        key: "branchId",
        label: "Chi nhánh",
        placeholder: "Tất cả chi nhánh",
        options: (branches || []).map((b: any) => ({
          value: b.id,
          label: b.name,
        })),
      },
      {
        key: "groupBy",
        label: "Chu kỳ",
        placeholder: "Chọn chu kỳ",
        options: [
          { value: "month", label: "Theo tháng" },
          { value: "week", label: "Theo tuần" },
        ],
        initialValue: "month",
      },
    ];
    return { period: true, noDefaultPeriod: true, custom };
  }, [branches]);

  const filter = useFilterPanel(filterConfig, () => {});
  const dateFrom = filter.state.dateFrom;
  const dateTo = filter.state.dateTo;
  const branchId = filter.state.custom.branchId;
  const groupBy = filter.state.custom.groupBy || "month";

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["dashboard-core-overview", dateFrom, dateTo, branchId],
    queryFn: () =>
      dashboardCoreApi.getOverview({
        startDate: dateFrom || undefined,
        endDate: dateTo || undefined,
        branchId: branchId || undefined,
      }),
  });

  const invoiceStats = useQuery({
    queryKey: ["workshop-invoice-stats", dateFrom, dateTo, branchId],
    queryFn: () =>
      workshopDashboardApi.getInvoiceStats({
        dateFrom,
        dateTo,
        branchId,
      }),
  });

  const settlementSummary = useQuery<SettlementSummaryRow, Error>({
    queryKey: ["workshop-settlement-summary", dateFrom, dateTo, branchId],
    queryFn: () =>
      workshopDashboardApi.getSettlementSummary({
        dateFrom,
        dateTo,
        branchId,
      }),
  });

  const vinfastSummary = useQuery<VinfastPartsSummaryPayload, Error>({
    queryKey: ["workshop-vf-summary", dateFrom, dateTo, groupBy],
    queryFn: () =>
      workshopDashboardApi.getVinfastPartsSummary({
        dateFrom,
        dateTo,
        groupBy,
      }),
  });

  const loading =
    isLoading ||
    invoiceStats.isLoading ||
    settlementSummary.isLoading ||
    vinfastSummary.isLoading;

  const handleRefresh = () => {
    void refetch();
    void queryClient.invalidateQueries({ queryKey: ["workshop-"] });
    void queryClient.invalidateQueries({
      queryKey: ["workshop-invoice-partners"],
    });
    void queryClient.invalidateQueries({
      queryKey: ["workshop-settlement-orders"],
    });
    void queryClient.invalidateQueries({
      queryKey: ["workshop-vf-parts-kpi"],
    });
    void queryClient.invalidateQueries({
      queryKey: ["workshop-vf-parts-trend"],
    });
    void queryClient.invalidateQueries({
      queryKey: ["vinfast-parts-dashboard-table"],
    });
  };

  const mergedData: CoreDashboardOverview = React.useMemo(() => {
    const cashflow: DashboardCashflow = data?.cashflow
      ? (data.cashflow as DashboardCashflow)
      : {
          totalCashIn: 0,
          totalCashOut: 0,
          cashTrend: [],
          categoryBreakdown: [],
        };
    const sales: DashboardSales = data?.sales
      ? (data.sales as DashboardSales)
      : { kpi: undefined, topCustomers: [], trend: [] };
    const purchasing: DashboardPurchasing = data?.purchasing
      ? (data.purchasing as DashboardPurchasing)
      : { kpi: undefined };
    const inventory: DashboardInventory = data?.inventory
      ? (data.inventory as DashboardInventory)
      : {
          totalSkus: 0,
          totalReceiptsCount: 0,
          totalIssuesCount: 0,
          lowStockCount: 0,
          zeroStockCount: 0,
          stockTrend: [],
        };

    const cashTrend = cashflow.cashTrend || [];
    const cashTrendLabels = cashTrend.map((p) => p.label);
    const cashTrendIn = cashTrend.map((p) => p.cashIn);
    const cashTrendOut = cashTrend.map((p) => p.cashOut);

    const trend = sales.trend || [];
    const salesLabels = trend.map((p) => p.month);
    const salesData = trend.map((p) => p.qty);

    const breakdown = cashflow.categoryBreakdown || [];
    const totalExpenseBreakdown =
      breakdown.reduce((acc, c) => acc + (Number(c.amount) || 0), 0) || 1;
    const donutItems = breakdown.map((c, i) => ({
      label: c.label || t("common.other"),
      value: Math.round(
        ((Number(c.amount) || 0) / totalExpenseBreakdown) * 100,
      ),
      color: c.color || DEFAULT_COLORS[i % DEFAULT_COLORS.length],
    }));

    return {
      cashflow,
      sales,
      purchasing,
      inventory,
      cashTrendLabels,
      cashTrendIn,
      cashTrendOut,
      salesLabels,
      salesData,
      donutItems,
    };
  }, [data, t]);

  const workshop: WorkshopKpiGroups = {
    invoiceStats,
    settlementSummary,
    vinfastSummary,
  };

  return (
    <DashboardTemplate
      title={t("title")}
      desc={t("desc")}
      icon={<LayoutDashboard className="h-4 w-4" />}
      filterConfig={filterConfig}
      filter={filter}
      loading={loading}
      onRefresh={handleRefresh}
    >
      <DashboardTabsContent
        loading={loading}
        filter={filter}
        data={mergedData}
        workshop={workshop}
        onRefresh={handleRefresh}
      />
    </DashboardTemplate>
  );
}
