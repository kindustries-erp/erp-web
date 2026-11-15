export interface LoanChartBreakdownItem {
  loanId: string;
  loanName: string;
  dueDate?: string;
  principalDue: number;
  interestDue: number;
  totalPayment: number;
  endingBalance?: number | null;
  /** Số theo lịch gốc (không bị 0 hóa khi đã trả) */
  scheduledPrincipal?: number | null;
  scheduledInterest?: number | null;
  scheduledTotal?: number | null;
  /** Số thực tế đã trả của kỳ này */
  actualPrincipalPaid?: number | null;
  actualInterestPaid?: number | null;
  actualTotalPaid?: number | null;
  isPaid?: boolean;
}

export interface LoanChartItem {
  periodNumber?: number;
  monthKey?: string;
  month?: string;
  dueDate?: string;
  principalDue: number;
  interestDue: number;
  totalPaymentDue?: number;
  endingBalance?: number | null;
  remainingPrincipal?: number | null;
  cumulativeRemainingPrincipal?: number | null;
  scheduledPrincipalDue?: number | null;
  scheduledInterestDue?: number | null;
  scheduledTotalDue?: number | null;
  actualPrincipalPaid?: number | null;
  actualInterestPaid?: number | null;
  actualTotalPaid?: number | null;
  isPaid?: boolean;
  breakdown?: LoanChartBreakdownItem[];
}

export interface LoanCashflowChartProps {
  schedule: LoanChartItem[];
  title?: string;
  subtitle?: string;
  className?: string;
  height?: number;
  onRecordPayment?: (
    loanId: string,
    loanName: string,
    periodNumber?: number,
    dueDate?: string,
    principalDue?: number,
    interestDue?: number,
  ) => void;
}
