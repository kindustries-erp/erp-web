import React from "react";
import { Plus, RotateCcw } from "lucide-react";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { V2Button, V2Icon, V2Text } from "@/v2/shared/components";
import {
  LoanKpiSummary,
  LoanCashflowChart,
  PortfolioScheduleTable,
} from "@/v2/core/loans";
import type { LoanSimulatorPageProps } from "./LoanSimulatorPage.type";
import { useLoanSimulatorPage } from "./LoanSimulatorPage.hook";
import { PortfolioLoanList } from "./components/PortfolioLoanList";

export const LoanSimulatorPageDesktop: React.FC<LoanSimulatorPageProps> = (
  props,
) => {
  const { t } = useV2Translation();
  const {
    loans,
    portfolioResult,
    isAuthenticated,
    canCreate,
    isSaving,
    handleAddLoan,
    handleUpdateLoan,
    handleRemoveLoan,
    handleToggleLoan,
    handleReset,
    handleSaveToErp,
  } = useLoanSimulatorPage(props);

  const activeCount = loans.filter((l) => l.enabled).length;

  return (
    <div className={`w-full min-h-full space-y-6 ${props.className ?? ""}`}>
      <div className="flex flex-wrap justify-between items-center gap-4 bg-card p-5 rounded-2xl border border-border shadow-xs">
        <div className="min-w-0">
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
            )}{" "}
            (
            <V2Text as="span" weight="medium" className="text-foreground">
              {activeCount}/{loans.length}
            </V2Text>{" "}
            {t("v2.loans.portfolio.activeText", "khoản đang bật")})
          </V2Text>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <V2Button
            variant="outline"
            onClick={handleReset}
            leftIcon={<V2Icon icon={RotateCcw} size={16} />}
          >
            {t("v2.loans.action.reset", "Mặc định")}
          </V2Button>
          <V2Button
            variant="outline"
            onClick={handleAddLoan}
            leftIcon={<V2Icon icon={Plus} size={16} />}
          >
            {t("v2.loans.action.addLoan", "Thêm khoản vay")}
          </V2Button>
          <V2Button
            variant="primary"
            onClick={handleSaveToErp}
            isLoading={isSaving}
            disabled={isAuthenticated && !canCreate}
            title={
              isAuthenticated && !canCreate
                ? t(
                    "v2.loans.portfolio.noPermissionCreate",
                    "Bạn không có quyền lưu hoặc tạo khoản vay mới vào hệ thống.",
                  )
                : undefined
            }
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

        <LoanCashflowChart schedule={portfolioResult.schedule} height={320} />

        <PortfolioScheduleTable schedule={portfolioResult.schedule} />
      </div>
    </div>
  );
};
LoanSimulatorPageDesktop.displayName = "LoanSimulatorPageDesktop";
