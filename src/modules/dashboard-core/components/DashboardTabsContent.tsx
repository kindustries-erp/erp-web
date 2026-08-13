import React from "react";
import { useTranslation } from "react-i18next";
import {
  LayoutDashboard,
  AlertCircle,
  ShoppingBag,
  Truck,
  DollarSign,
  Wallet,
  Receipt,
  Calculator,
  ShoppingCart,
  Banknote,
  ArrowRightLeft,
  BarChart3,
  Warehouse,
  Car,
} from "lucide-react";
import { KpiCard } from "@/shared/components/KpiCard";
import { Panel } from "@/shared/components/Panel";
import { ChartSkeleton, Skeleton } from "@/shared/components/Skeleton";
import { BarChart } from "@/shared/components/charts/BarChart";
import { DonutChart, DonutLegend } from "@/shared/components/charts/DonutChart";
import { cn } from "@/shared/utils";
import { money } from "@/shared/utils/format";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/shared/components/ui/tabs";
import { CashflowForecastDashboardWidget } from "@/modules/budget/components/CashflowForecastDashboardWidget";
import { KpiSection } from "@/modules/workshop-dashboard/components/KpiSection";
import {
  VinfastPartsSummaryCards,
  VinfastPartTrendChart,
} from "@/modules/workshop-dashboard/components/VinfastPartsSummaryCards";
import {
  SummaryCard,
  IconTrendUp,
  IconTrendDown,
} from "@/modules/dashboard-core/components/DashboardSharedHelpers";
import type {
  CoreDashboardOverview,
  WorkshopKpiGroups,
} from "@/modules/dashboard-core/types";

const DASH_TABS = [
  {
    value: "overview",
    labelKey: "tabs.overview",
    Icon: LayoutDashboard,
  },
  {
    value: "sales",
    labelKey: "tabs.sales",
    Icon: ShoppingBag,
  },
  {
    value: "inventory",
    labelKey: "tabs.inventory",
    Icon: Warehouse,
  },
  {
    value: "cashflow",
    labelKey: "tabs.cashflow",
    Icon: Wallet,
  },
  {
    value: "invoice",
    labelKey: "tabs.invoice",
    Icon: Receipt,
  },
  {
    value: "settlement",
    labelKey: "tabs.settlement",
    Icon: Banknote,
  },
  {
    value: "vinfastParts",
    labelKey: "tabs.vinfastParts",
    Icon: Car,
  },
] as const;

const BAR_CASH_IN = "#10b981";
const BAR_CASH_OUT = "#ef4444";
const BAR_SALES = "#3b82f6";

const formatQty = (v: number) =>
  new Intl.NumberFormat("vi-VN", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(v);

const DEFAULT_COLORS = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
  "#14b8a6",
];

const LazyInvoicePartnersTable = React.lazy(() =>
  import("@/modules/workshop-dashboard/components/InvoicePartnersTable").then(
    (m) => ({ default: m.InvoicePartnersTable }),
  ),
);

const LazySettlementTable = React.lazy(() =>
  import("@/modules/workshop-dashboard/components/SettlementTable").then(
    (m) => ({ default: m.SettlementTable }),
  ),
);

const LazyVFPartDashboardTable = React.lazy(() =>
  import("@/pages/components/VinfastPartDashboardTable").then((m) => ({
    default: m.VinfastPartDashboardTable,
  })),
);

export interface DashboardTabsContentProps {
  loading: boolean;
  filter: {
    state: {
      dateFrom?: string;
      dateTo?: string;
      custom: Record<string, string | undefined>;
    };
    setDateFrom: (s: string) => void;
    setDateTo: (s: string) => void;
    resetAll: () => void;
    activeFilterCount?: number;
  };
  data: CoreDashboardOverview;
  workshop: WorkshopKpiGroups;
  onRefresh: () => void;
}

