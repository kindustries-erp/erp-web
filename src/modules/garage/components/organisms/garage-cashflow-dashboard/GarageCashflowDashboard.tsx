import React, { useMemo } from "react";
import { LayoutDashboard, FileSpreadsheet } from "lucide-react";
import { DashboardTemplate } from "@/shared/components/DashboardTemplate";
import type { ActionDropdownItem } from "@/shared/components/ActionDropdown";
import { GarageCashflowKpiCards } from "../garage-cashflow-kpi-cards";
import { GarageCashflowTrendPanel } from "../garage-cashflow-trend-panel";
import { GarageCashflowBreakdownPanels } from "../garage-cashflow-breakdown-panels";
import { GarageCashflowTopTxnsTable } from "../garage-cashflow-top-txns-table";
import { GarageCashflowDrawer } from "../garage-cashflow-drawer/GarageCashflowDrawer";
import { GarageCashflowExportDrawer } from "../garage-cashflow-export-drawer/GarageCashflowExportDrawer";
import { GarageCaseStandaloneDrawer } from "../../GarageCaseStandaloneDrawer";
import type { GarageCashflowDashboardProps } from "./GarageCashflowDashboard.type";
import { useGarageCashflowDashboard } from "./GarageCashflowDashboard.hook";

export const GarageCashflowDashboard: React.FC<
  GarageCashflowDashboardProps
> = ({ tabs, activeTab, onTabChange, onOpenCaseDetail, onExportClick }) => {
  const {
    t,
    data,
    isLoading,
    isFetching,
    handleRefresh,
    selectedVoucher,
    setSelectedVoucher,
    selectedCaseCode,
    setSelectedCaseCode,
    exportDrawerOpen,
    setExportDrawerOpen,
    handleOpenExport,
    handleOpenItem,
    handleOpenCase,
  } = useGarageCashflowDashboard(onOpenCaseDetail, onExportClick);

  const createActions = useMemo<ActionDropdownItem[]>(
    () => [
      {
        groupLabel: t("groupThaoTac", { defaultValue: "Thao tác" }),
        items: [
          {
            label: t("debts.exportDetailed", "Xuất Excel theo kỳ / Nâng cao"),
            icon: <FileSpreadsheet className="w-4 h-4 text-emerald-600" />,
            onClick: handleOpenExport,
          },
        ],
      },
    ],
    [handleOpenExport, t],
  );

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
        loading={isFetching}
        onRefresh={handleRefresh}
        onCreate={handleOpenExport}
        createLabel={t("garage.cashflow.exportExcel", "Xuất Excel")}
        createIcon={
          <FileSpreadsheet className="w-4 h-4 mr-1 text-primary-fg/80" />
        }
        createActions={createActions}
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

      <GarageCashflowExportDrawer
        open={exportDrawerOpen}
        onClose={() => setExportDrawerOpen(false)}
      />
    </>
  );
};
