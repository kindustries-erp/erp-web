import { useState, useMemo } from "react";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { useV2ToastStore } from "@/v2/shared/stores/useV2ToastStore";
import { useDeletePaymentMutation, useLoanDetailQuery } from "../../api";
import {
  generateAmortizationSchedule,
  recalculateAmortizationSchedule,
  type LoanPaymentRecord,
  type LoanSchedulePeriod,
} from "@/v2/core/loans";
import type { LoanDetailDrawerProps } from "./LoanDetailDrawer.type";

export function useLoanDetailDrawer(props: LoanDetailDrawerProps) {
  const { loanId, open } = props;
  const { t } = useV2Translation();
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState<boolean>(false);
  const [paymentModalMode, setPaymentModalMode] = useState<"create" | "edit">(
    "create",
  );
  const [editingPayment, setEditingPayment] =
    useState<LoanPaymentRecord | null>(null);
  const [deletePaymentTarget, setDeletePaymentTarget] =
    useState<LoanPaymentRecord | null>(null);
  const [selectedPeriod, setSelectedPeriod] =
    useState<LoanSchedulePeriod | null>(null);

  const query = useLoanDetailQuery(open && loanId ? loanId : null);
  const deletePaymentMutation = useDeletePaymentMutation();
  const loan = query.data;

  const contractSchedule = useMemo<LoanSchedulePeriod[]>(() => {
    if (!loan) return [];
    return generateAmortizationSchedule({
      principalAmount: Number(loan.principalAmount),
      annualInterestRate: Number(loan.annualInterestRate),
      tenorMonths: Number(loan.tenorMonths),
      amortizationMethod: loan.amortizationMethod,
      startDate: loan.startDate,
      firstPaymentDate: loan.firstPaymentDate,
    }).schedule;
  }, [loan]);

  const schedule = useMemo<LoanSchedulePeriod[]>(() => {
    if (!loan) return [];
    const payments = loan.payments ?? [];
    if (payments.length === 0) return contractSchedule;
    return recalculateAmortizationSchedule({
      principalAmount: Number(loan.principalAmount),
      annualInterestRate: Number(loan.annualInterestRate),
      tenorMonths: Number(loan.tenorMonths),
      amortizationMethod: loan.amortizationMethod,
      startDate: loan.startDate,
      firstPaymentDate: loan.firstPaymentDate,
      remainingPrincipal: Number(
        loan.remainingPrincipal ?? loan.principalAmount,
      ),
      payments: payments.map((p) => ({
        periodNumber: Number(p.periodNumber),
        paymentDate: p.paymentDate,
        principalPaid: Number(p.principalPaid || 0),
        interestPaid: Number(p.interestPaid || 0),
        totalPaid: Number(p.totalPaid || 0),
        paymentRef: p.paymentRef,
      })),
    }).schedule;
  }, [loan, contractSchedule]);

  const paidPeriodNumbers = useMemo(
    () => new Set((loan?.payments ?? []).map((p) => Number(p.periodNumber))),
    [loan?.payments],
  );

  const kpiSummary = useMemo(() => {
    const totalPaidPrincipal = Number(loan?.totalPaidPrincipal || 0);
    const totalPaidInterest = Number(loan?.totalPaidInterest || 0);
    const remainingPrincipal = Number(loan?.remainingPrincipal || 0);
    const principalAmount = Number(loan?.principalAmount || 0);
    const futurePeriods = schedule.filter((p) => !p.isPaid);
    const remainingInterestDue = futurePeriods.reduce(
      (s, p) => s + p.interestDue,
      0,
    );
    const remainingTotalObligation = remainingPrincipal + remainingInterestDue;
    const nextPeriod = futurePeriods.find((p) => p.totalPaymentDue > 0);
    const firstMonthDue = schedule[0]?.totalPaymentDue || 0;
    const totalObligation = schedule.reduce((s, p) => s + p.totalPaymentDue, 0);
    const totalInterest = schedule.reduce((s, p) => s + p.interestDue, 0);
    const monthlyAverage =
      schedule.length > 0 ? totalObligation / schedule.length : 0;

    return {
      principalAmount,
      remainingPrincipal,
      totalPaidPrincipal,
      totalPaidInterest,
      remainingInterestDue,
      remainingTotalObligation,
      nextPaymentDue: nextPeriod?.totalPaymentDue ?? 0,
      nextPaymentDate: nextPeriod?.dueDate,
      firstMonthDue,
      monthlyAverage,
      totalInterest,
      totalObligation,
    };
  }, [loan, schedule]);

  const handleOpenPaymentModal = (period?: LoanSchedulePeriod) => {
    setPaymentModalMode("create");
    setEditingPayment(null);
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

  const handleEditPayment = (p: LoanPaymentRecord) => {
    setPaymentModalMode("edit");
    setEditingPayment(p);
    setSelectedPeriod(null);
    setIsPaymentModalOpen(true);
  };

  const handleConfirmDeletePayment = async () => {
    if (!loanId || !deletePaymentTarget) return;
    try {
      await deletePaymentMutation.mutateAsync({
        loanId,
        paymentId: deletePaymentTarget.id,
      });
      useV2ToastStore.getState().showToast({
        variant: "success",
        title: t("v2.loans.deletePayment.success", "Đã xóa bản ghi thanh toán"),
      });
    } catch (err: unknown) {
      useV2ToastStore.getState().showToast({
        variant: "destructive",
        title: t(
          "v2.loans.deletePayment.error",
          "Không thể xóa bản ghi thanh toán",
        ),
        description: err instanceof Error ? err.message : undefined,
      });
    } finally {
      setDeletePaymentTarget(null);
    }
  };

  const handleClosePaymentModal = () => {
    setIsPaymentModalOpen(false);
    setEditingPayment(null);
    setSelectedPeriod(null);
    setPaymentModalMode("create");
  };

  return {
    loan,
    isLoading: query.isLoading,
    error: query.error,
    schedule,
    contractSchedule,
    kpiSummary,
    paidPeriodNumbers,
    selectedPeriod,
    activeTab,
    setActiveTab,
    isPaymentModalOpen,
    paymentModalMode,
    editingPayment,
    deletePaymentTarget,
    isDeletingPayment: deletePaymentMutation.isPending,
    handleOpenPaymentModal,
    handleEditPayment,
    handleRequestDeletePayment: (p: LoanPaymentRecord) =>
      setDeletePaymentTarget(p),
    handleConfirmDeletePayment,
    handleCancelDeletePayment: () => setDeletePaymentTarget(null),
    handleClosePaymentModal,
  };
}
