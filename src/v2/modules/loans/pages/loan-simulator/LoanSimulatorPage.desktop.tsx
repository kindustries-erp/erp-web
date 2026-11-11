import React from "react";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { V2Button, V2Text } from "@/v2/shared/components";
import { LoanKpiSummary, LoanCashflowChart } from "@/v2/core/loans";
import type { LoanSimulatorPageProps } from "./LoanSimulatorPage.type";
import { useLoanSimulatorPage } from "./LoanSimulatorPage.hook";
import { PortfolioLoanList } from "./components/PortfolioLoanList";
import { PortfolioScheduleTable } from "./components/PortfolioScheduleTable";

export const LoanSimulatorPageDesktop: React.FC<LoanSimulatorPageProps> = (
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
    <div className={`w-full min-h-full space-y-6 ${props.className ?? ""}`}>
      <div className="flex justify-between items-center bg-card p-6 rounded-2xl border border-border shadow-xs">
        <div>
          <V2Text variant="h2" className="text-xl font-bold">
            {t(
              "v2.loans.simulator.title",
              "Mô Phỏng & Tính Toán Khoản Vay Đa Nguồn",
            )}
          </V2Text>
          <V2Text variant="body" className="text-muted-foreground text-sm mt-1">
            {t(
              "v2.loans.simulator.subtitle",
              "Nhập nhiều khoản vay ngân hàng, mô phỏng áp lực dòng tiền và dự báo dư nợ tổng hợp.",
            )}
          </V2Text>
        </div>
        <div className="flex gap-3">
          <V2Button variant="outline" onClick={handleReset}>
            {t("v2.common.reset", "Đặt lại")}
          </V2Button>
          <V2Button
            variant="primary"
            onClick={handleSaveToErp}
            isLoading={isSaving}
          >
            {isAuthenticated
              ? t(
                  "v2.loans.simulator.saveToErp",
                  "Lưu danh mục vào hệ thống ERP",
                )
              : t("v2.loans.simulator.loginToSave", "Đăng nhập để lưu vào ERP")}
          </V2Button>
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-card p-6 rounded-2xl border border-border shadow-xs">
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

        <div className="bg-card p-5 rounded-2xl border border-border shadow-xs">
          <V2Text variant="h3" className="font-semibold text-base mb-3">
            {t(
              "v2.loans.charts.cashflowStream",
              "Dòng Chảy Tiền Vay & Dự Báo Dư Nợ Toàn Danh Mục",
            )}
          </V2Text>
          <LoanCashflowChart schedule={portfolioResult.schedule} height={320} />
        </div>

        <div className="bg-card p-5 rounded-2xl border border-border shadow-xs">
          <PortfolioScheduleTable schedule={portfolioResult.schedule} />
        </div>
      </div>
    </div>
  );
};
LoanSimulatorPageDesktop.displayName = "LoanSimulatorPageDesktop";
