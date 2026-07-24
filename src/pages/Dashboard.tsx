import React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  LayoutDashboard,
  AlertCircle,
  ShoppingBag,
  Truck,
  DollarSign,
  Wallet,
} from "lucide-react";
import { KpiCard } from "@/shared/components/KpiCard";
import { DashboardTemplate } from "@/shared/components/DashboardTemplate";
import { Panel } from "@/shared/components/Panel";
import { ChartSkeleton, Skeleton } from "@/shared/components/Skeleton";
import { BarChart } from "@/shared/components/charts/BarChart";
import { DonutChart, DonutLegend } from "@/shared/components/charts/DonutChart";
import { useAuthStore } from "@/modules/auth/domain/authStore";
import { ComingSoon } from "@/pages/ComingSoon";
import { useT } from "@/core/i18n";
import { useFilterPanel } from "@/shared/hooks/useFilterPanel";
import { getBranchesApi } from "@/modules/branches/api/branchApi";
import { money } from "@/shared/utils/format";
import { dashboardCoreApi } from "@/modules/dashboard-core/api/dashboardCoreApi";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/shared/components/ui/tabs";

const formatQty = (v: number) =>
  new Intl.NumberFormat("vi-VN", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(v);

export function Dashboard() {
  const t = useT();
  const { employee } = useAuthStore();
  const isAdminEmail = employee?.email === "admin@liouni.com";

  const { data: branches = [] } = useQuery({
    queryKey: ["branches"],
    queryFn: () => getBranchesApi(),
  });

  const filterConfig = React.useMemo(() => {
    const custom: any[] = [
      {
        key: "branchId",
        label: "Chi nhánh",
        placeholder: "Tất cả chi nhánh",
        options: branches.map((b: any) => ({ value: b.id, label: b.name })),
      },
    ];

    return {
      period: true,
      noDefaultPeriod: true,
      custom,
    };
  }, [branches]);

  const filter = useFilterPanel(filterConfig, () => {});

  const { data, isLoading, refetch } = useQuery({
    queryKey: [
      "dashboard-core-overview",
      filter.state.dateFrom,
      filter.state.dateTo,
      filter.state.custom.branchId,
    ],
    queryFn: () =>
      dashboardCoreApi.getOverview({
        startDate: filter.state.dateFrom || undefined,
        endDate: filter.state.dateTo || undefined,
        branchId: filter.state.custom.branchId || undefined,
      }),
  });

  if (!isAdminEmail) {
    return <ComingSoon />;
  }

  // Derived data
  const dCashflow = data?.cashflow || {};
  const dSales = data?.sales || {};
  const dPurchasing = data?.purchasing || {};
  const dInventory = data?.inventory || {};

  const cashIn = dCashflow?.totalCashIn || 0;
  const cashOut = dCashflow?.totalCashOut || 0;
  const salesQty = dSales?.kpi?.totalQty || 0;
  const purQty = dPurchasing?.kpi?.totalQty || 0;
  const lowStock = dInventory?.lowStockCount || 0;
  const zeroStock = dInventory?.zeroStockCount || 0;

  // Chart colors
  const barIn = "#10b981"; // Emerald 500
  const barOut = "#ef4444"; // Red 500
  const barSales = "#3b82f6"; // Blue 500

  // Cash trend chart
  const cashTrendLabels = dCashflow?.cashTrend?.map((t: any) => t.label) || [];
  const cashTrendIn = dCashflow?.cashTrend?.map((t: any) => t.cashIn) || [];
  const cashTrendOut = dCashflow?.cashTrend?.map((t: any) => t.cashOut) || [];

  // Sales/Pur Trend Chart
  const salesLabels = dSales?.trend?.map((t: any) => t.month) || [];
  const salesData = dSales?.trend?.map((t: any) => t.qty) || [];

  const defaultColors = [
    "#3b82f6",
    "#10b981",
    "#f59e0b",
    "#ef4444",
    "#8b5cf6",
    "#ec4899",
    "#14b8a6",
  ];
  const totalExpenseBreakdown =
    dCashflow?.categoryBreakdown?.reduce(
      (acc: number, c: any) => acc + c.amount,
      0,
    ) || 1;
  const donutItems = (dCashflow?.categoryBreakdown || []).map(
    (c: any, i: number) => ({
      label: c.label || t("common.other"),
      value: Math.round((c.amount / totalExpenseBreakdown) * 100),
      color: c.color || defaultColors[i % defaultColors.length],
    }),
  );

  return (
    <DashboardTemplate
      title="Tổng quan toàn diện"
      desc="Giám sát hoạt động kinh doanh, dòng tiền và kho vận."
      icon={<LayoutDashboard className="h-4 w-4" />}
      filterConfig={filterConfig}
      filter={filter}
      loading={isLoading}
      onRefresh={() => refetch()}
    >
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:w-[600px] mb-6 shadow-sm border border-[color:var(--border)]">
          <TabsTrigger value="overview">Tổng quan</TabsTrigger>
          <TabsTrigger value="sales">Kinh doanh</TabsTrigger>
          <TabsTrigger value="inventory">Kho & Vận hành</TabsTrigger>
          <TabsTrigger value="cashflow">Dòng tiền</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Main Core KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <SummaryCard
              loading={isLoading}
              title="Tổng thu"
              value={money(cashIn)}
              icon={<DollarSign className="w-5 h-5 text-emerald-500" />}
            />
            <SummaryCard
              loading={isLoading}
              title="Tổng chi"
              value={money(cashOut)}
              icon={<Wallet className="w-5 h-5 text-red-500" />}
            />
            <SummaryCard
              loading={isLoading}
              title="SL Bán ra"
              value={formatQty(salesQty)}
              icon={<ShoppingBag className="w-5 h-5 text-blue-500" />}
            />
            <SummaryCard
              loading={isLoading}
              title="SL Mua vào"
              value={formatQty(purQty)}
              icon={<Truck className="w-5 h-5 text-orange-500" />}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center justify-between shadow-sm">
              <div className="flex flex-col">
                <span className="text-red-800 font-semibold text-sm">
                  Hết hàng
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
                  Sắp hết hàng
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
                  Đơn bán hàng
                </span>
                <span className="text-3xl font-bold text-blue-600">
                  {dSales?.kpi?.totalOrders || 0}
                </span>
              </div>
              <ShoppingBag className="w-8 h-8 text-blue-400 opacity-50" />
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <Panel title="Dòng tiền Thu/Chi">
              <div className="relative h-[250px]">
                {!isLoading && cashTrendLabels.length > 0 ? (
                  <BarChart
                    labels={cashTrendLabels}
                    yCallback={(v) => money(Number(v))}
                    datasets={[
                      { data: cashTrendIn, color: barIn, label: "Tổng Thu" },
                      { data: cashTrendOut, color: barOut, label: "Tổng Chi" },
                    ]}
                  />
                ) : isLoading ? (
                  <ChartSkeleton type="bar" />
                ) : (
                  <div className="flex items-center justify-center h-full text-sm text-[color:var(--muted-fg)]">
                    {t("common.noData")}
                  </div>
                )}
              </div>
            </Panel>
            <Panel title="Sản lượng Bán">
              <div className="relative h-[250px]">
                {!isLoading && salesLabels.length > 0 ? (
                  <BarChart
                    labels={salesLabels}
                    yCallback={(v) => formatQty(Number(v))}
                    datasets={[
                      {
                        data: salesData,
                        color: barSales,
                        label: "Số lượng bán",
                      },
                    ]}
                  />
                ) : isLoading ? (
                  <ChartSkeleton type="bar" />
                ) : (
                  <div className="flex items-center justify-center h-full text-sm text-[color:var(--muted-fg)]">
                    {t("common.noData")}
                  </div>
                )}
              </div>
            </Panel>
          </div>
        </TabsContent>

        <TabsContent value="sales" className="space-y-6">
          {/* Detailed sales from API response */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <KpiCard
              loading={isLoading}
              label="Tổng đơn hàng"
              value={String(dSales?.kpi?.totalOrders || 0)}
            />
            <KpiCard
              loading={isLoading}
              label="Tổng SL"
              value={formatQty(salesQty)}
            />
            <KpiCard
              loading={isLoading}
              label="Tỷ lệ hoàn thành"
              value={`${(dSales?.kpi?.completionRate || 0).toFixed(2)}%`}
            />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Panel title="Top Khách hàng">
              <div className="space-y-2 mt-2 max-h-[300px] overflow-y-auto pr-2">
                {(dSales?.topCustomers || []).map((row: any) => (
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
            <Panel title="Phân bổ màu sắc">
              {/* Reuse colors chart or leave a placeholder if too complex */}
              <div className="flex items-center justify-center h-full min-h-[200px] text-sm text-[color:var(--muted-fg)]">
                Vui lòng xem chi tiết ở trang Bán hàng
              </div>
            </Panel>
          </div>
        </TabsContent>

        <TabsContent value="inventory" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <KpiCard
              loading={isLoading}
              label="Tổng SKUs"
              value={String(dInventory?.totalSkus || 0)}
            />
            <KpiCard
              loading={isLoading}
              label="Phiếu Nhập"
              value={String(dInventory?.totalReceiptsCount || 0)}
            />
            <KpiCard
              loading={isLoading}
              label="Phiếu Xuất"
              value={String(dInventory?.totalIssuesCount || 0)}
            />
          </div>
          <Panel title="Biến động Nhập/Xuất">
            <div className="relative h-[250px]">
              {!isLoading && dInventory?.stockTrend?.length > 0 ? (
                <BarChart
                  labels={dInventory.stockTrend.map((t: any) => t.label)}
                  yCallback={(v) => String(v)}
                  datasets={[
                    {
                      data: dInventory.stockTrend.map((t: any) => t.receiptQty),
                      color: barIn,
                      label: "Nhập",
                    },
                    {
                      data: dInventory.stockTrend.map((t: any) => t.issueQty),
                      color: barOut,
                      label: "Xuất",
                    },
                  ]}
                />
              ) : isLoading ? (
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
              loading={isLoading}
              label={t("dashboard.kpi.totalCashIn")}
              value={money(cashIn)}
              icon={<IconTrendUp />}
            />
            <KpiCard
              loading={isLoading}
              label={t("dashboard.kpi.totalCashOut")}
              value={money(cashOut)}
              icon={<IconTrendDown />}
            />
          </div>
          <div className="grid grid-cols-1 min-[900px]:grid-cols-[1fr_300px] gap-3">
            <Panel title={t("dashboard.cashTrend")}>
              <div className="relative h-[210px]">
                {!isLoading && cashTrendLabels.length > 0 ? (
                  <BarChart
                    labels={cashTrendLabels}
                    yCallback={(v) => money(Number(v))}
                    datasets={[
                      {
                        data: cashTrendIn,
                        color: barIn,
                        label: t("dashboard.cashIn"),
                      },
                      {
                        data: cashTrendOut,
                        color: barOut,
                        label: t("dashboard.cashOut"),
                      },
                    ]}
                  />
                ) : isLoading ? (
                  <ChartSkeleton type="bar" />
                ) : (
                  <div className="flex items-center justify-center h-full text-sm text-[color:var(--muted-fg)]">
                    {t("common.noData")}
                  </div>
                )}
              </div>
            </Panel>
            <Panel title={t("dashboard.expenseByCategory")}>
              {!isLoading && donutItems.length > 0 ? (
                <>
                  <div className="relative h-[160px] mb-2">
                    <DonutChart items={donutItems} />
                  </div>
                  <DonutLegend items={donutItems} />
                </>
              ) : isLoading ? (
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
        </TabsContent>
      </Tabs>
    </DashboardTemplate>
  );
}

// ── Helpers ──
function SummaryCard({
  title,
  value,
  icon,
  loading,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  loading?: boolean;
}) {
  if (loading) {
    return (
      <div className="bg-[color:var(--surface)] border border-[color:var(--border)] rounded-xl p-4 shadow-sm flex flex-col gap-2 h-[104px]">
        <div className="flex items-center justify-between">
          <Skeleton className="w-24 h-5" />
          <Skeleton className="w-9 h-9 rounded-lg" />
        </div>
        <Skeleton className="w-32 h-8 mt-1" />
      </div>
    );
  }
  return (
    <div className="bg-[color:var(--surface)] border border-[color:var(--border)] rounded-xl p-4 shadow-sm flex flex-col gap-2 transition-transform hover:-translate-y-1 hover:shadow-md">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-[color:var(--muted-fg)]">
          {title}
        </span>
        <div className="p-2 bg-[color:var(--muted)] rounded-lg">{icon}</div>
      </div>
      <div className="text-2xl font-bold text-[color:var(--foreground)]">
        {value}
      </div>
    </div>
  );
}

// ── Icons ──
function IconTrendUp() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="text-emerald-500"
    >
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  );
}

function IconTrendDown() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="text-red-500"
    >
      <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
      <polyline points="17 18 23 18 23 12" />
    </svg>
  );
}
