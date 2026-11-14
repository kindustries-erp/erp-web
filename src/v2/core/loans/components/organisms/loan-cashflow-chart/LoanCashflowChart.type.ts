export interface LoanChartBreakdownItem {
  loanId: string;
  loanName: string;
  principalDue: number;
  interestDue: number;
  totalPayment: number;
  /** Số theo lịch gốc (không bị 0 hóa khi đã trả) */
  scheduledTotal?: number;
  /** Số thực tế đã trả của kỳ này (chỉ có ở projection) */
  actualTotalPaid?: number;
  isPaid?: boolean;
}

export interface LoanChartItem {
  periodNumber?: number;
  monthKey?: string;
  month?: string;
  dueDate?: string;
  principalDue: number;
  interestDue: number;
  endingBalance?: number;
  remainingPrincipal?: number;
  cumulativeRemainingPrincipal?: number;
  isPaid?: boolean;
  breakdown?: LoanChartBreakdownItem[];
}

export interface LoanCashflowChartProps {
  schedule: LoanChartItem[];
  title?: string;
  subtitle?: string;
  className?: string;
  height?: number;
}