export function DashboardTabsContent({
  loading,
  filter,
  data,
  workshop,
  onRefresh,
}: DashboardTabsContentProps) {
  const { t } = useTranslation("dashboard");
  const {
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
  } = data;
  const cashIn = cashflow.totalCashIn || 0;
  const cashOut = cashflow.totalCashOut || 0;
  const salesQty = sales.kpi?.totalQty || 0;
  const purQty = purchasing.kpi?.totalQty || 0;
  const lowStock = inventory.lowStockCount || 0;
  const zeroStock = inventory.zeroStockCount || 0;

  const settlementSummary = workshop.settlementSummary.data;
  const completionRate =
    (settlementSummary?.totalAmount || 0) > 0
      ? Math.round(
          (((settlementSummary?.totalAmount || 0) -
            (settlementSummary?.totalRemaining || 0)) /
            (settlementSummary?.totalAmount || 0)) *
            100,
        )
      : 0;

  const overviewKpis = [
    {
      label: t("kpi.settlementOrders"),
      value: String(settlementSummary?.totalOrders || 0),
      icon: <Receipt className="w-4 h-4 text-blue-500" />,
      loading: workshop.settlementSummary.isLoading,
    },
    {
      label: t("kpi.remainingAmount"),
      value: money(settlementSummary?.totalRemaining || 0),
      icon: <Calculator className="w-4 h-4 text-amber-500" />,
      loading: workshop.settlementSummary.isLoading,
    },
    {
      label: t("kpi.vfPartsTotalSell"),
      value: money(workshop.vinfastSummary.data?.summary.totalSell || 0),
      icon: <ShoppingCart className="w-4 h-4 text-emerald-500" />,
      loading: workshop.vinfastSummary.isLoading,
    },
    {
      label: t("kpi.vfPartsProfit"),
      value: money(workshop.vinfastSummary.data?.summary.profit || 0),
      icon: <Banknote className="w-4 h-4 text-indigo-500" />,
      loading: workshop.vinfastSummary.isLoading,
    },
  ];

  const invoiceKpis = [
    {
      label: t("kpi.totalReceivable"),
      value: money(cashOut > cashIn ? cashOut - cashIn : 0),
      icon: <ArrowRightLeft className="w-4 h-4 text-blue-500" />,
      loading,
    },
    {
      label: t("kpi.totalPayable"),
      value: money(cashIn > cashOut ? cashIn - cashOut : 0),
      icon: <Truck className="w-4 h-4 text-red-500" />,
      loading,
    },
    {
      label: t("kpi.totalInvoices"),
      value: String(cashTrendLabels.length || 0),
      icon: <LayoutDashboard className="w-4 h-4 text-indigo-500" />,
      loading,
    },
    {
      label: "Dòng thu/chi ròng",
      value: money(cashIn - cashOut),
      icon: <BarChart3 className="w-4 h-4 text-slate-600" />,
      loading,
    },
  ];

  const settlementKpis = [
    {
      label: t("kpi.settlementOrders"),
      value: String(settlementSummary?.totalOrders || 0),
      icon: <Receipt className="w-4 h-4 text-indigo-500" />,
      loading: workshop.settlementSummary.isLoading,
    },
    {
      label: t("kpi.totalSettledAmount"),
      value: money(settlementSummary?.totalSettled || 0),
      icon: <DollarSign className="w-4 h-4 text-emerald-500" />,
      loading: workshop.settlementSummary.isLoading,
    },
    {
      label: t("kpi.remainingAmount"),
      value: money(settlementSummary?.totalRemaining || 0),
      icon: <Calculator className="w-4 h-4 text-red-500" />,
      loading: workshop.settlementSummary.isLoading,
    },
    {
      label: t("kpi.completionRate"),
      value: `${completionRate}%`,
      icon: <BarChart3 className="w-4 h-4 text-blue-500" />,
      loading: workshop.settlementSummary.isLoading,
    },
  ];

  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList className="mb-6 h-11 max-w-full rounded-full bg-slate-100/70 shadow-[0_1px_2px_rgba(15,23,42,.03),0_6px_18px_-14px_rgba(15,23,42,.08)] p-1 gap-2 overflow-x-auto overflow-y-clip scrollbar-thin pr-3">
        {DASH_TABS.map(({ value, labelKey, Icon }) => (
          <TabsTrigger
            key={value}
            value={value}
            className={cn(
              "group relative shrink-0 rounded-full px-4 h-full gap-0 transition-[color,background-color,box-shadow,transform] duration-150 ease-out",
              "data-[state=inactive]:text-slate-500 data-[state=inactive]:font-medium hover:text-slate-700",
              "data-[state=active]:text-slate-900 data-[state=active]:font-semibold whitespace-nowrap",
            )}
          >
            <Icon
              className={cn(
                "shrink-0 transition-[width,height,opacity,margin] duration-150 ease-out overflow-hidden",
                "w-0 h-0 opacity-0 mr-0",
                "group-data-[state=active]:w-4 group-data-[state=active]:h-4 group-data-[state=active]:opacity-100 group-data-[state=active]:mr-[10px]",
              )}
            />
            <span className="text-[13px] tracking-tight">{t(labelKey)}</span>
          </TabsTrigger>
        ))}
      </TabsList>

      <TabsContent value="overview" className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <SummaryCard
            loading={loading}
            title={t("kpi.totalCashIn")}
            value={money(cashIn)}
            icon={<DollarSign className="w-5 h-5 text-emerald-500" />}
          />
          <SummaryCard
            loading={loading}
            title={t("kpi.totalCashOut")}
            value={money(cashOut)}
            icon={<Wallet className="w-5 h-5 text-red-500" />}
          />
          <SummaryCard
            loading={loading}
            title={t("kpi.salesQty")}
            value={formatQty(salesQty)}
            icon={<ShoppingBag className="w-5 h-5 text-blue-500" />}
          />
          <SummaryCard
            loading={loading}
            title={t("kpi.purQty")}
            value={formatQty(purQty)}
            icon={<Truck className="w-5 h-5 text-orange-500" />}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center justify-between shadow-sm">
            <div className="flex flex-col">
              <span className="text-red-800 font-semibold text-sm">
                {t("alert.zeroStock")}
              </span>
              <span className="text-3xl font-bold text-red-600">
                {zeroStock}
              </span>
            </div>
            <AlertCircle className="w-8 h-8 text-red-400 opacity-50" />
          </div>
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex items-center justify-between shadow-sm">
            <div className="flex flex-col">
              <span className="text-orange-800 font-semibold text-sm">
                {t("alert.lowStock")}
              </span>
              <span className="text-3xl font-bold text-orange-600">
                {lowStock}
              </span>
            </div>
            <AlertCircle className="w-8 h-8 text-orange-400 opacity-50" />
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center justify-between shadow-sm">
            <div className="flex flex-col">
              <span className="text-blue-800 font-semibold text-sm">
                {t("alert.salesOrders")}
              </span>
              <span className="text-3xl font-bold text-blue-600">
                {sales.kpi?.totalOrders || 0}
              </span>
            </div>
            <ShoppingBag className="w-8 h-8 text-blue-400 opacity-50" />
          </div>
        </div>

        <KpiSection items={overviewKpis} columns={4} />

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <Panel title={t("panel.cashTrend")}>
            <div className="relative h-[260px]">
              {!loading && cashTrendLabels.length > 0 ? (
                <BarChart
                  labels={cashTrendLabels}
                  yCallback={(v) => money(Number(v))}
                  datasets={[
                    {
                      data: cashTrendIn,
                      color: BAR_CASH_IN,
                      label: t("cashIn"),
                    },
                    {
                      data: cashTrendOut,
                      color: BAR_CASH_OUT,
                      label: t("cashOut"),
                    },
                  ]}
                />
              ) : loading ? (
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
            filterState={{
              dateFrom: filter.state.dateFrom,
              dateTo: filter.state.dateTo,
            }}
            groupBy={filter.state.custom.groupBy || "month"}
            chartHeight={260}
          />
        </div>
      </TabsContent>

      <TabsContent value="sales" className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <KpiCard
            loading={loading}
            label={t("kpi.totalOrders")}
            value={String(sales.kpi?.totalOrders || 0)}
          />
          <KpiCard
            loading={loading}
            label={t("kpi.salesQty")}
            value={formatQty(salesQty)}
          />
          <KpiCard
            loading={loading}
            label={t("kpi.completionRate")}
            value={`${(sales.kpi?.completionRate || 0).toFixed(2)}%`}
          />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Panel title={t("panel.topCustomers")}>
            <div className="space-y-2 mt-2 max-h-[300px] overflow-y-auto pr-2">
              {(sales.topCustomers || []).map((row: any) => (
                <div
                  key={row.customerId}
                  className="flex items-center justify-between p-2 bg-[color:var(--muted)] rounded text-sm"
                >
                  <span className="font-medium">{row.customerName}</span>
                  <span className="font-semibold text-emerald-600">
                    {formatQty(row.qty)}
                  </span>
                </div>
              ))}
            </div>
          </Panel>
          <Panel title={t("panel.colorDistribution")}>
            <div className="flex items-center justify-center h-full min-h-[200px] text-sm text-[color:var(--muted-fg)]">
              Vui lòng xem chi tiết ở trang Bán hàng
            </div>
          </Panel>
        </div>
        <Panel title={t("panel.salesTrend")}>
          <div className="relative h-[250px]">
            {!loading && salesLabels.length > 0 ? (
              <BarChart
                labels={salesLabels}
                yCallback={(v) => formatQty(Number(v))}
                datasets={[
                  {
                    data: salesData,
                    color: BAR_SALES,
                    label: t("kpi.salesQty"),
                  },
                ]}
              />
            ) : loading ? (
              <ChartSkeleton type="bar" />
            ) : (
              <div className="flex items-center justify-center h-full text-sm text-[color:var(--muted-fg)]">
                {t("common.noData")}
              </div>
            )}
          </div>
        </Panel>
      </TabsContent>

      <TabsContent value="inventory" className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <KpiCard
            loading={loading}
            label={t("kpi.totalSkus")}
            value={String(inventory.totalSkus || 0)}
          />
          <KpiCard
            loading={loading}
            label="Phiếu Nhập"
            value={String(inventory.totalReceiptsCount || 0)}
          />
          <KpiCard
            loading={loading}
            label="Phiếu Xuất"
            value={String(inventory.totalIssuesCount || 0)}
          />
        </div>
        <Panel title={t("panel.stockTrend")}>
          <div className="relative h-[250px]">
            {!loading &&
            inventory.stockTrend &&
            inventory.stockTrend.length > 0 ? (
              <BarChart
                labels={inventory.stockTrend.map((t: any) => t.label)}
                yCallback={(v) => String(v)}
                datasets={[
                  {
                    data: inventory.stockTrend.map((t: any) => t.receiptQty),
                    color: BAR_CASH_IN,
                    label: "Nhập",
                  },
                  {
                    data: inventory.stockTrend.map((t: any) => t.issueQty),
                    color: BAR_CASH_OUT,
                    label: "Xuất",
                  },
                ]}
              />
            ) : loading ? (
              <ChartSkeleton type="bar" />
            ) : (
              <div className="flex items-center justify-center h-full text-sm text-[color:var(--muted-fg)]">
                {t("common.noData")}
              </div>
            )}
          </div>
        </Panel>
      </TabsContent>

      <TabsContent value="cashflow" className="space-y-6">
        <div className="grid grid-cols-2 max-[900px]:grid-cols-2 gap-3 mb-4">
          <KpiCard
            loading={loading}
            label={t("kpi.totalCashIn")}
            value={money(cashIn)}
            icon={<IconTrendUp />}
          />
          <KpiCard
            loading={loading}
            label={t("kpi.totalCashOut")}
            value={money(cashOut)}
            icon={<IconTrendDown />}
          />
        </div>
        <div className="grid grid-cols-1 min-[900px]:grid-cols-[1fr_300px] gap-3">
          <Panel title={t("cashTrend")}>
            <div className="relative h-[210px]">
              {!loading && cashTrendLabels.length > 0 ? (
                <BarChart
                  labels={cashTrendLabels}
                  yCallback={(v) => money(Number(v))}
                  datasets={[
                    {
                      data: cashTrendIn,
                      color: BAR_CASH_IN,
                      label: t("cashIn"),
                    },
                    {
                      data: cashTrendOut,
                      color: BAR_CASH_OUT,
                      label: t("cashOut"),
                    },
                  ]}
                />
              ) : loading ? (
                <ChartSkeleton type="bar" />
              ) : (
                <div className="flex items-center justify-center h-full text-sm text-[color:var(--muted-fg)]">
                  {t("common.noData")}
                </div>
              )}
            </div>
          </Panel>
          <Panel title={t("expenseByCategory")}>
            {!loading && donutItems.length > 0 ? (
              <>
                <div className="relative h-[160px] mb-2">
                  <DonutChart items={donutItems} />
                </div>
                <DonutLegend items={donutItems} />
              </>
            ) : loading ? (
              <div className="h-[200px]">
                <ChartSkeleton type="donut" />
              </div>
            ) : (
              <div className="flex items-center justify-center h-[200px] text-sm text-[color:var(--muted-fg)]">
                {t("common.noData")}
              </div>
            )}
          </Panel>
        </div>

        <CashflowForecastDashboardWidget />
      </TabsContent>

      <TabsContent value="invoice" className="space-y-6">
        <KpiSection items={invoiceKpis} columns={4} />
        <React.Suspense fallback={<Skeleton className="h-[400px]" />}>
          <LazyInvoicePartnersTable
            filterParams={{
              dateFrom: filter.state.dateFrom,
              dateTo: filter.state.dateTo,
              branchId: filter.state.custom.branchId,
            }}
          />
        </React.Suspense>
      </TabsContent>

      <TabsContent value="settlement" className="space-y-6">
        <KpiSection items={settlementKpis} columns={4} />
        <React.Suspense fallback={<Skeleton className="h-[500px]" />}>
          <LazySettlementTable
            filterParams={{
              dateFrom: filter.state.dateFrom,
              dateTo: filter.state.dateTo,
              branchId: filter.state.custom.branchId,
            }}
            onSetPeriod={(from, to) => {
              filter.setDateFrom(from ?? "");
              filter.setDateTo(to ?? "");
            }}
            onRefresh={onRefresh}
            onClearAllFilters={() => filter.resetAll()}
            extraActiveFilters={filter.activeFilterCount || 0}
          />
        </React.Suspense>
      </TabsContent>

      <TabsContent value="vinfastParts" className="space-y-8">
        <VinfastPartsSummaryCards filterState={filter.state} />
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <VinfastPartTrendChart
            title={t("vinfastParts.chartCar")}
            vehicleType="CAR"
            filterState={{
              dateFrom: filter.state.dateFrom,
              dateTo: filter.state.dateTo,
            }}
            groupBy={filter.state.custom.groupBy || "month"}
          />
          <VinfastPartTrendChart
            title={t("vinfastParts.chartMotorbike")}
            vehicleType="MOTORBIKE"
            filterState={{
              dateFrom: filter.state.dateFrom,
              dateTo: filter.state.dateTo,
            }}
            groupBy={filter.state.custom.groupBy || "month"}
          />
        </div>
        <div className="flex flex-col gap-8">
          <React.Suspense fallback={<Skeleton className="h-[400px]" />}>
            <LazyVFPartDashboardTable
              filterState={filter.state}
              vehicleType="CAR"
              title={t("vinfastParts.tableCarTitle")}
              onRowClick={() => {}}
            />
          </React.Suspense>
          <React.Suspense fallback={<Skeleton className="h-[400px]" />}>
            <LazyVFPartDashboardTable
              filterState={filter.state}
              vehicleType="MOTORBIKE"
              title={t("vinfastParts.tableMotorbikeTitle")}
              onRowClick={() => {}}
            />
          </React.Suspense>
        </div>
      </TabsContent>
    </Tabs>
  );
}

export { DEFAULT_COLORS, formatQty };
