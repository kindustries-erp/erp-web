import React from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import {
  format,
  subMonths,
  subWeeks,
  subDays,
  startOfWeek,
  endOfWeek,
} from "date-fns";
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
  Warehouse,
  Car,
} from "lucide-react";
import { KpiCard } from "@/shared/components/KpiCard";
import { KpiSparkline } from "@/shared/components/KpiSparkline";
import { Panel } from "@/shared/components/Panel";
import { ChartSkeleton, Skeleton } from "@/shared/components/Skeleton";
import { BarChart } from "@/shared/components/charts/BarChart";
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
import { SummaryCard } from "@/modules/dashboard-core/components/DashboardSharedHelpers";
import type {
  CoreDashboardOverview,
  WorkshopKpiGroups,
} from "@/modules/dashboard-core/types";
import { DashboardCashflowTab } from "./DashboardCashflowTab";
import { BranchInvoiceChart } from "@/pages/components/BranchInvoiceChart";
import { erpInvoicesCoreApi } from "@/modules/erp-invoices-core/api/erpInvoicesCoreApi";

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
    value: "vinfastParts",
    labelKey: "tabs.vinfastParts",
    Icon: Car,
  },
] as const;

const BAR_CASH_IN = "#10B981"; // emerald-500
const BAR_CASH_OUT = "#EF4444"; // red-500

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
  branches: any[];
}

