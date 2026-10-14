import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { StandardFormDrawer } from "@/shared/components/StandardFormDrawer";
import { PillTabs } from "@/shared/components/PillTabs";
import { CustomerDetailHeader } from "./components/CustomerDetailHeader";
import { CustomerDetailDebtSwitch } from "./components/CustomerDetailDebtSwitch";
import { CustomerCasesTableTab } from "./components/CustomerCasesTableTab";
import { CustomerPipelineTab } from "./components/CustomerPipelineTab";
import { CustomerVehicleDebtTab } from "./components/CustomerVehicleDebtTab";
import { CustomerDebtAgingChartTab } from "./components/CustomerDebtAgingChartTab";
import { CustomerSidebarSummary } from "./components/CustomerSidebarSummary";
import { CustomerAuxiliaryModals } from "./components/CustomerAuxiliaryModals";
import { useGarageCustomerDetailLogic } from "./hooks/useGarageCustomerDetailLogic";
import type { GarageCustomerDetailDrawerProps } from "./types";

export function GarageCustomerDetailDrawer(
  props: GarageCustomerDetailDrawerProps,
) {
  const { open, onClose, customerCode, customerName, branchId } = props;
  const { t } = useTranslation(["garage", "common"]);
  const logic = useGarageCustomerDetailLogic(props);

  const isPayables = logic.activeDebtType === "payables";

  const subTabs = useMemo(
    () => [
      {
        value: "cases",
        label: t("customers.drawer.tabCases", "1. Phiếu DV hoàn thành"),
        badge: logic.completedCases.length,
      },
      {
        value: "pipeline",
        label: isPayables
          ? t("customers.drawer.tabPipelinePayables", "2. Xe đang làm (Dự chi)")
          : t("customers.drawer.tabPipeline", "2. Xe đang làm (Dự thu)"),
        badge:
          logic.inProgressCases.length > 0
            ? logic.inProgressCases.length
            : undefined,
      },
      {
        value: "vehicles",
        label: t("customers.drawer.vehicleMatrixTitle", "3. Phân bổ theo xe"),
        badge: logic.vehicleDebtStats.length,
      },
      {
        value: "analytics",
        label: t("customers.drawer.tabAnalytics", "4. Phân tích tuổi nợ"),
      },
    ],
    [
      isPayables,
      logic.completedCases.length,
      logic.inProgressCases.length,
      logic.vehicleDebtStats.length,
      t,
    ],
  );

  const leftContent = (
    <div className="flex flex-col gap-3 flex-1 min-h-0 w-full">
      <div className="flex items-center justify-between gap-3 overflow-x-auto scrollbar-none max-w-full pb-1 shrink-0 border-b border-border/40">
        <div className="flex items-center overflow-x-auto scrollbar-none">
          <PillTabs
            items={subTabs}
            value={logic.activeSubTab}
            onValueChange={logic.setActiveSubTab}
          />
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <CustomerDetailDebtSwitch
            value={logic.activeDebtType}
            onChange={logic.setActiveDebtType}
          />
        </div>
      </div>

      <div className="flex-1 min-h-0 flex flex-col w-full">
        {logic.activeSubTab === "cases" && (
          <CustomerCasesTableTab
            cases={logic.paginatedCompletedCases}
            totalCount={logic.filteredCompletedCases.length}
            totals={logic.totals}
            page={logic.page}
            pageSize={logic.pageSize}
            onPageChange={logic.setPage}
            onPageSizeChange={logic.setPageSize}
            tableState={logic.tableState}
            debtType={logic.activeDebtType}
            onOpenCaseDetail={(code, edit) => {
              logic.setSelectedCaseCode(code);
              logic.setDrawerEditMode(Boolean(edit));
            }}
            onOpenSettlementModal={logic.setSettlementCase}
            onOpenInvoiceLinkingModal={logic.setInvoiceLinkingCase}
          />
        )}

        {logic.activeSubTab === "pipeline" && (
          <CustomerPipelineTab
            cases={logic.inProgressCases}
            onOpenCaseDetail={(code) => {
              logic.setSelectedCaseCode(code);
              logic.setDrawerEditMode(false);
            }}
          />
        )}

        {logic.activeSubTab === "vehicles" && (
          <CustomerVehicleDebtTab
            vehicleStats={logic.vehicleDebtStats}
            debtType={logic.activeDebtType}
          />
        )}

        {logic.activeSubTab === "analytics" && (
          <CustomerDebtAgingChartTab
            agingDonutItems={logic.agingDonutItems}
            monthlyTrendItems={logic.monthlyTrendItems}
          />
        )}
      </div>
    </div>
  );

  return (
    <>
      <StandardFormDrawer
        open={open}
        mode="view"
        onClose={onClose}
        title={
          customerName ||
          customerCode ||
          t("customers.drawer.title", "Hồ sơ công nợ")
        }
        subtitle={
          <CustomerDetailHeader
            customerCode={customerCode}
            customerName={customerName}
            branchId={branchId}
            onRefresh={logic.refetch}
            isLoading={logic.isLoading}
          />
        }
        size="full"
        layout="2-columns"
        leftPanel={leftContent}
        rightPanel={
          <CustomerSidebarSummary
            customerCode={customerCode}
            customerName={customerName}
            totals={logic.totals}
            debtType={logic.activeDebtType}
          />
        }
      />

      <CustomerAuxiliaryModals
        selectedCaseCode={logic.selectedCaseCode}
        drawerEditMode={logic.drawerEditMode}
        onCloseCaseDetail={() => logic.setSelectedCaseCode(null)}
        settlementCase={logic.settlementCase}
        onCloseSettlement={() => logic.setSettlementCase(null)}
        invoiceLinkingCase={logic.invoiceLinkingCase}
        onCloseInvoiceLinking={() => logic.setInvoiceLinkingCase(null)}
        onRefresh={logic.refetch}
      />
    </>
  );
}
