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

export function PurchasingReportDashboardPage() {
  const t = useT();
  const filterConfig = React.useMemo(
    () => ({ period: true, noDefaultPeriod: true }),
    [],
  );
  const filter = useFilterPanel(filterConfig, () => {});

  const { data, isFetching, isLoading, refetch } = useQuery({
    queryKey: [
      "purchasing-report-dashboard",
      filter.state.dateFrom,
      filter.state.dateTo,
    ],
    queryFn: () =>
      reportsApi.getPurchasingDashboard({
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

  const trendLabels = (data?.trend || []).map((t) => t.month);
  const trendData = (data?.trend || []).map((t) => t.qty);
  const barColor = "#ea580c"; // Orange 600 for Purchasing

  return (
    <DashboardTemplate
      title={t("nav.items.purchasingReportDashboard")}
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
          label={t("reports.purchasing.totalOrders")}
          value={String(data?.kpi.totalOrders || 0)}
        />
        <KpiCard
          label={t("reports.purchasing.totalQty", "Tổng số lượng")}
          value={formatQty(data?.kpi.totalQty || 0)}
        />
        <KpiCard
          label={t("reports.purchasing.completionRate")}
          value={`${(data?.kpi.completionRate || 0).toFixed(2)}%`}
        />
      </div>

      <div className="grid grid-cols-1 min-[900px]:grid-cols-[1fr_300px] gap-3 mb-4">
        <Panel title={t("reports.purchasing.trend", "Xu hướng số lượng")}>
          <div className="relative h-[240px]">
            {!isLoading && trendLabels.length > 0 ? (
              <BarChart
                labels={trendLabels}
                yCallback={(v) => formatQty(Number(v))}
                datasets={[
                  {
                    data: trendData,
                    color: barColor,
                    label: t("reports.purchasing.qty", "Số lượng mua"),
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

        <Panel title={t("reports.purchasing.statusBreakdown")}>
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
        <Panel title={t("reports.purchasing.topSuppliers")}>
          <div className="space-y-3 mt-2">
            {(data?.topSuppliers || []).map((row) => (
              <div
                key={`${row.supplierId || "na"}-${row.supplierName}`}
                className="flex items-center justify-between text-sm gap-2 p-2 hover:bg-[color:var(--muted)] rounded-md transition-colors"
              >
                <div className="flex flex-col">
                  <span className="font-medium truncate">
                    {row.supplierName}
                  </span>
                  <span className="text-xs text-[color:var(--muted-fg)]">
                    {row.orders} {t("reports.purchasing.orders", "đơn hàng")}
                  </span>
                </div>
                <span className="font-semibold whitespace-nowrap text-[#ea580c]">
                  {formatQty(row.qty)}
                </span>
              </div>
            ))}
            {!data?.topSuppliers?.length && !isLoading && (
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
      </div>
    </DashboardTemplate>
  );
}
