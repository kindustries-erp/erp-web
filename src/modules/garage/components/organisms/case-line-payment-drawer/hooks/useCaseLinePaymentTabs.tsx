import React, { useMemo } from "react";
import type { TFunction } from "i18next";
import { ArrowDownLeft, ArrowUpRight, Banknote } from "lucide-react";
import type { DrawerTopTabItem } from "@/shared/components/StandardFormDrawer";
import { InvoiceTabContent } from "../../../GarageCaseReconciliationDrawer/components/InvoiceTabContent";
import { ManualCashflowTabContent } from "../../../GarageCaseReconciliationDrawer/components/ManualCashflowTabContent";
import { CaseLinePaymentPresetBar } from "../components/CaseLinePaymentPresetBar";

export interface UseCaseLinePaymentTabsOptions {
  direction?: "COST" | "REVENUE";
  invoiceTabKey: string;
  reconLogic: any;
  remainingAmount: number;
  t: TFunction;
}

export function useCaseLinePaymentTabs({
  direction,
  invoiceTabKey,
  reconLogic,
  remainingAmount,
  t,
}: UseCaseLinePaymentTabsOptions): DrawerTopTabItem[] {
  return useMemo(() => {
    const isCost = direction === "COST";
    const invoiceDirection = isCost ? "IN" : "OUT";
    const invoiceTabLabel = isCost
      ? t("cases.financials.tabInvoicesIn", "1. HĐ Đầu vào")
      : t("cases.financials.tabInvoicesOut", "1. HĐ Đầu ra");
    const InvoiceIcon = isCost ? ArrowUpRight : ArrowDownLeft;
    const manualTabLabel = isCost
      ? t("cases.financials.tabManualCashflowPayment", "2. Chi ngoài sổ")
      : t("cases.financials.tabManualCashflow", "2. Thu ngoài sổ");
    const settlementType = isCost ? ("PAYMENT" as const) : ("RECEIPT" as const);
    const linkedCount = isCost
      ? reconLogic.initialLinkedInCount
      : reconLogic.initialLinkedOutCount;

    return [
      {
        key: invoiceTabKey,
        label: invoiceTabLabel,
        icon: <InvoiceIcon className="w-3.5 h-3.5 text-muted-foreground" />,
        badgeCount: reconLogic.selectedInvoicesCount || undefined,
        content: (
          <div className="space-y-2">
            <CaseLinePaymentPresetBar
              viewPreset={reconLogic.viewPreset}
              onSelectPreset={reconLogic.setViewPreset}
              totalCount={
                reconLogic.displayInvoiceTotal ?? reconLogic.invoiceItems.length
              }
              suggestionsCount={reconLogic.invoiceSuggestions.length}
              selectedCount={reconLogic.selectedInvoicesCount}
              linkedCount={linkedCount}
            />
            <InvoiceTabContent
              invoiceDirection={invoiceDirection}
              invoiceItems={reconLogic.invoiceItems}
              selectedInvoicesList={reconLogic.selectedInvoicesList}
              selectedInvoicesCount={reconLogic.selectedInvoicesCount}
              selectedInvoicesTotal={reconLogic.selectedInvoicesTotal}
              selectedInvoicesMap={reconLogic.selectedInvoicesMap}
              invoiceDataTotal={reconLogic.displayInvoiceTotal}
              invoiceDataTotalPages={reconLogic.displayInvoiceTotalPages}
              invoicePage={reconLogic.invoicePage}
              invoicePageSize={reconLogic.invoicePageSize}
              isLoadingInvoices={
                reconLogic.isLoadingInvoices && reconLogic.viewPreset === "all"
              }
              invoiceDateFrom={reconLogic.invoiceDateFrom}
              invoiceDateTo={reconLogic.invoiceDateTo}
              invoiceTableState={reconLogic.invoiceTableState}
              onToggleInvoice={reconLogic.handleToggleInvoice}
              onSelectAllInvoices={reconLogic.handleSelectAllInvoices}
              onViewInvoiceDetail={(id) => reconLogic.setViewInvoiceId(id)}
              onPreviewInvoicePdf={(pdf) => reconLogic.setPreviewPdf(pdf)}
              onSetInvoicePage={reconLogic.setInvoicePage}
              onSetInvoicePageSize={reconLogic.setInvoicePageSize}
              onSetInvoiceDateFrom={reconLogic.setInvoiceDateFrom}
              onSetInvoiceDateTo={reconLogic.setInvoiceDateTo}
              editMode={true}
              viewPreset={reconLogic.viewPreset}
              onSelectAllSuggestions={reconLogic.handleSelectAllSuggestions}
              suggestionsCount={reconLogic.invoiceSuggestions.length}
            />
          </div>
        ),
      },
      {
        key: "manual_cashflow",
        label: manualTabLabel,
        icon: <Banknote className="w-3.5 h-3.5 text-muted-foreground" />,
        content: (
          <ManualCashflowTabContent
            editMode={true}
            settlementType={settlementType}
            baseRemaining={remainingAmount}
            manualAmount={reconLogic.manualAmount}
            manualCategory={reconLogic.manualCategory}
            manualDate={reconLogic.manualDate}
            manualPartner={reconLogic.manualPartner}
            manualNote={reconLogic.manualNote}
            onSetManualAmount={reconLogic.setManualAmount}
            onSetManualCategory={reconLogic.setManualCategory}
            onSetManualDate={reconLogic.setManualDate}
            onSetManualPartner={reconLogic.setManualPartner}
            onSetManualNote={reconLogic.setManualNote}
            onAddManualSettlement={reconLogic.handleAddManualToDraft}
            activeSettlements={reconLogic.activeSettlements}
            onRemoveSettlement={reconLogic.onRemoveSettlement}
            manualDraftPending={reconLogic.manualDraftPending}
          />
        ),
      },
    ];
  }, [t, direction, invoiceTabKey, reconLogic, remainingAmount]);
}
