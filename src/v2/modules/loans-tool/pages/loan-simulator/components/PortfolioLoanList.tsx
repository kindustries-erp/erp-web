import React from "react";
import { PortfolioLoanItem } from "@/v2/core/loans";
import { PortfolioLoanCard } from "./PortfolioLoanCard";

export interface PortfolioLoanListProps {
  loans: PortfolioLoanItem[];
  onUpdateLoan: (id: string, patch: Partial<PortfolioLoanItem>) => void;
  onRemoveLoan: (id: string) => void;
  onToggleLoan: (id: string) => void;
}

export const PortfolioLoanList: React.FC<PortfolioLoanListProps> = ({
  loans,
  onUpdateLoan,
  onRemoveLoan,
  onToggleLoan,
}) => {
  return (
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
  );
};
PortfolioLoanList.displayName = "PortfolioLoanList";
