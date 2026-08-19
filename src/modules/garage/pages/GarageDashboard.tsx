import React, { useState } from "react";
import { LayoutDashboard } from "lucide-react";
import { DashboardTemplate } from "@/shared/components/DashboardTemplate";
import { KpiCard } from "@/shared/components/KpiCard";
import { useFilterPanel } from "@/shared/hooks/useFilterPanel";
import { money } from "@/shared/utils/format";
import { useTranslation } from "react-i18next";
import { useGarageStore } from "../store/garageStore";
import { useGarageDashboardStats } from "../hooks/useGarageDashboardStats";
import { GarageBranchSelector } from "../components/GarageBranchSelector";
import { GarageRevenueProfitChart } from "../components/GarageRevenueProfitChart";
import { GarageStatusDistributionChart } from "../components/GarageStatusDistributionChart";
import { GarageRecentCasesTable } from "../components/GarageRecentCasesTable";
import { GarageCaseStandaloneDrawer } from "../components/GarageCaseStandaloneDrawer";
import { useAppStore } from "@/core/config/appStore";

export function GarageDashboard() {
  const { t } = useTranslation("garage");
  const { selectedBranchId } = useGarageStore();
  const { navigate } = useAppStore();
  const [selectedCaseCode, setSelectedCaseCode] = useState<string | null>(null);

  const filterConfig = React.useMemo(() => {
    return {
      period: true,
      noDefaultPeriod: true,
      custom: [],
    };
  }, []);

  const filter = useFilterPanel(filterConfig, () => {});

  const { stats, isLoading, isFetching, refetch } = useGarageDashboardStats({
    branchId: selectedBranchId,
    dateFrom: filter.state.dateFrom || undefined,
    dateTo: filter.state.dateTo || undefined,
  });

  return (
    <>
      <DashboardTemplate
        title={t("dashboard.title", "Tổng quan Garage")}
        desc={t(
          "dashboard.desc",
          "Báo cáo tổng quan hiệu quả hoạt động xưởng dịch vụ, doanh thu, chi phí và tình trạng phiếu sửa chữa",
        )}
        icon={<LayoutDashboard className="h-4 w-4 text-emerald-600" />}
        filterConfig={filterConfig}
        filter={filter}
        loading={isLoading || isFetching}
        onRefresh={() => refetch()}
      >
        <div className="flex flex-col gap-6 mb-8">
          {/* Branch Selector Bar */}
          <div className="flex items-center gap-3 p-3 bg-white dark:bg-slate-900 rounded-lg border shadow-sm">
            <GarageBranchSelector />
          </div>

          {/* Section 1: KPI Cards */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wider text-muted-foreground">
              {t("dashboard.kpis.overview", "Chỉ số tài chính & hiệu suất")}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              <KpiCard
                compact
                loading={isLoading}
                label={t("dashboard.kpis.totalRevenue", "Tổng doanh thu")}
                value={money(stats.totalRevenue)}
              />
              <KpiCard
                compact
                loading={isLoading}
                label={t("dashboard.kpis.totalCost", "Tổng giá vốn")}
                value={money(stats.totalCost)}
              />
              <KpiCard
                compact
                loading={isLoading}
                label={t("dashboard.kpis.grossProfit", "Lợi nhuận gộp")}
                value={money(stats.totalGrossProfit)}
              />
              <KpiCard
                compact
                loading={isLoading}
                label={t("dashboard.kpis.avgMargin", "Biên LN trung bình")}
                value={
                  stats.totalRevenue > 0
                    ? `${stats.averageMargin.toFixed(1)}%`
                    : "0%"
                }
              />
              <KpiCard
                compact
                loading={isLoading}
                label={t("dashboard.kpis.totalCases", "Tổng tiếp nhận")}
                value={stats.totalCases.toString()}
              />
              <KpiCard
                compact
                loading={isLoading}
                label={t("dashboard.kpis.completedCases", "Đã hoàn thành")}
                value={stats.completedCases.toString()}
              />
            </div>
          </div>

          {/* Section 2: Charts */}
          <div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2">
                <GarageRevenueProfitChart
                  data={stats.trendData}
                  loading={isLoading}
                />
              </div>
              <div className="lg:col-span-1">
                <GarageStatusDistributionChart
                  data={stats.statusDistribution}
                  loading={isLoading}
                />
              </div>
            </div>
          </div>

          {/* Section 3: Recent Cases Table */}
          <div>
            <GarageRecentCasesTable
              cases={stats.recentCases}
              onSelectCase={(code) => setSelectedCaseCode(code)}
              onViewAll={() => navigate("garage-cases")}
              loading={isLoading}
            />
          </div>
        </div>
      </DashboardTemplate>

      <GarageCaseStandaloneDrawer
        isOpen={!!selectedCaseCode}
        caseCode={selectedCaseCode}
        onClose={() => setSelectedCaseCode(null)}
        onSuccess={() => refetch()}
      />
    </>
  );
}
