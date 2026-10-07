import React from "react";
import { useTranslation } from "react-i18next";
import { QuoteCostTable } from "./QuoteCostTable";
import { CaseLinePaymentDrawer } from "@/modules/garage/components/organisms/case-line-payment-drawer";
import { useQuoteCostSummarySection } from "./QuoteCostSummarySection.hook";
import type { QuoteCostSummarySectionProps } from "./QuoteCostSummarySection.type";

export const QuoteCostSummarySection: React.FC<QuoteCostSummarySectionProps> = (
  props,
) => {
  const { t } = useTranslation(["garage", "common"]);
  const {
    isPaymentDrawerOpen,
    totalPaid,
    remainingAmount,
    handleOpenPayment,
    handleClosePayment,
  } = useQuoteCostSummarySection(props);

  const canPerform = props.canPerformPayment ?? props.canEditFinancial ?? true;

  return (
    <div className={`space-y-3 ${props.className || ""}`}>
      {/* ─── BẢNG CHI PHÍ VỤ VIỆC DẠNG CÂY 1 DÒNG TỔNG THEO HÌNH 2 ─── */}
      <QuoteCostTable
        totalCostAmount={props.totalCostAmount}
        totalPaid={totalPaid}
        remainingAmount={remainingAmount}
        activeLinkedInvoices={props.activeLinkedInvoices}
        activeSettlements={props.activeSettlements}
        canPerformPayment={canPerform}
        disabledReason={props.disabledReason}
        onPaymentClick={handleOpenPayment}
        onRemoveInvoice={props.onRemoveInvoice}
        onRemoveSettlement={props.onRemoveSettlement}
      />

      {/* ─── DRAWER GHI NHẬN CHI TIỀN & CẤN TRỪ ─── */}
      {isPaymentDrawerOpen && canPerform && (
        <CaseLinePaymentDrawer
          open={isPaymentDrawerOpen}
          onClose={handleClosePayment}
          caseId={props.caseId}
          caseCode={props.caseCode}
          caseData={props.caseData}
          lineId="cost_total"
          lineName={t(
            "cases.financials.totalCostTitle",
            "Tổng chi phí vụ việc",
          )}
          lineAmount={props.totalCostAmount}
          lineType="DV"
          payer="GARAGE"
          direction="COST"
          activeSettlements={props.activeSettlements}
          activeLinkedInvoices={props.activeLinkedInvoices}
          onAddSettlement={props.onAddSettlement}
          onRemoveSettlement={props.onRemoveSettlement}
          onAddInvoice={props.onAddInvoice}
          onRemoveInvoice={props.onRemoveInvoice}
          onSuccess={handleClosePayment}
        />
      )}
    </div>
  );
};
