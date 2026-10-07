import React from "react";
import { useTranslation } from "react-i18next";
import { QuoteCostTable } from "./QuoteCostTable";
import { QuoteCostSettlementsTable } from "./QuoteCostSettlementsTable";
import { CaseLinePaymentDrawer } from "@/modules/garage/components/organisms/case-line-payment-drawer";
import { useQuoteCostSummarySection } from "./QuoteCostSummarySection.hook";
import type { QuoteCostSummarySectionProps } from "./QuoteCostSummarySection.type";

export const QuoteCostSummarySection: React.FC<QuoteCostSummarySectionProps> = (
  props,
) => {
  const { t } = useTranslation(["garage", "common"]);
  const {
    isPaymentDrawerOpen,
    costSettlements,
    totalPaid,
    remainingAmount,
    handleOpenPayment,
    handleClosePayment,
  } = useQuoteCostSummarySection(props);

  const canPerform = props.canPerformPayment ?? props.canEditFinancial ?? true;

  return (
    <div className={`space-y-3 ${props.className || ""}`}>
      {/* ─── BẢNG CHI PHÍ VỤ VIỆC CHUẨN HÓA THEO /standardize-table ─── */}
      <QuoteCostTable
        totalCostAmount={props.totalCostAmount}
        totalPaid={totalPaid}
        remainingAmount={remainingAmount}
        activeLinkedInvoices={props.activeLinkedInvoices}
        activeSettlements={props.activeSettlements}
        canPerformPayment={canPerform}
        disabledReason={props.disabledReason}
        onPaymentClick={handleOpenPayment}
      />

      {/* ─── BẢNG DANH SÁCH CÁC KHOẢN ĐÃ CHI TIỀN (HỢP NHẤT HĐ ĐẦU VÀO & CHI NGOÀI SỔ) ─── */}
      <QuoteCostSettlementsTable settlements={costSettlements} />

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
          onSuccess={handleClosePayment}
        />
      )}
    </div>
  );
};
