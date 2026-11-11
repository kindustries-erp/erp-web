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
}

export interface LoanCashflowChartProps {
  schedule: LoanChartItem[];
  title?: string;
  subtitle?: string;
  className?: string;
  height?: number;
}
