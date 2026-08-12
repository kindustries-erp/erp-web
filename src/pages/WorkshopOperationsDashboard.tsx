import React from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Factory,
  FileText,
  Receipt,
  DollarSign,
  Wallet,
  ShoppingCart,
  Truck,
  ArrowRightLeft,
  BarChart3,
  Banknote,
  Calculator,
} from "lucide-react";
import { DashboardTemplate } from "@/shared/components/DashboardTemplate";
import { useFilterPanel } from "@/shared/hooks/useFilterPanel";
import { getBranchesApi } from "@/modules/branches/api/branchApi";
import { money } from "@/shared/utils/format";
import { Panel } from "@/shared/components/Panel";
import { BarChart } from "@/shared/components/charts/BarChart";
import { ChartSkeleton } from "@/shared/components/Skeleton";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/shared/components/ui/tabs";
import { workshopDashboardApi } from "@/modules/workshop-dashboard/api/workshopDashboardApi";
import { KpiSection } from "@/modules/workshop-dashboard/components/KpiSection";
import { InvoicePartnersTable } from "@/modules/workshop-dashboard/components/InvoicePartnersTable";
import { SettlementTable } from "@/modules/workshop-dashboard/components/SettlementTable";
import {
  VinfastPartsSummaryCards,
  VinfastPartTrendChart,
} from "@/modules/workshop-dashboard/components/VinfastPartsSummaryCards";
import { VinfastPartDashboardTable } from "@/pages/components/VinfastPartDashboardTable";

const BAR_COLOR_CASH_IN = "#10b981";
const BAR_COLOR_CASH_OUT = "#ef4444";

