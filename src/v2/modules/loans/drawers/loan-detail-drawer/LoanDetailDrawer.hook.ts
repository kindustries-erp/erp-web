import { useState, useMemo } from "react";
import { useLoanDetailQuery } from "../../api";
import {
  generateAmortizationSchedule,
  type LoanSchedulePeriod,
} from "@/v2/core/loans";
import type { LoanDetailDrawerProps } from "./LoanDetailDrawer.type";

export function useLoanDetailDrawer(props: LoanDetailDrawerProps) {
  const { loanId, open } = props;
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState<boolean>(false);

  const query = useLoanDetailQuery(open && loanId ? loanId : null);
  const loan = query.data;

  const schedule = useMemo<LoanSchedulePeriod[]>(() => {
    if (!loan) return [];
    if (loan.schedule && loan.schedule.length > 0) {
      return loan.schedule;
    }
    const result = generateAmortizationSchedule({
      principalAmount: Number(loan.principalAmount),
      annualInterestRate: Number(loan.annualInterestRate),
      tenorMonths: Number(loan.tenorMonths),
      amortizationMethod: loan.amortizationMethod,
      startDate: loan.startDate,
      firstPaymentDate: loan.firstPaymentDate,
    });
    return result.schedule;
  }, [loan]);

  const handleOpenPaymentModal = () => {
    setIsPaymentModalOpen(true);
  };

  const handleClosePaymentModal = () => {
    setIsPaymentModalOpen(false);
  };

  return {
    loan,
    isLoading: query.isLoading,
    error: query.error,
    schedule,
    activeTab,
    setActiveTab,
    isPaymentModalOpen,
    handleOpenPaymentModal,
    handleClosePaymentModal,
  };
}
