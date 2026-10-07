import React from "react";
import { ReconciliationRightPanel } from "../GarageCaseReconciliationDrawer/components/ReconciliationRightPanel";
import { GarageCaseBusinessPerformanceSection } from "../drawer/sections/GarageCaseBusinessPerformanceSection";
import { useGarageCaseFinancials } from "./context/GarageCaseFinancialsContext";

export function GarageCaseFinancialsRightPanel({
  caseId,
  caseCode,
  caseData,
  grossProfit,
}: {
  caseId?: string;
  caseCode?: string;
  caseData?: any;
  grossProfit?: any;
}) {
  const logic = useGarageCaseFinancials();

  return (
    <div className="space-y-3 pb-3">
      <ReconciliationRightPanel
        caseId={caseId}
        caseCode={caseCode}
        caseData={caseData}
        caseSummary={logic.caseSummary}
        settlementType={logic.settlementType}
        activeTab={logic.activeTab}
        domainDirection={logic.domainDirection}
        onSetDomainDirection={logic.setDomainDirection}
        targetRevenue={logic.targetRevenue}
        targetCost={logic.targetCost}
        totalCollected={logic.totalCollected}
        totalPaid={logic.totalPaid}
        activeTabSettlementTotal={logic.activeTabSettlementTotal}
        isPaidFull={logic.isPaidFull}
        paymentPercent={logic.paymentPercent}
        remainingDebt={logic.remainingDebt}
        remainingAfterNetOff={logic.remainingAfterNetOff}
        selectedIds={logic.selectedIds}
        selectedInvoicesCount={logic.selectedInvoicesCount}
        invoiceNote={logic.invoiceNote}
        editMode={logic.editMode}
        onSetSettlementType={logic.setSettlementType}
        onSetInvoiceNote={logic.setInvoiceNote}
        hideDebtCashflowSection={true}
        hideGrossProfitSection={true}
      />
      <GarageCaseBusinessPerformanceSection
        caseData={caseData}
        grossProfit={grossProfit}
      />
    </div>
  );
}
