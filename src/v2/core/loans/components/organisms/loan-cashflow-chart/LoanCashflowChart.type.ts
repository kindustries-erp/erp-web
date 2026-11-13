export interface LoanChartBreakdownItem {
  loanId: string;
  loanName: string;
  principalDue: number;
  interestDue: number;
  totalPayment: number;
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
