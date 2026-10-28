import React from "react";
import { useTranslation } from "react-i18next";
import { Users, FileSpreadsheet } from "lucide-react";
import { DashboardTemplate } from "@/shared/components/DashboardTemplate";
import { GarageDebtsKpiGrid } from "../garage-debts-kpi-grid";
import { GarageDebtsHorizonGrid } from "../garage-debts-horizon-grid";
import { GarageDebtsAnalyticsCharts } from "../garage-debts-analytics-charts";
import { GaragePaymentProgressCard } from "../garage-payment-progress-card";
import { GarageTimeHorizonDetailDrawer } from "../garage-time-horizon-detail-drawer";
import type { GarageDebtsDashboardTabProps } from "./GarageDebtsDashboardTab.type";
import { useGarageDebtsDashboardTab } from "./GarageDebtsDashboardTab.hook";

export const GarageDebtsDashboardTab: React.FC<
  GarageDebtsDashboardTabProps
> = ({ tabs, activeTab, onTabChange, onExportClick, onOpenCustomerDetail }) => {
  const { t } = useTranslation(["garage", "debts", "common"]);
  const {
    summary,
    agingComparison,
    timeHorizons,
    forecastHorizons,
    cashTrend,
    isLoading,
    isFetching,
    handleRefresh,
    selectedHorizon,
    setSelectedHorizon,
    selectedBranchId,
  } = useGarageDebtsDashboardTab();

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
      loading={isFetching}
      onRefresh={handleRefresh}
      onCreate={onExportClick}
      createLabel={t("debts.exportExcel", "Xuất Excel")}
      createIcon={
        <FileSpreadsheet className="w-4 h-4 mr-1 text-primary-fg/80" />
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

      {/* 4. Tiến độ Dòng tiền & Công nợ Dịch vụ */}
      <GaragePaymentProgressCard />

      {/* 5. Time Horizon Detail Drawer */}
      <GarageTimeHorizonDetailDrawer
        open={Boolean(selectedHorizon)}
        onClose={() => setSelectedHorizon(null)}
        horizon={selectedHorizon}
        branchId={selectedBranchId || undefined}
        onOpenCustomerDetail={onOpenCustomerDetail}
      />
    </DashboardTemplate>
  );
};
