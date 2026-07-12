import React from "react";
import { LayoutDashboard } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { DashboardTemplate } from "@/shared/components/DashboardTemplate";
import { Panel } from "@/shared/components/Panel";
import { ChartSkeleton } from "@/shared/components/Skeleton";
import { BarChart } from "@/shared/components/charts/BarChart";
import { DonutChart, DonutLegend } from "@/shared/components/charts/DonutChart";
import { useFilterPanel } from "@/shared/hooks/useFilterPanel";
import { useT } from "@/core/i18n";
import { reportsApi } from "@/modules/reports/api/reportsApi";

const formatQty = (v: number) =>
  new Intl.NumberFormat("vi-VN", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(v);

function KpiCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-surface border border-border rounded-xl card-shadow p-4">
      <div className="text-xs text-[color:var(--muted-fg)] uppercase tracking-[0.05em] mb-2">
        {label}
      </div>
      <div className="text-2xl font-semibold text-foreground">{value}</div>
    </div>
  );
}

export function SalesReportDashboardPage() {
  const t = useT();
  const filterConfig = React.useMemo(
    () => ({ period: true, noDefaultPeriod: true }),
    [],
  );
  const filter = useFilterPanel(filterConfig, () => {});

  const { data, isFetching, isLoading, refetch } = useQuery({
    queryKey: [
      "sales-report-dashboard",
      filter.state.dateFrom,
      filter.state.dateTo,
    ],
    queryFn: () =>
      reportsApi.getSalesDashboard({
        dateFrom: filter.state.dateFrom || undefined,
        dateTo: filter.state.dateTo || undefined,
      }),
  });

  const defaultColors = [
    "#3b82f6",
    "#10b981",
    "#f59e0b",
    "#ef4444",
    "#8b5cf6",
    "#ec4899",
    "#14b8a6",
  ];

  const donutItems = (data?.statusBreakdown || []).map((c, i) => ({
    id: c.status,
    label: t(`status.${c.status}`, c.status),
    value: c.count,
    color: defaultColors[i % defaultColors.length],
  }));

  const colorDonutItems = (data?.colorBreakdown || []).map((c, i) => ({
    id: c.color,
    label: c.color,
    value: c.qty,
    color: defaultColors[(i + 3) % defaultColors.length],
  }));

  const trendLabels = (data?.trend || []).map((t) => t.month);
  const trendData = (data?.trend || []).map((t) => t.qty);
  const barColor = "#3b82f6"; // Blue 500 for Sales

  return (
    <DashboardTemplate
      title={t("nav.items.salesReportDashboard")}
      icon={<LayoutDashboard className="h-4 w-4" />}
      filterConfig={filterConfig}
      filter={filter}
      loading={isFetching}
      onRefresh={() => {
        void refetch();
      }}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        <KpiCard
          label={t("reports.sales.totalOrders")}
          value={String(data?.kpi.totalOrders || 0)}
        />
        <KpiCard
          label={t("reports.sales.totalQty", "Tổng số lượng")}
          value={formatQty(data?.kpi.totalQty || 0)}
        />
        <KpiCard
          label={t("reports.sales.completionRate")}
          value={`${(data?.kpi.completionRate || 0).toFixed(2)}%`}
        />
      </div>

      <div className="grid grid-cols-1 min-[900px]:grid-cols-[1fr_300px] gap-3 mb-4">
        <Panel title={t("reports.sales.trend", "Xu hướng số lượng")}>
          <div className="relative h-[240px]">
            {!isLoading && trendLabels.length > 0 ? (
              <BarChart
                labels={trendLabels}
                yCallback={(v) => formatQty(Number(v))}
                datasets={[
                  {
                    data: trendData,
                    color: barColor,
                    label: t("reports.sales.qty", "Số lượng bán"),
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

        <Panel title={t("reports.sales.statusBreakdown")}>
          {!isLoading && donutItems.length > 0 ? (
            <>
              <div className="relative h-[160px] mb-2 shrink-0">
                <DonutChart
                  items={donutItems}
                  valueFormatter={(v) => String(v)}
                />
              </div>
              <div className="max-h-[160px] overflow-y-auto pr-1">
                <DonutLegend
                  items={donutItems}
                  valueFormatter={(v) => String(v)}
                />
              </div>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-4">
        <Panel title={t("reports.sales.topCustomers")}>
          <div className="space-y-3 mt-2">
            {(data?.topCustomers || []).map((row) => (
              <div
                key={`${row.customerId || "na"}-${row.customerName}`}
                className="flex items-center justify-between text-sm gap-2 p-2 hover:bg-[color:var(--muted)] rounded-md transition-colors"
              >
                <div className="flex flex-col">
                  <span className="font-medium truncate">
                    {row.customerName}
                  </span>
                  <span className="text-xs text-[color:var(--muted-fg)]">
                    {row.orders} {t("reports.sales.orders", "đơn hàng")}
                  </span>
                </div>
                <span className="font-semibold whitespace-nowrap text-emerald-600">
                  {formatQty(row.qty)}
                </span>
              </div>
            ))}
            {!data?.topCustomers?.length && !isLoading && (
              <div className="text-sm text-[color:var(--muted-fg)] py-4 text-center">
                {t("common.noData")}
              </div>
            )}
            {isLoading && (
              <div className="py-4">
                <ChartSkeleton type="bar" />
              </div>
            )}
          </div>
        </Panel>

        <Panel title={t("reports.sales.colorBreakdown", "Phân bổ màu sắc")}>
          {!isLoading && colorDonutItems.length > 0 ? (
            <div className="flex flex-col md:flex-row gap-4 mt-2">
              <div className="w-full md:w-1/3 shrink-0 flex flex-col items-center justify-start">
                <div className="relative h-[160px] w-full max-w-[160px] mb-2">
                  <DonutChart
                    items={colorDonutItems}
                    valueFormatter={(v) => formatQty(v)}
                  />
                </div>
              </div>
              <div className="flex-1 max-h-[300px] overflow-y-auto space-y-2 pr-2">
                {(data?.colorBreakdown || []).map((row) => (
                  <div
                    key={row.color}
                    className="flex flex-col text-sm p-2 bg-[color:var(--muted)]/50 rounded-md"
                  >
                    <div className="flex items-center justify-between font-medium mb-1">
                      <span>{row.color}</span>
                      <span className="text-emerald-600">
                        {formatQty(row.qty)}
                      </span>
                    </div>
                    <div
                      className="text-xs text-[color:var(--muted-fg)] line-clamp-2"
                      title={row.customers}
                    >
                      {row.customers}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : isLoading ? (
            <div className="h-[200px]">
              <ChartSkeleton type="donut" />
            </div>
          ) : (
            <div className="text-sm text-[color:var(--muted-fg)] py-4 text-center">
              {t("common.noData")}
            </div>
          )}
        </Panel>
      </div>
    </DashboardTemplate>
  );
}
