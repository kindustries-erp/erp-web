import React from "react";
import { Landmark, Wallet, Plus } from "lucide-react";
import { DrawerSection } from "@/shared/components/DrawerModal";
import { QuoteReceivablesTable } from "../components/tables/quote-receivables-table";
import { QuoteCostSummarySection } from "../components/tables/quote-cost-summary-section";
import { CaseLinePaymentDrawer } from "../../../organisms/case-line-payment-drawer";
import { GarageCashflowFormDrawer } from "../../../organisms/garage-cashflow-form-drawer";
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
    cashflowDrawerOpen,
    cashflowType,
    remainingReceivable,
    handleOpenReceiptCashflow,
    handleOpenPaymentCashflow,
    handleCloseCashflowDrawer,
  } = useQuoteFinancialsTabContent(props);

  return (
    <div className={`space-y-4 ${props.className || ""}`}>
      {/* ─── 1. BẢNG PHẢI THU & CẤN TRỪ ─── */}
      <DrawerSection
        title={
          <span className="flex items-center gap-1.5 text-xs font-bold text-foreground">
            <Landmark className="w-3.5 h-3.5 text-primary" />
            {t(
              "cases.quotePreview.receivablesTitle",
              "1. Bảng Phải thu & Cấn trừ",
            )}
            <span className="text-xs font-normal text-muted-foreground ml-1">
              (2)
            </span>
          </span>
        }
        titleExtra={
          <button
            type="button"
            onClick={handleOpenReceiptCashflow}
            className="flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 transition-colors"
            title="Ghi nhận thu tiền cấn trừ trực tiếp cho phiếu này"
          >
            <Plus className="w-3 h-3" />
            <span>Thu tiền</span>
          </button>
        }
        collapsible
        defaultCollapsed={false}
      >
        <QuoteReceivablesTable
          caseData={props.caseData}
          activeSettlements={props.activeSettlements}
          activeLinkedInvoices={props.activeLinkedInvoices}
          canEditFinancial={canPerformPayment}
          canPerformPayment={canPerformPayment}
          disabledReason={disabledReason}
          onPaymentClick={handleReceivablePaymentClick}
          onRemoveInvoice={props.onRemoveInvoice}
          onRemoveSettlement={props.onRemoveSettlement}
        />
      </DrawerSection>

      {/* ─── 2. BẢNG PHẢI TRẢ & CẤN TRỪ ─── */}
      <DrawerSection
        title={
          <span className="flex items-center gap-1.5 text-xs font-bold text-foreground">
            <Wallet className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            {t(
              "cases.quotePreview.costSectionTitle",
              "2. Bảng Phải trả & Cấn trừ",
            )}
          </span>
        }
        titleExtra={
          <button
            type="button"
            onClick={handleOpenPaymentCashflow}
            className="flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded bg-amber-50 text-amber-700 hover:bg-amber-100 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-700 transition-colors"
            title="Ghi nhận chi tiền liên quan phiếu này"
          >
            <Plus className="w-3 h-3" />
            <span>Chi tiền</span>
          </button>
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
          onAddSettlement={props.onAddSettlement}
          onRemoveSettlement={props.onRemoveSettlement}
          onAddInvoice={props.onAddInvoice}
          onRemoveInvoice={props.onRemoveInvoice}
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
          onAddSettlement={props.onAddSettlement}
          onRemoveSettlement={props.onRemoveSettlement}
          onAddInvoice={props.onAddInvoice}
          onRemoveInvoice={props.onRemoveInvoice}
          onSuccess={closePaymentDrawer}
        />
      )}

      {/* ─── DRAWER THU/CHI NHANH CẤN TRỪ SỔ BÁO GIÁ ─── */}
      <GarageCashflowFormDrawer
        open={cashflowDrawerOpen}
        onClose={handleCloseCashflowDrawer}
        mode="create"
        defaultType={cashflowType}
        fixedCaseId={props.caseId}
        fixedCaseCode={props.caseCode}
        suggestedAmount={cashflowType === "RECEIPT" ? remainingReceivable : 0}
        onSuccess={() => {
          handleCloseCashflowDrawer();
          props.onPaymentSaved?.();
        }}
      />
    </div>
  );
}
