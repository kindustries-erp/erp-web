import React from "react";
import { useQuery } from "@tanstack/react-query";
import { LayoutDashboard } from "lucide-react";
import { KpiCard } from "@/shared/components/KpiCard";
import { DashboardTemplate } from "@/shared/components/DashboardTemplate";
import { Panel, PanelMore } from "@/shared/components/Panel";
import { BarChart } from "@/shared/components/charts/BarChart";
import { DonutChart, DonutLegend } from "@/shared/components/charts/DonutChart";
import { useAuthStore } from "@/modules/auth/domain/authStore";
import { ComingSoon } from "@/pages/ComingSoon";
import { useT } from "@/core/i18n";
import { useFilterPanel } from "@/shared/hooks/useFilterPanel";

import { bankStatementApi } from "@/modules/bank-statements/api/bankStatementApi";
import { getTags } from "@/modules/tags/api/tagsApi";
import { getBranchesApi } from "@/modules/branches/api/branchApi";
import { money } from "@/shared/utils/format";

export function Dashboard() {
  const t = useT();
  const { employee } = useAuthStore();
  const isAdminEmail = employee?.email === "admin@liouni.com";

  const { data: branches = [] } = useQuery({
    queryKey: ["branches"],
    queryFn: () => getBranchesApi(),
  });

  const { data: tags = [] } = useQuery({
    queryKey: ["sys-tags"],
    queryFn: getTags,
  });

  const filterConfig = React.useMemo(() => {
    const custom: any[] = [
      {
        key: "branchId",
        label: "Chi nhánh",
        placeholder: "Tất cả chi nhánh",
        options: branches.map((b: any) => ({ value: b.id, label: b.name })),
      },
      {
        key: "sourceType",
        label: "Nguồn tiền",
        placeholder: "Tất cả",
        options: [
          { value: "BANK", label: "Ngân hàng" },
          { value: "CASH", label: "Sổ quỹ" },
        ],
      },
      {
        key: "tagIds",
        label: "Danh mục (Tags)",
        placeholder: "Chọn danh mục",
        options: tags.map((t) => ({ value: t.id, label: t.name })),
        multiple: true,
      },
    ];

    return {
      period: true,
      noDefaultPeriod: true,
      custom,
    };
  }, [branches, tags]);

  const filter = useFilterPanel(filterConfig, () => {});

  const { data, isLoading, refetch } = useQuery({
    queryKey: [
      "dashboard-stats",
      filter.state.dateFrom,
      filter.state.dateTo,
      filter.state.custom.branchId,
      filter.state.custom.sourceType,
      filter.state.custom.tagIds,
    ],
    queryFn: () =>
      bankStatementApi.getDashboardStats({
        startDate: filter.state.dateFrom || undefined,
        endDate: filter.state.dateTo || undefined,
        branchId: filter.state.custom.branchId || undefined,
        sourceType: (filter.state.custom.sourceType as any) || undefined,
        tagIds:
          (filter.state.custom.tagIds as unknown as string[]) || undefined,
      }),
  });

  const barIn = "#10b981"; // Emerald 500
  const barOut = "#ef4444"; // Red 500

  const cashTrendLabels = data?.cashTrend?.map((t: any) => t.label) || [];
  const cashTrendIn = data?.cashTrend?.map((t: any) => t.cashIn) || [];
  const cashTrendOut = data?.cashTrend?.map((t: any) => t.cashOut) || [];

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
    data?.categoryBreakdown?.reduce(
      (acc: number, c: any) => acc + c.amount,
      0,
    ) || 1;
  const donutItems = (data?.categoryBreakdown || []).map(
    (c: any, i: number) => ({
      label: c.label || t("common.other"),
      value: Math.round((c.amount / totalExpenseBreakdown) * 100),
      color: c.color || defaultColors[i % defaultColors.length],
    }),
  );

  if (!isAdminEmail) {
    return <ComingSoon />;
  }

  return (
    <DashboardTemplate
      title={t("dashboard.title")}
      desc={t("dashboard.desc")}
      icon={<LayoutDashboard className="h-4 w-4" />}
      filterConfig={filterConfig}
      filter={filter}
      loading={isLoading}
      onRefresh={() => refetch()}
    >
      {/* KPIs */}
      <div className="grid grid-cols-2 max-[900px]:grid-cols-2 gap-3 mb-4">
        <KpiCard
          label={t("dashboard.kpi.totalCashIn")}
          value={isLoading ? "..." : money(data?.totalCashIn || 0)}
          icon={<IconTrendUp />}
        />
        <KpiCard
          label={t("dashboard.kpi.totalCashOut")}
          value={isLoading ? "..." : money(data?.totalCashOut || 0)}
          icon={<IconTrendDown />}
        />
      </div>

      {/* Panels row */}
      <div className="grid grid-cols-1 min-[900px]:grid-cols-[1fr_300px] gap-3">
        <Panel title={t("dashboard.cashTrend")} extra={<PanelMore />}>
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
            ) : (
              <div className="flex items-center justify-center h-full text-sm text-[color:var(--muted-fg)]">
                {isLoading ? t("common.loading") : t("common.noData")}
              </div>
            )}
          </div>
          <div className="flex gap-4 mt-[10px]">
            <LegendItem color={barIn} label={t("dashboard.cashIn")} />
            <LegendItem color={barOut} label={t("dashboard.cashOut")} />
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
          ) : (
            <div className="flex items-center justify-center h-[200px] text-sm text-[color:var(--muted-fg)]">
              {isLoading ? t("common.loading") : t("common.noData")}
            </div>
          )}
        </Panel>
      </div>
    </DashboardTemplate>
  );
}

// ── Helpers ──
function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-[6px] text-xs text-[color:var(--muted-fg)]">
      <div
        className="w-[10px] h-[10px] rounded-sm border border-[color:var(--border)]"
        style={{ background: color }}
      />
      {label}
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
      className="text-green-600"
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
      className="text-red-600"
    >
      <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
      <polyline points="17 18 23 18 23 12" />
    </svg>
  );
}
