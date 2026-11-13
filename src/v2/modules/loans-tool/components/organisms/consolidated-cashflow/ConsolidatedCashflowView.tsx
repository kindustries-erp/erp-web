import React from "react";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { V2Text } from "@/v2/shared/components";
import { LoanCashflowChart } from "@/v2/core/loans";
import { ConsolidatedCashflowTable } from "./ConsolidatedCashflowTable";
import { ConsolidatedCashflowKpis } from "./ConsolidatedCashflowKpis";
import { CashflowLoanFilterPanel } from "./CashflowLoanFilterPanel";
import { useConsolidatedCashflow } from "./useConsolidatedCashflow";

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

  if (isLoading) {
    return (
      <div className="p-8 text-center text-muted-foreground animate-pulse">
        {t("v2.common.loading", "Đang tải dữ liệu dòng tiền...")}
      </div>
    );
  }

  if (projections.length === 0 && allLoans.length === 0) {
    return (
      <div className="p-12 text-center text-muted-foreground bg-card rounded-2xl border border-border">
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

      <LoanCashflowChart schedule={projections} height={320} />

      <ConsolidatedCashflowTable projections={projections} />
    </div>
  );
};
ConsolidatedCashflowView.displayName = "ConsolidatedCashflowView";
