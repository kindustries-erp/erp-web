import React from "react";
import { StandardFormDrawer } from "@/shared/components/StandardFormDrawer";
import { CaseLinePaymentRightPanel } from "./components/CaseLinePaymentRightPanel";
import { CaseLinePaymentSelectedButton } from "./components/CaseLinePaymentSelectedButton";
import { useCaseLinePaymentDrawer } from "./CaseLinePaymentDrawer.hook";
import { useCaseLinePaymentTabs } from "./hooks/useCaseLinePaymentTabs";
import { useCaseLinePaymentActions } from "./hooks/useCaseLinePaymentActions";
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

  const drawerTabs = useCaseLinePaymentTabs({
    direction,
    invoiceTabKey,
    reconLogic,
    remainingAmount,
    t,
  });

  const actions = useCaseLinePaymentActions({
    isManualTab: activeTab === "manual_cashflow",
    direction,
    reconLogic,
    onClose: props.onClose,
    t,
  });

  const titlePrefix =
    direction === "COST"
      ? t("cases.quotePreview.payCostTarget", "Chi tiền:")
      : t("cases.quotePreview.payOrCollect", "Thu tiền:");

  const handleToggleSelectedPreset = () => {
    if (reconLogic.viewPreset === "selected") {
      const hasLinked =
        (isCost
          ? reconLogic.initialLinkedInCount
          : reconLogic.initialLinkedOutCount) > 0;
      const hasSuggestions = reconLogic.invoiceSuggestions?.length > 0;
      if (hasLinked) reconLogic.setViewPreset("linked");
      else if (hasSuggestions) reconLogic.setViewPreset("suggestions");
      else reconLogic.setViewPreset("all");
    } else {
      reconLogic.setViewPreset("selected");
    }
  };

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
          <CaseLinePaymentSelectedButton
            selectedCount={reconLogic.selectedInvoicesCount}
            isActive={reconLogic.viewPreset === "selected"}
            onClick={handleToggleSelectedPreset}
          />
        </div>
      }
      tabs={drawerTabs}
      activeTabKey={activeTab}
      onTabChange={handleTabChange}
      actions={actions}
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
