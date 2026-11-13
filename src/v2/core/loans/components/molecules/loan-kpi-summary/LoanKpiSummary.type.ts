export interface LoanKpiSummaryProps {
  // Số liệu động sau thanh toán
  principalAmount?: number;
  remainingPrincipal?: number;
  totalPaidPrincipal?: number;
  totalPaidInterest?: number;
  remainingInterestDue?: number;
  remainingTotalObligation?: number;
  nextPaymentDue?: number;
  nextPaymentDate?: string;
  // Số liệu gốc ban đầu (khi chưa phát sinh thanh toán)
  firstMonthDue?: number;
  monthlyAverage?: number;
  totalInterest?: number;
  totalObligation?: number;
  className?: string;
}