export function WorkshopOperationsDashboard() {
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

  const invoiceStats = useQuery({
    queryKey: ["workshop-invoice-stats", dateFrom, dateTo, branchId],
    queryFn: () =>
      workshopDashboardApi.getInvoiceStats({ dateFrom, dateTo, branchId }),
  });

  const settlementSummary = useQuery({
    queryKey: ["workshop-settlement-summary", dateFrom, dateTo, branchId],
    queryFn: () =>
      workshopDashboardApi.getSettlementSummary({
        dateFrom,
        dateTo,
        branchId,
      }),
  });

  const vinfastSummary = useQuery({
    queryKey: ["workshop-vf-summary", dateFrom, dateTo, groupBy],
    queryFn: () =>
      workshopDashboardApi.getVinfastPartsSummary({
        dateFrom,
        dateTo,
        groupBy,
      }),
  });

  const loading =
    invoiceStats.isLoading ||
    settlementSummary.isLoading ||
    vinfastSummary.isLoading;

  const handleRefresh = () => {
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

  const totalInAmount =
    invoiceStats.data?.cashTrend?.reduce(
      (a, c) => a + (Number(c.cashIn) || 0),
      0,
    ) || 0;
  const totalOutAmount =
    invoiceStats.data?.cashTrend?.reduce(
      (a, c) => a + (Number(c.cashOut) || 0),
      0,
    ) || 0;
  const totalNet = totalInAmount - totalOutAmount;

  const overviewKpis = [
    {
      label: t("kpi.totalCashIn"),
      value: money(totalInAmount),
      icon: <DollarSign className="w-4 h-4 text-emerald-500" />,
      loading,
    },
    {
      label: t("kpi.totalCashOut"),
      value: money(totalOutAmount),
      icon: <Wallet className="w-4 h-4 text-red-500" />,
      loading,
    },
    {
      label: t("kpi.settlementOrders"),
      value: String(settlementSummary.data?.totalOrders || 0),
      icon: <Receipt className="w-4 h-4 text-blue-500" />,
      loading,
    },
    {
      label: t("kpi.remainingAmount"),
      value: money(settlementSummary.data?.totalRemaining || 0),
      icon: <Calculator className="w-4 h-4 text-amber-500" />,
      loading,
    },
    {
      label: t("kpi.vfPartsTotalSell"),
      value: money(vinfastSummary.data?.summary.totalSell || 0),
      icon: <ShoppingCart className="w-4 h-4 text-emerald-500" />,
      loading,
    },
    {
      label: t("kpi.vfPartsProfit"),
      value: money(vinfastSummary.data?.summary.profit || 0),
      icon: <Banknote className="w-4 h-4 text-indigo-500" />,
      loading,
    },
  ];

  const invoiceKpis = [
    {
      label: t("kpi.totalReceivable"),
      value: money(
        totalOutAmount > totalInAmount ? totalOutAmount - totalInAmount : 0,
      ),
      icon: <ArrowRightLeft className="w-4 h-4 text-blue-500" />,
      loading,
    },
    {
      label: t("kpi.totalPayable"),
      value: money(
        totalInAmount > totalOutAmount ? totalInAmount - totalOutAmount : 0,
      ),
      icon: <Truck className="w-4 h-4 text-red-500" />,
      loading,
    },
    {
      label: t("kpi.totalInvoices"),
      value: String(invoiceStats.data?.cashTrend?.length || 0),
      icon: <FileText className="w-4 h-4 text-indigo-500" />,
      loading,
    },
    {
      label: "Dòng thu/chi ròng",
      value: money(totalNet),
      icon: <BarChart3 className="w-4 h-4 text-slate-600" />,
      loading,
    },
  ];

  const completionRate =
    (settlementSummary.data?.totalAmount || 0) > 0
      ? Math.round(
          (((settlementSummary.data?.totalAmount || 0) -
            (settlementSummary.data?.totalRemaining || 0)) /
            (settlementSummary.data?.totalAmount || 0)) *
            100,
        )
      : 0;

  const settlementKpis = [
    {
      label: t("kpi.settlementOrders"),
      value: String(settlementSummary.data?.totalOrders || 0),
      icon: <Receipt className="w-4 h-4 text-indigo-500" />,
      loading,
    },
    {
      label: t("kpi.totalSettledAmount"),
      value: money(settlementSummary.data?.totalSettled || 0),
      icon: <DollarSign className="w-4 h-4 text-emerald-500" />,
      loading,
    },
    {
      label: t("kpi.remainingAmount"),
      value: money(settlementSummary.data?.totalRemaining || 0),
      icon: <Calculator className="w-4 h-4 text-red-500" />,
      loading,
    },
    {
      label: t("kpi.completionRate"),
      value: `${completionRate}%`,
      icon: <BarChart3 className="w-4 h-4 text-blue-500" />,
      loading,
    },
  ];

  const cashTrendLabels =
    invoiceStats.data?.cashTrend?.map((t) => t.label) || [];
  const cashTrendIn = invoiceStats.data?.cashTrend?.map((t) => t.cashIn) || [];
  const cashTrendOut =
    invoiceStats.data?.cashTrend?.map((t) => t.cashOut) || [];

  return (
    <DashboardTemplate
      title={t("workshop.title")}
      desc={t("workshop.desc")}
      icon={<Factory className="h-4 w-4" />}
      filterConfig={filterConfig}
      filter={filter}
      loading={loading}
      onRefresh={handleRefresh}
    >
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:w-[720px] mb-6 shadow-sm border border-[color:var(--border)]">
          <TabsTrigger value="overview">{t("tabs.overview")}</TabsTrigger>
          <TabsTrigger value="invoice">{t("tabs.invoice")}</TabsTrigger>
          <TabsTrigger value="settlement">{t("tabs.settlement")}</TabsTrigger>
          <TabsTrigger value="vinfastParts">
            {t("tabs.vinfastParts")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <KpiSection items={overviewKpis} columns={6} />
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <Panel title={t("invoice.cashTrendTitle")}>
              <div className="relative h-[260px]">
                {!invoiceStats.isLoading && cashTrendLabels.length > 0 ? (
                  <BarChart
                    labels={cashTrendLabels}
                    yCallback={(v) => money(Number(v))}
                    datasets={[
                      {
                        data: cashTrendIn,
                        color: BAR_COLOR_CASH_IN,
                        label: t("cashIn"),
                      },
                      {
                        data: cashTrendOut,
                        color: BAR_COLOR_CASH_OUT,
                        label: t("cashOut"),
                      },
                    ]}
                  />
                ) : invoiceStats.isLoading ? (
                  <ChartSkeleton type="bar" />
                ) : (
                  <div className="flex items-center justify-center h-full text-sm text-[color:var(--muted-fg)]">
                    {t("common.noData")}
                  </div>
                )}
              </div>
            </Panel>
            <VinfastPartTrendChart
              title={t("vinfastParts.chartAll")}
              vehicleType="all"
              filterState={{ dateFrom, dateTo }}
              groupBy={groupBy}
              chartHeight={260}
            />
          </div>
        </TabsContent>

        <TabsContent value="invoice" className="space-y-6">
          <KpiSection items={invoiceKpis} columns={4} />
          <Panel title={t("invoice.cashTrendTitle")}>
            <div className="relative h-[250px]">
              {!invoiceStats.isLoading && cashTrendLabels.length > 0 ? (
                <BarChart
                  labels={cashTrendLabels}
                  yCallback={(v) => money(Number(v))}
                  datasets={[
                    {
                      data: cashTrendIn,
                      color: BAR_COLOR_CASH_IN,
                      label: t("cashIn"),
                    },
                    {
                      data: cashTrendOut,
                      color: BAR_COLOR_CASH_OUT,
                      label: t("cashOut"),
                    },
                  ]}
                />
              ) : invoiceStats.isLoading ? (
                <ChartSkeleton type="bar" />
              ) : (
                <div className="flex items-center justify-center h-full text-sm text-[color:var(--muted-fg)]">
                  {t("common.noData")}
                </div>
              )}
            </div>
          </Panel>
          <InvoicePartnersTable filterParams={{ dateFrom, dateTo, branchId }} />
        </TabsContent>

        <TabsContent value="settlement" className="space-y-6">
          <KpiSection items={settlementKpis} columns={4} />
          <SettlementTable
            filterParams={{ dateFrom, dateTo, branchId }}
            onSetPeriod={(from, to) => {
              filter.setDateFrom(from ?? "");
              filter.setDateTo(to ?? "");
            }}
            onRefresh={handleRefresh}
            onClearAllFilters={() => {
              filter.resetAll();
            }}
            extraActiveFilters={filter.activeFilterCount || 0}
          />
        </TabsContent>

        <TabsContent value="vinfastParts" className="space-y-8">
          <VinfastPartsSummaryCards filterState={filter.state} />
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <VinfastPartTrendChart
              title={t("vinfastParts.chartCar")}
              vehicleType="CAR"
              filterState={{ dateFrom, dateTo }}
              groupBy={groupBy}
            />
            <VinfastPartTrendChart
              title={t("vinfastParts.chartMotorbike")}
              vehicleType="MOTORBIKE"
              filterState={{ dateFrom, dateTo }}
              groupBy={groupBy}
            />
          </div>
          <div className="flex flex-col gap-8">
            <VinfastPartDashboardTable
              filterState={filter.state}
              vehicleType="CAR"
              title={t("vinfastParts.tableCarTitle")}
              onRowClick={() => {}}
            />
            <VinfastPartDashboardTable
              filterState={filter.state}
              vehicleType="MOTORBIKE"
              title={t("vinfastParts.tableMotorbikeTitle")}
              onRowClick={() => {}}
            />
          </div>
        </TabsContent>
      </Tabs>
    </DashboardTemplate>
  );
}
