import React, { useState } from "react";
import { ChevronDown, SlidersHorizontal } from "lucide-react";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { V2Button, V2Icon, V2Stack, V2Text } from "@/v2/shared/components";
import {
  LoanKpiSummary,
  LoanCashflowChart,
  PortfolioScheduleTable,
} from "@/v2/core/loans";
import type { LoanSimulatorPageProps } from "./LoanSimulatorPage.type";
import { useLoanSimulatorPage } from "./LoanSimulatorPage.hook";
import { PortfolioLoanList } from "./components/PortfolioLoanList";
import { LoanSimulatorActionsSheet } from "./components/LoanSimulatorActionsSheet";

export const LoanSimulatorPageMobile: React.FC<LoanSimulatorPageProps> = (
  props,
) => {
  const { t } = useV2Translation();
  const [actionsOpen, setActionsOpen] = useState(false);
  const {
    loans,
    portfolioResult,
    isAuthenticated,
    isSaving,
    handleAddLoan,
    handleUpdateLoan,
    handleRemoveLoan,
    handleToggleLoan,
    handleReset,
    handleSaveToErp,
  } = useLoanSimulatorPage(props);

  return (
    <V2Stack
      gap="md"
      className={`w-full min-h-full pb-[calc(env(safe-area-inset-bottom)+1rem)] ${props.className ?? ""}`}
    >
      <V2Button
        type="button"
        variant="outline"
        fullWidth
        data-testid="loan-simulator-mobile-actions-trigger"
        onClick={() => setActionsOpen(true)}
        className="h-11 justify-between gap-2 rounded-xl border-border/70 bg-card px-3 text-foreground shadow-xs hover:bg-surface/80 active:scale-[0.98]"
      >
        <div className="flex min-w-0 items-center gap-2">
          <V2Icon icon={SlidersHorizontal} size={15} className="text-primary" />
          <V2Text as="span" variant="body-sm" weight="semibold" truncate>
            {t("v2.loans.simulator.actionsTrigger", "Thao tác danh mục")}
          </V2Text>
        </div>
        <V2Icon
          icon={ChevronDown}
          size={15}
          className="shrink-0 text-muted-fg"
        />
      </V2Button>

      <PortfolioLoanList
        loans={loans}
        onUpdateLoan={handleUpdateLoan}
        onRemoveLoan={handleRemoveLoan}
        onToggleLoan={handleToggleLoan}
      />

      <LoanKpiSummary
        firstMonthDue={portfolioResult.firstMonthPayment}
        monthlyAverage={portfolioResult.averageMonthlyPayment}
        totalInterest={portfolioResult.totalInterest}
        totalObligation={portfolioResult.totalRepayment}
      />

      <LoanCashflowChart schedule={portfolioResult.schedule} height={220} />

      <PortfolioScheduleTable schedule={portfolioResult.schedule} />

      <LoanSimulatorActionsSheet
        open={actionsOpen}
        onOpenChange={setActionsOpen}
        isAuthenticated={isAuthenticated}
        isSaving={isSaving}
        onReset={handleReset}
        onAddLoan={handleAddLoan}
        onSaveToErp={handleSaveToErp}
      />
    </V2Stack>
  );
};
LoanSimulatorPageMobile.displayName = "LoanSimulatorPageMobile";
