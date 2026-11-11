import React from "react";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { V2Button, V2Text } from "@/v2/shared/components";
import { Plus, RotateCcw } from "lucide-react";
import { PortfolioLoanItem } from "@/v2/core/loans";
import { PortfolioLoanCard } from "./PortfolioLoanCard";

export interface PortfolioLoanListProps {
  loans: PortfolioLoanItem[];
  onAddLoan: () => void;
  onUpdateLoan: (id: string, patch: Partial<PortfolioLoanItem>) => void;
  onRemoveLoan: (id: string) => void;
  onToggleLoan: (id: string) => void;
  onReset: () => void;
}

export const PortfolioLoanList: React.FC<PortfolioLoanListProps> = ({
  loans,
  onAddLoan,
  onUpdateLoan,
  onRemoveLoan,
  onToggleLoan,
  onReset,
}) => {
  const { t } = useV2Translation();
  const activeCount = loans.filter((l) => l.enabled).length;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2">
        <div>
          <V2Text as="h3" variant="h4" weight="semibold">
            {t("v2.loans.portfolio.heading", "Danh Mục Khoản Vay")}
          </V2Text>
          <V2Text variant="body-sm" color="muted">
            {t(
              "v2.loans.portfolio.subtitle",
              "Nhập nhiều khoản vay với lãi suất và kỳ hạn khác nhau để mô phỏng dòng tiền gộp.",
            )}
            {" ("}
            <V2Text as="span" weight="medium" className="text-foreground">
              {activeCount}/{loans.length}
            </V2Text>{" "}
            {t("v2.loans.portfolio.activeText", "khoản đang bật")}
            {")"}
          </V2Text>
        </div>

        <div className="flex items-center gap-2">
          <V2Button
            variant="outline"
            size="sm"
            onClick={onReset}
            className="gap-1.5 text-xs"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            {t("v2.loans.action.reset", "Mặc định")}
          </V2Button>

          <V2Button size="sm" onClick={onAddLoan} className="gap-1.5 text-xs">
            <Plus className="h-3.5 w-3.5" />
            {t("v2.loans.action.addLoan", "Thêm khoản vay")}
          </V2Button>
        </div>
      </div>

      <div className="space-y-3">
        {loans.map((loan, idx) => (
          <PortfolioLoanCard
            key={loan.id}
            loan={loan}
            index={idx}
            totalLoans={loans.length}
            onUpdate={onUpdateLoan}
            onRemove={onRemoveLoan}
            onToggle={onToggleLoan}
          />
        ))}
      </div>
    </div>
  );
};
PortfolioLoanList.displayName = "PortfolioLoanList";
