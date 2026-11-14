import React, { useState } from "react";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { V2Text } from "@/v2/shared/components";
import { LoanCashflowChart } from "@/v2/core/loans";
import { ConsolidatedCashflowTable } from "./ConsolidatedCashflowTable";
import { ConsolidatedCashflowKpis } from "./ConsolidatedCashflowKpis";
import { CashflowLoanFilterPanel } from "./CashflowLoanFilterPanel";
import { useConsolidatedCashflow } from "./useConsolidatedCashflow";
import { RecordPaymentModal } from "../../../drawers/record-payment-modal";

export const ConsolidatedCashflowView: React.FC<{ className?: string }> = ({
  className = "",
}) => {
  const { t } = useV2Translation();
  const {
    isLoading,
    allLoans,
    enabledLoanIds,
    handleToggleLoan,
    handleSelectAll,
    handleClearAll,
    projections,
    kpis,
  } = useConsolidatedCashflow();

  const [paymentModal, setPaymentModal] = useState<{
    loanId: string;
    loanTitle: string;
    periodNumber?: number;
    suggestedPrincipal?: number;
    suggestedInterest?: number;
  } | null>(null);

  const handleRecordPayment = (
    loanId: string,
    loanName: string,
    periodNumber?: number,
    _dueDate?: string,
    principalDue?: number,
    interestDue?: number,
  ) => {
    const targetId = loanId || (allLoans.length > 0 ? allLoans[0].id : "");
    const targetTitle =
      loanName || (allLoans.length > 0 ? allLoans[0].name : "");
    if (!targetId) return;

    setPaymentModal({
      loanId: targetId,
      loanTitle: targetTitle,
      periodNumber,
      suggestedPrincipal: principalDue,
      suggestedInterest: interestDue,
    });
  };

  if (isLoading) {
    return (
      <div className="p-8 text-center text-muted-foreground animate-pulse">
        {t("v2.common.loading", "Đang tải dữ liệu dòng tiền...")}
      </div>
    );
  }

  if (projections.length === 0 && allLoans.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-card p-12 text-center text-muted-foreground">
        <V2Text variant="body">
          {t(
            "v2.loans.cashflow.noData",
            "Không có khoản vay nào đang hoạt động để lập dòng tiền.",
          )}
        </V2Text>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <CashflowLoanFilterPanel
        loans={allLoans}
        enabledLoanIds={enabledLoanIds}
        onToggle={handleToggleLoan}
        onSelectAll={handleSelectAll}
        onClearAll={handleClearAll}
      />

      <ConsolidatedCashflowKpis
        totalScheduledObligation={kpis.totalScheduledObligation}
        totalActualPaid={kpis.totalActualPaid}
        remainingPrincipal={kpis.remainingPrincipal}
      />

      <LoanCashflowChart
        schedule={projections}
        height={320}
        onRecordPayment={handleRecordPayment}
      />

      <ConsolidatedCashflowTable
        projections={projections}
        onRecordPayment={handleRecordPayment}
      />

      {paymentModal && (
        <RecordPaymentModal
          open={Boolean(paymentModal)}
          onClose={() => setPaymentModal(null)}
          loanId={paymentModal.loanId}
          loanTitle={paymentModal.loanTitle}
          suggestedPeriod={paymentModal.periodNumber}
          suggestedPrincipal={paymentModal.suggestedPrincipal}
          suggestedInterest={paymentModal.suggestedInterest}
        />
      )}
    </div>
  );
};
ConsolidatedCashflowView.displayName = "ConsolidatedCashflowView";
