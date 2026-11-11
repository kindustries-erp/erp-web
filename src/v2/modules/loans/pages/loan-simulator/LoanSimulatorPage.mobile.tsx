import React from "react";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { V2Button, V2Text } from "@/v2/shared/components";
import {
  LoanKpiSummary,
  LoanCashflowChart,
  PortfolioScheduleTable,
} from "@/v2/core/loans";
import type { LoanSimulatorPageProps } from "./LoanSimulatorPage.type";
import { useLoanSimulatorPage } from "./LoanSimulatorPage.hook";
import { PortfolioLoanList } from "./components/PortfolioLoanList";

export const LoanSimulatorPageMobile: React.FC<LoanSimulatorPageProps> = (
  props,
) => {
  const { t } = useV2Translation();
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
    <div
      className={`w-full min-h-full space-y-4 pb-24 ${props.className ?? ""}`}
    >
      <div className="bg-card p-4 rounded-xl border border-border">
        <V2Text variant="h2" className="text-lg font-bold">
          {t("v2.loans.simulator.title", "Mô Phỏng Khoản Vay")}
        </V2Text>
        <V2Text
          variant="caption"
          className="text-muted-foreground mt-0.5 block"
        >
          {t(
            "v2.loans.simulator.subtitleMobile",
            "Mô phỏng áp lực dòng tiền danh mục nhiều khoản vay",
          )}
        </V2Text>
      </div>

      <div className="bg-card p-4 rounded-xl border border-border">
        <PortfolioLoanList
          loans={loans}
          onAddLoan={handleAddLoan}
          onUpdateLoan={handleUpdateLoan}
          onRemoveLoan={handleRemoveLoan}
          onToggleLoan={handleToggleLoan}
          onReset={handleReset}
        />
      </div>

      <LoanKpiSummary
        firstMonthDue={portfolioResult.firstMonthPayment}
        monthlyAverage={portfolioResult.averageMonthlyPayment}
        totalInterest={portfolioResult.totalInterest}
        totalObligation={portfolioResult.totalRepayment}
      />

      <LoanCashflowChart schedule={portfolioResult.schedule} height={220} />

      <PortfolioScheduleTable schedule={portfolioResult.schedule} />

      <div className="fixed bottom-0 left-0 right-0 p-3 bg-card border-t border-border z-40">
        <V2Button
          variant="primary"
          className="w-full h-11 text-base font-medium"
          onClick={handleSaveToErp}
          isLoading={isSaving}
        >
          {isAuthenticated
            ? t("v2.loans.simulator.saveToErp", "Lưu danh mục vào hệ thống ERP")
            : t("v2.loans.simulator.loginToSave", "Đăng nhập để lưu vào ERP")}
        </V2Button>
      </div>
    </div>
  );
};
LoanSimulatorPageMobile.displayName = "LoanSimulatorPageMobile";
