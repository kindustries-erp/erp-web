import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { DashboardTemplate } from "@/shared/components/DashboardTemplate";
import { Button } from "@/shared/components/ui/Button";
import { useFilterPanel } from "@/shared/hooks/useFilterPanel";
import { useGarageStore } from "../store/garageStore";
import { useGarageDebtsDashboard } from "../hooks/useGarageDebtsDashboard";
import { GarageDebtsKpiGrid } from "./organisms/garage-debts-kpi-grid";
import { GarageDebtsHorizonGrid } from "./organisms/garage-debts-horizon-grid";
import { GarageDebtsAnalyticsCharts } from "./organisms/garage-debts-analytics-charts";
import { GarageTimeHorizonDetailDrawer } from "./organisms/garage-time-horizon-detail-drawer";
import { Users, FileSpreadsheet } from "lucide-react";
import type { TabItem } from "@/shared/components/PageLayout";
import type { GarageTimeHorizonKey } from "../api/garageDebtsAnalyticsApi";

export interface GarageDebtsDashboardTabProps {
  tabs?: TabItem[];
  activeTab?: string;
  onTabChange?: (val: string) => void;
  onExportClick?: () => void;
  onOpenCustomerDetail?: (code: string, name?: string) => void;
}

export const GarageDebtsDashboardTab: React.FC<
  GarageDebtsDashboardTabProps
> = ({ tabs, activeTab, onTabChange, onExportClick, onOpenCustomerDetail }) => {
  const { t } = useTranslation(["garage", "debts", "common"]);
  const { selectedBranchId } = useGarageStore();
  const [selectedHorizon, setSelectedHorizon] =
    useState<GarageTimeHorizonKey | null>(null);

  const filterConfig = useMemo(
    () => ({
      period: true,
      noDefaultPeriod: true,
      custom: [],
    }),
    [],
  );

  const filter = useFilterPanel(filterConfig, () => {});

  const {
    summary,
    agingComparison,
    timeHorizons,
    forecastHorizons,
    cashTrend,
    isLoading,
    isFetching,
    refetch,
  } = useGarageDebtsDashboard({
    dateFrom: filter.state.dateFrom || undefined,
    dateTo: filter.state.dateTo || undefined,
    branchId: selectedBranchId || undefined,
  });

  return (
    <DashboardTemplate
      title={t("garage:debts.title", "Công nợ Garage")}
      desc={t(
        "garage:debts.overviewDesc",
        "Tổng hợp tình hình công nợ dịch vụ, phân bổ 4 tầng tuổi nợ, dự báo dòng tiền và ma trận thu/chi xưởng",
      )}
      icon={<Users className="w-5 h-5 text-primary" />}
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={onTabChange}
      filterConfig={filterConfig}
      filter={filter}
      loading={isFetching}
      onRefresh={() => {
        void refetch();
      }}
      extraActions={
        onExportClick ? (
          <Button
            variant="outline"
            size="sm"
            onClick={onExportClick}
            className="gap-1.5"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            {t("debts:exportExcel", "Xuất Excel")}
          </Button>
        ) : undefined
      }
    >
      {/* 1. 3 Executive KPI Cards */}
      <GarageDebtsKpiGrid summary={summary} isLoading={isLoading} />

      {/* 2. Grid 4 Thẻ Tuổi nợ / Dự báo */}
      <GarageDebtsHorizonGrid
        timeHorizons={timeHorizons}
        forecastHorizons={forecastHorizons}
        onSelectHorizon={setSelectedHorizon}
      />

      {/* 3. Hàng 3 Biểu đồ Phân tích */}
      <GarageDebtsAnalyticsCharts
        cashTrend={cashTrend}
        agingComparison={agingComparison}
        isLoading={isLoading}
      />

      {/* 4. Time Horizon Detail Drawer */}
      <GarageTimeHorizonDetailDrawer
        open={Boolean(selectedHorizon)}
        onClose={() => setSelectedHorizon(null)}
        horizon={selectedHorizon}
        dateFrom={filter.state.dateFrom || undefined}
        dateTo={filter.state.dateTo || undefined}
        branchId={selectedBranchId || undefined}
        onOpenCustomerDetail={onOpenCustomerDetail}
      />
    </DashboardTemplate>
  );
};
