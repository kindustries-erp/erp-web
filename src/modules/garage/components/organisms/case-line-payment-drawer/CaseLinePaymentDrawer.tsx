import React, { useMemo } from "react";
import { ArrowDownLeft, ArrowUpRight, Banknote } from "lucide-react";
import {
  StandardFormDrawer,
  type DrawerTopTabItem,
} from "@/shared/components/StandardFormDrawer";
import { InvoiceTabContent } from "../../GarageCaseReconciliationDrawer/components/InvoiceTabContent";
import { ManualCashflowTabContent } from "../../GarageCaseReconciliationDrawer/components/ManualCashflowTabContent";
import { CaseLinePaymentRightPanel } from "./components/CaseLinePaymentRightPanel";
import { CaseLinePaymentPresetBar } from "./components/CaseLinePaymentPresetBar";
import { useCaseLinePaymentDrawer } from "./CaseLinePaymentDrawer.hook";
import { formatNumber } from "../garage-case-preview/GarageCasePreview.helper";
import type { CaseLinePaymentDrawerProps } from "./CaseLinePaymentDrawer.type";

export function CaseLinePaymentDrawer(props: CaseLinePaymentDrawerProps) {
  const {
    t,
    direction,
    isCost,
    invoiceTabKey,
    activeTab,
    handleTabChange,
    reconLogic,
    targetAmount,
    selectedAmount,
    realSettledAmount,
    remainingAmount,
    progressPercent,
    lineTypeLabel,
    payerLabel,
  } = useCaseLinePaymentDrawer(props);

  const drawerTabs: DrawerTopTabItem[] = useMemo(() => {
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

  const isManualTab = activeTab === "manual_cashflow";

  const editActions = useMemo(() => {
    if (isManualTab) {
      const hasAmount =
        Boolean(reconLogic.manualAmount) && Number(reconLogic.manualAmount) > 0;
      const pendingCount = reconLogic.pendingManualSettlements?.length || 0;
      const deletedCount = reconLogic.pendingDeletedSettlementIds?.length || 0;
      const canSave = hasAmount || pendingCount > 0 || deletedCount > 0;

      const baseLabel =
        direction === "COST"
          ? t("cases.financials.saveManualPayment", "Ghi nhận chi ngoài sổ")
          : t("cases.financials.saveManualReceipt", "Ghi nhận thu ngoài sổ");

      let submitLabel = baseLabel;
      if (pendingCount > 0 && deletedCount > 0) {
        submitLabel = `${baseLabel} (+${pendingCount}, -${deletedCount})`;
      } else if (deletedCount > 0) {
        submitLabel = `${baseLabel} (-${deletedCount})`;
      } else if (pendingCount > 0 || hasAmount) {
        const totalAdd = pendingCount + (hasAmount ? 1 : 0);
        submitLabel = `${baseLabel} (${totalAdd})`;
      }

      return [
        {
          label: t("common.close", "Đóng"),
          variant: "outline" as const,
          onClick: props.onClose,
        },
        {
          label: submitLabel,
          disabled: !canSave,
          loading: reconLogic.isSubmitting,
          onClick: reconLogic.handleSubmitBankAndCash,
        },
      ];
    }

    return [
      {
        label: t("common.close", "Đóng"),
        variant: "outline" as const,
        onClick: props.onClose,
      },
      {
        label: t("cases.reconciliation.saveInvoiceLinks", {
          count: reconLogic.selectedInvoicesCount,
          defaultValue: `Lưu cấn trừ (${reconLogic.selectedInvoicesCount} HĐ)`,
        }),
        disabled: !reconLogic.hasInvoiceChanges,
        loading: reconLogic.isSubmitting,
        onClick: reconLogic.handleSubmitInvoices,
      },
    ];
  }, [t, isManualTab, direction, props.onClose, reconLogic]);

  const titlePrefix =
    direction === "COST"
      ? t("cases.quotePreview.payCostTarget", "Chi tiền:")
      : t("cases.quotePreview.payOrCollect", "Thu tiền:");

  return (
    <StandardFormDrawer
      open={props.open}
      mode="view"
      onClose={props.onClose}
      size="xl"
      title={`${titlePrefix} ${props.lineName || props.lineCode || ""}`}
      titleExtra={
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold border ${
              direction === "COST"
                ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800"
                : "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800"
            }`}
          >
            {formatNumber(targetAmount)} ₫
          </span>
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            {payerLabel}
          </span>
        </div>
      }
      tabs={drawerTabs}
      activeTabKey={activeTab}
      onTabChange={handleTabChange}
      actions={editActions}
      rightPanel={
        <CaseLinePaymentRightPanel
          props={props}
          targetAmount={targetAmount}
          selectedAmount={selectedAmount}
          realSettledAmount={realSettledAmount}
          remainingAmount={remainingAmount}
          progressPercent={progressPercent}
          lineTypeLabel={lineTypeLabel}
          payerLabel={payerLabel}
          isCost={isCost}
        />
      }
    />
  );
}
