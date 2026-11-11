export interface LoanChartItem {
  periodNumber?: number;
  monthKey?: string;
  dueDate?: string;
  principalDue: number;
  interestDue: number;
  endingBalance?: number;
  remainingPrincipal?: number;
}

export interface LoanCashflowChartProps {
  schedule: LoanChartItem[];
  title?: string;
  className?: string;
  height?: number;
}
