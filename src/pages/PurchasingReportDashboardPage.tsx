import { LayoutDashboard } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { DashboardTemplate } from "@/shared/components/DashboardTemplate";
import { Panel } from "@/shared/components/Panel";
import { useFilterPanel } from "@/shared/hooks/useFilterPanel";
import { useT } from "@/core/i18n";
import { money } from "@/shared/utils/format";
import { reportsApi } from "@/modules/reports/api/reportsApi";

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
  const filterConfig = { period: true, noDefaultPeriod: true };
  const filter = useFilterPanel(filterConfig, () => {});

  const { data, isFetching, refetch } = useQuery({
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <KpiCard
          label={t("reports.purchasing.totalOrders")}
          value={String(data?.kpi.totalOrders || 0)}
        />
        <KpiCard
          label={t("reports.purchasing.totalAmount")}
          value={money(data?.kpi.totalPurchaseAmount || 0)}
        />
        <KpiCard
          label={t("reports.purchasing.completionRate")}
          value={`${(data?.kpi.completionRate || 0).toFixed(2)}%`}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <Panel title={t("reports.purchasing.statusBreakdown")}>
          <div className="space-y-2">
            {(data?.statusBreakdown || []).map((row) => (
              <div
                key={row.status}
                className="flex items-center justify-between text-sm"
              >
                <span>{row.status}</span>
                <span className="font-semibold">{row.count}</span>
              </div>
            ))}
            {!data?.statusBreakdown?.length && (
              <div className="text-sm text-[color:var(--muted-fg)]">
                {t("common.noData")}
              </div>
            )}
          </div>
        </Panel>

        <Panel title={t("reports.purchasing.topSuppliers")}>
          <div className="space-y-2">
            {(data?.topSuppliers || []).map((row) => (
              <div
                key={`${row.supplierId || "na"}-${row.supplierName}`}
                className="flex items-center justify-between text-sm gap-2"
              >
                <span className="truncate">{row.supplierName}</span>
                <span className="font-semibold whitespace-nowrap">
                  {money(row.amount)}
                </span>
              </div>
            ))}
            {!data?.topSuppliers?.length && (
              <div className="text-sm text-[color:var(--muted-fg)]">
                {t("common.noData")}
              </div>
            )}
          </div>
        </Panel>
      </div>
    </DashboardTemplate>
  );
}
