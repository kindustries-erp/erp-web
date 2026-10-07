import React from "react";
import { Landmark, Wallet } from "lucide-react";
import { DrawerSection } from "@/shared/components/DrawerModal";
import { QuoteReceivablesTable } from "../components/tables/quote-receivables-table";
import { QuoteCostSummarySection } from "../components/tables/quote-cost-summary-section";
import { CaseLinePaymentDrawer } from "../../../organisms/case-line-payment-drawer";
import { useQuoteFinancialsTabContent } from "./QuoteFinancialsTabContent.hook";
import type { QuoteFinancialsTabContentProps } from "./QuoteFinancialsTabContent.type";

export function QuoteFinancialsTabContent(
  props: QuoteFinancialsTabContentProps,
) {
  const {
    t,
    totalCostAmount,
    canPerformPayment,
    disabledReason,
    isPaymentDrawerOpen,
    paymentDrawerTarget,
    handleReceivablePaymentClick,
    closePaymentDrawer,
  } = useQuoteFinancialsTabContent(props);

  return (
    <div className={`space-y-4 ${props.className || ""}`}>
      {/* ─── 1. BẢNG PHẢI THU (ĐỨNG ĐẦU TIÊN - ĐÚNG 2 HÀNG KH & BH) ─── */}
      <DrawerSection
        title={
          <span className="flex items-center gap-1.5 text-xs font-bold text-foreground">
            <Landmark className="w-3.5 h-3.5 text-primary" />
            {t(
              "cases.quotePreview.receivablesTitle",
              "1. Bảng Phải thu & Phân bổ",
            )}
            <span className="text-xs font-normal text-muted-foreground ml-1">
              (2)
            </span>
          </span>
        }
        collapsible
        defaultCollapsed={false}
      >
        <QuoteReceivablesTable
          caseData={props.caseData}
          activeSettlements={props.activeSettlements}
          activeLinkedInvoices={props.activeLinkedInvoices}
          canPerformPayment={canPerformPayment}
          disabledReason={disabledReason}
          onPaymentClick={handleReceivablePaymentClick}
        />
      </DrawerSection>

      {/* ─── 2. BẢNG CHI PHÍ VỤ VIỆC (1 HÀNG TỔNG CHI PHÍ & DANH SÁCH ĐÃ CHI) ─── */}
      <DrawerSection
        title={
          <span className="flex items-center gap-1.5 text-xs font-bold text-foreground">
            <Wallet className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            {t(
              "cases.quotePreview.costSectionTitle",
              "2. Bảng Chi phí vụ việc & Cấn trừ",
            )}
          </span>
        }
        collapsible
        defaultCollapsed={false}
      >
        <QuoteCostSummarySection
          totalCostAmount={totalCostAmount}
          activeSettlements={props.activeSettlements}
          activeLinkedInvoices={props.activeLinkedInvoices}
          editMode={props.editMode}
          canPerformPayment={canPerformPayment}
          disabledReason={disabledReason}
          caseId={props.caseId}
          caseCode={props.caseCode}
          caseData={props.caseData}
          onPaymentSaved={props.onPaymentSaved}
        />
      </DrawerSection>

      {/* ─── DRAWER CẤN TRỪ KHI CLICK THU TIỀN (PHẢI THU KH / BH) ─── */}
      {isPaymentDrawerOpen && paymentDrawerTarget && canPerformPayment && (
        <CaseLinePaymentDrawer
          open={isPaymentDrawerOpen}
          onClose={closePaymentDrawer}
          caseId={props.caseId}
          caseCode={props.caseCode}
          caseData={props.caseData}
          lineId={paymentDrawerTarget.lineId}
          lineCode={paymentDrawerTarget.lineCode}
          lineName={paymentDrawerTarget.lineName}
          lineAmount={paymentDrawerTarget.lineAmount}
          lineType={paymentDrawerTarget.lineType}
          payer={paymentDrawerTarget.payer}
          direction={paymentDrawerTarget.direction}
          activeSettlements={props.activeSettlements}
          activeLinkedInvoices={props.activeLinkedInvoices}
        />
      )}
    </div>
  );
}
