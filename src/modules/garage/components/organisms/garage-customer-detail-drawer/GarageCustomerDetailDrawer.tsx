import React, { useState } from "react";
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
import { GaragePartnerMonthDetailDrawer } from "../garage-partner-month-detail-drawer";
import { useGarageCustomerDetailLogic } from "./hooks/useGarageCustomerDetailLogic";
import { useCustomerSubTabs } from "./hooks/useCustomerSubTabs";
import type { GarageCustomerDetailDrawerProps } from "./types";

export function GarageCustomerDetailDrawer(
  props: GarageCustomerDetailDrawerProps,
) {
  const { open, onClose, customerCode, customerName, branchId } = props;
  const { t } = useTranslation(["garage", "common"]);
  const logic = useGarageCustomerDetailLogic(props);
  const [selectedMonthDetail, setSelectedMonthDetail] = useState<string | null>(
    null,
  );

  const isPayables = logic.activeDebtType === "payables";

  const subTabs = useCustomerSubTabs({
    isPayables,
    completedCount: logic.completedCases.length,
    inProgressCount: logic.inProgressCases.length,
    vehicleCount: logic.vehicleDebtStats.length,
    t,
  });

  const leftContent = (
    <div className="flex flex-col gap-3 flex-1 min-h-0 w-full">
      {/* Sub-Tabs & Switch Công nợ chuẩn erp-invoice */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 border-b border-border/40 w-full shrink-0">
        <div className="flex items-center overflow-x-auto scrollbar-none max-w-full">
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
            debtType={logic.activeDebtType}
            onSelectMonth={setSelectedMonthDetail}
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

      <GaragePartnerMonthDetailDrawer
        open={Boolean(selectedMonthDetail)}
        onClose={() => setSelectedMonthDetail(null)}
        month={selectedMonthDetail || ""}
        customerCode={customerCode}
        customerName={customerName}
        branchId={branchId}
        initialDebtType={logic.activeDebtType}
        initialCases={logic.allCases}
        onOpenCaseDetail={(code, edit) => {
          logic.setSelectedCaseCode(code);
          logic.setDrawerEditMode(Boolean(edit));
        }}
        onOpenSettlementModal={logic.setSettlementCase}
        onOpenInvoiceLinkingModal={logic.setInvoiceLinkingCase}
      />
    </>
  );
}

export default GarageCustomerDetailDrawer;
