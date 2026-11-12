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
  const [selectedPeriod, setSelectedPeriod] =
    useState<LoanSchedulePeriod | null>(null);

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

  const kpiSummary = useMemo(() => {
    const totalInterest = schedule.reduce((sum, p) => sum + p.interestDue, 0);
    const totalObligation = schedule.reduce(
      (sum, p) => sum + p.totalPaymentDue,
      0,
    );
    const firstMonthDue = schedule[0]?.totalPaymentDue || 0;
    const monthlyAverage =
      schedule.length > 0 ? totalObligation / schedule.length : 0;
    return { totalInterest, totalObligation, firstMonthDue, monthlyAverage };
  }, [schedule]);

  const paidPeriodNumbers = useMemo(
    () => new Set((loan?.payments ?? []).map((p) => Number(p.periodNumber))),
    [loan?.payments],
  );

  const handleOpenPaymentModal = (period?: LoanSchedulePeriod) => {
    if (period) {
      setSelectedPeriod(period);
    } else {
      const nextPeriodNum = (loan?.payments?.length ?? 0) + 1;
      const nextScheduled = schedule.find(
        (p) => !paidPeriodNumbers.has(p.periodNumber),
      );
      setSelectedPeriod(
        nextScheduled ?? {
          periodNumber: nextPeriodNum,
          dueDate: new Date().toISOString().split("T")[0],
          beginningBalance: 0,
          principalDue: 0,
          interestDue: 0,
          totalPaymentDue: 0,
          endingBalance: 0,
        },
      );
    }
    setIsPaymentModalOpen(true);
  };

  const handleClosePaymentModal = () => {
    setIsPaymentModalOpen(false);
    setSelectedPeriod(null);
  };

  return {
    loan,
    isLoading: query.isLoading,
    error: query.error,
    schedule,
    kpiSummary,
    paidPeriodNumbers,
    selectedPeriod,
    activeTab,
    setActiveTab,
    isPaymentModalOpen,
    handleOpenPaymentModal,
    handleClosePaymentModal,
  };
}