export function DashboardTabsContent({
  loading,
  filter,
  data,
  workshop,
  branches,
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
  } = data;
  const cashIn = cashflow.totalCashIn || 0;
  const cashOut = cashflow.totalCashOut || 0;
  const salesQty = sales.kpi?.totalQty || 0;
  const purQty = purchasing.kpi?.totalQty || 0;
  const lowStock = inventory.lowStockCount || 0;
  const zeroStock = inventory.zeroStockCount || 0;

  const settlementSummary = workshop.settlementSummary.data;

  const invoiceTrend = workshop.invoiceStats?.data?.cashTrend || [];
  const totalPayable = invoiceTrend.reduce(
    (sum: number, t: any) => sum + (t.cashOut || 0),
    0,
  );

  const selectedBranchId = filter.state.custom.branchId as string | undefined;

  const sectionsToRender: Array<{ id: string | null; name: string }> =
    React.useMemo(() => {
      const res: Array<{ id: string | null; name: string }> = [];
      if (selectedBranchId) {
        const selectedBranch = (branches || []).find(
          (b: any) => b.id === selectedBranchId,
        );
        if (selectedBranch) {
          res.push({ id: selectedBranch.id, name: selectedBranch.name });
        }
      } else {
        (branches || []).forEach((b: any) => {
          res.push({ id: b.id, name: b.name });
        });
        res.push({ id: null, name: "Chưa phân loại chi nhánh" });
      }
      return res;
    }, [branches, selectedBranchId]);

  const monthLabels = React.useMemo(() => {
    return Array.from({ length: 6 }).map((_, i) => {
      const d = subMonths(new Date(), 5 - i);
      return `Tháng ${format(d, "MM/yyyy")}`;
    });
  }, []);

  const weekLabels = React.useMemo(() => {
    return Array.from({ length: 4 }).map((_, i) => {
      const d = subWeeks(new Date(), 3 - i);
      const start = startOfWeek(d, { weekStartsOn: 1 });
      const end = endOfWeek(d, { weekStartsOn: 1 });
      return `${format(start, "dd/MM")} - ${format(end, "dd/MM")}`;
    });
  }, []);

  const dayLabels = React.useMemo(() => {
    return Array.from({ length: 7 }).map((_, i) => {
      const d = subDays(new Date(), 6 - i);
      return format(d, "dd/MM/yyyy");
    });
  }, []);

  const { data: outStats, isLoading: outStatsLoading } = useQuery({
    queryKey: ["erp-invoices-stats-dashboard", "OUT"],
    queryFn: () => erpInvoicesCoreApi.getStats("OUT"),
  });

  const { data: inStats, isLoading: inStatsLoading } = useQuery({
    queryKey: ["erp-invoices-stats-dashboard", "IN"],
    queryFn: () => erpInvoicesCoreApi.getStats("IN"),
  });

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
        <div>
          <div className="flex items-center gap-3 mb-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-md shadow-sm border border-emerald-100/50">
              Doanh thu bán hàng
            </h4>
            <div className="h-px bg-emerald-100/50 flex-1"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <KpiCard
              compact
              loading={outStatsLoading}
              label="Doanh thu Tháng này"
              value={money(outStats?.monthTotal || 0)}
              sub={`Trước thuế: ${money(outStats?.monthPreVat || 0)}`}
              rightNode={
                <KpiSparkline
                  data={outStats?.monthChart || [0, 0, 0, 0, 0, 0]}
                  preVatData={outStats?.monthPreVatChart || [0, 0, 0, 0, 0, 0]}
                  labels={monthLabels}
                />
              }
              bottomNode={(() => {
                const branches = outStats?.byBranch;
                return branches && branches.length > 0 ? (
                  <div className="pt-3 border-t border-border/50 grid grid-cols-3 gap-2">
                    {branches.map((b: any) => (
                      <div key={b.branchName} className="flex flex-col min-w-0">
                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider truncate">
                          {b.branchName}
                        </span>
                        <span className="font-semibold text-foreground text-sm mt-0.5 truncate">
                          {money(b.monthTotal)}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : null;
              })()}
            />
            <KpiCard
              compact
              loading={outStatsLoading}
              label="Doanh thu Tuần này"
              value={money(outStats?.weekTotal || 0)}
              sub={`Trước thuế: ${money(outStats?.weekPreVat || 0)}`}
              rightNode={
                <KpiSparkline
                  data={outStats?.weekChart || [0, 0, 0, 0]}
                  preVatData={outStats?.weekPreVatChart || [0, 0, 0, 0]}
                  labels={weekLabels}
                />
              }
              bottomNode={(() => {
                const branches = outStats?.byBranch;
                return branches && branches.length > 0 ? (
                  <div className="pt-3 border-t border-border/50 grid grid-cols-3 gap-2">
                    {branches.map((b: any) => (
                      <div key={b.branchName} className="flex flex-col min-w-0">
                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider truncate">
                          {b.branchName}
                        </span>
                        <span className="font-semibold text-foreground text-sm mt-0.5 truncate">
                          {money(b.weekTotal)}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : null;
              })()}
            />
            <KpiCard
              compact
              loading={outStatsLoading}
              label="Doanh thu Hôm nay"
              value={money(outStats?.dayTotal || 0)}
              sub={`Trước thuế: ${money(outStats?.dayPreVat || 0)}`}
              rightNode={
                <KpiSparkline
                  data={outStats?.dayChart || [0, 0, 0, 0, 0, 0, 0]}
                  preVatData={outStats?.dayPreVatChart || [0, 0, 0, 0, 0, 0, 0]}
                  labels={dayLabels}
                />
              }
              bottomNode={(() => {
                const branches = outStats?.byBranch;
                return branches && branches.length > 0 ? (
                  <div className="pt-3 border-t border-border/50 grid grid-cols-3 gap-2">
                    {branches.map((b: any) => (
                      <div key={b.branchName} className="flex flex-col min-w-0">
                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider truncate">
                          {b.branchName}
                        </span>
                        <span className="font-semibold text-foreground text-sm mt-0.5 truncate">
                          {money(b.dayTotal)}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : null;
              })()}
            />
          </div>
        </div>

        <div>
          <div className="flex items-center gap-3 mb-3 mt-6">
            <h4 className="text-xs font-bold uppercase tracking-wider text-orange-700 bg-orange-50 px-3 py-1.5 rounded-md shadow-sm border border-orange-200/50">
              Chi phí mua hàng
            </h4>
            <div className="h-px bg-orange-200/50 flex-1"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <KpiCard
              compact
              loading={inStatsLoading}
              label="Chi phí Tháng này"
              value={money(inStats?.monthTotal || 0)}
              sub={`Trước thuế: ${money(inStats?.monthPreVat || 0)}`}
              rightNode={
                <KpiSparkline
                  data={inStats?.monthChart || [0, 0, 0, 0, 0, 0]}
                  preVatData={inStats?.monthPreVatChart || [0, 0, 0, 0, 0, 0]}
                  labels={monthLabels}
                />
              }
              bottomNode={(() => {
                const branches = inStats?.byBranch;
                return branches && branches.length > 0 ? (
                  <div className="pt-3 border-t border-border/50 grid grid-cols-3 gap-2">
                    {branches.map((b: any) => (
                      <div key={b.branchName} className="flex flex-col min-w-0">
                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider truncate">
                          {b.branchName}
                        </span>
                        <span className="font-semibold text-foreground text-sm mt-0.5 truncate">
                          {money(b.monthTotal)}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : null;
              })()}
            />
            <KpiCard
              compact
              loading={inStatsLoading}
              label="Chi phí Tuần này"
              value={money(inStats?.weekTotal || 0)}
              sub={`Trước thuế: ${money(inStats?.weekPreVat || 0)}`}
              rightNode={
                <KpiSparkline
                  data={inStats?.weekChart || [0, 0, 0, 0]}
                  preVatData={inStats?.weekPreVatChart || [0, 0, 0, 0]}
                  labels={weekLabels}
                />
              }
              bottomNode={(() => {
                const branches = inStats?.byBranch;
                return branches && branches.length > 0 ? (
                  <div className="pt-3 border-t border-border/50 grid grid-cols-3 gap-2">
                    {branches.map((b: any) => (
                      <div key={b.branchName} className="flex flex-col min-w-0">
                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider truncate">
                          {b.branchName}
                        </span>
                        <span className="font-semibold text-foreground text-sm mt-0.5 truncate">
                          {money(b.weekTotal)}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : null;
              })()}
            />
            <KpiCard
              compact
              loading={inStatsLoading}
              label="Chi phí Hôm nay"
              value={money(inStats?.dayTotal || 0)}
              sub={`Trước thuế: ${money(inStats?.dayPreVat || 0)}`}
              rightNode={
                <KpiSparkline
                  data={inStats?.dayChart || [0, 0, 0, 0, 0, 0, 0]}
                  preVatData={inStats?.dayPreVatChart || [0, 0, 0, 0, 0, 0, 0]}
                  labels={dayLabels}
                />
              }
              bottomNode={(() => {
                const branches = inStats?.byBranch;
                return branches && branches.length > 0 ? (
                  <div className="pt-3 border-t border-border/50 grid grid-cols-3 gap-2">
                    {branches.map((b: any) => (
                      <div key={b.branchName} className="flex flex-col min-w-0">
                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider truncate">
                          {b.branchName}
                        </span>
                        <span className="font-semibold text-foreground text-sm mt-0.5 truncate">
                          {money(b.dayTotal)}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : null;
              })()}
            />
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4 text-slate-800">
            Biến động Doanh thu / Chi phí
          </h3>
          {!selectedBranchId && (
            <div className="mb-4">
              <BranchInvoiceChart
                key="chart-all"
                branchId="all"
                branchName="Tất cả chi nhánh (Tổng hợp)"
                filterState={filter.state}
                canView={true}
                mode="all"
              />
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {sectionsToRender.map((section) => (
              <BranchInvoiceChart
                key={`chart-${section.id || "unclassified"}`}
                branchId={section.id}
                branchName={section.name}
                filterState={filter.state}
                canView={true}
                mode="all"
              />
            ))}
          </div>
        </div>
      </TabsContent>

      <TabsContent value="inventory" className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
          <KpiCard
            loading={loading || workshop.invoiceStats.isLoading}
            label={t("kpi.totalPayable")}
            value={money(totalPayable)}
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
        <DashboardCashflowTab filter={filter} />
        <CashflowForecastDashboardWidget />
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
