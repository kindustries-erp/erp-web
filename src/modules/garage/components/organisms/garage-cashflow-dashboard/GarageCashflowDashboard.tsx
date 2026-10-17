import React from "react";
import { LayoutDashboard } from "lucide-react";
import { DashboardTemplate } from "@/shared/components/DashboardTemplate";
import { GarageCashflowKpiCards } from "../garage-cashflow-kpi-cards";
import { GarageCashflowTrendPanel } from "../garage-cashflow-trend-panel";
import { GarageCashflowBreakdownPanels } from "../garage-cashflow-breakdown-panels";
import { GarageCashflowTopTxnsTable } from "../garage-cashflow-top-txns-table";
import { GarageCashflowDrawer } from "../garage-cashflow-drawer/GarageCashflowDrawer";
import { GarageCaseStandaloneDrawer } from "../../GarageCaseStandaloneDrawer";
import type { GarageCashflowDashboardProps } from "./GarageCashflowDashboard.type";
import { useGarageCashflowDashboard } from "./GarageCashflowDashboard.hook";

export const GarageCashflowDashboard: React.FC<
  GarageCashflowDashboardProps
> = ({ tabs, activeTab, onTabChange, onOpenCaseDetail }) => {
  const {
    t,
    filterConfig,
    filter,
    data,
    isLoading,
    isFetching,
    handleRefresh,
    selectedVoucher,
    setSelectedVoucher,
    selectedCaseCode,
    setSelectedCaseCode,
    handleOpenItem,
    handleOpenCase,
  } = useGarageCashflowDashboard(onOpenCaseDetail);

  return (
    <>
      <DashboardTemplate
        title={t("garage.cashflow.dashboard.title", "Tổng quan Thu Chi Xưởng")}
        desc={t(
          "garage.cashflow.dashboard.desc",
          "Tổng hợp chỉ số thu chi, phương thức thanh toán, xu hướng và các giao dịch nổi bật",
        )}
        icon={<LayoutDashboard className="h-4 w-4" />}
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={onTabChange}
        filterConfig={filterConfig}
        filter={filter}
        loading={isFetching}
        onRefresh={handleRefresh}
      >
        <GarageCashflowKpiCards kpi={data?.kpi} loading={isLoading} />
        <GarageCashflowTrendPanel trend={data?.trend} loading={isLoading} />
        <GarageCashflowBreakdownPanels
          methodBreakdown={data?.methodBreakdown}
          contentBreakdown={data?.contentBreakdown}
          loading={isLoading}
        />
        <GarageCashflowTopTxnsTable
          topTransactions={data?.topTransactions}
          loading={isLoading}
          onClickItem={handleOpenItem}
          onClickCase={handleOpenCase}
        />
      </DashboardTemplate>

      {selectedVoucher && (
        <GarageCashflowDrawer
          open={Boolean(selectedVoucher)}
          onClose={() => setSelectedVoucher(null)}
          voucher={selectedVoucher}
          initialMode="view"
        />
      )}

      {selectedCaseCode && (
        <GarageCaseStandaloneDrawer
          caseCode={selectedCaseCode}
          isOpen={Boolean(selectedCaseCode)}
          onClose={() => setSelectedCaseCode(null)}
        />
      )}
    </>
  );
};
