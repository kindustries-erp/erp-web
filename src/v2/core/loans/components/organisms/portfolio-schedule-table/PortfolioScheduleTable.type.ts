import { PortfolioMonthlyPeriod } from "../../../domain/types/loan.types";

export interface PortfolioScheduleTableProps {
  schedule: PortfolioMonthlyPeriod[];
  title?: string;
  description?: string;
  className?: string;
  onRecordPayment?: (
    loanId: string,
    loanName: string,
    periodNumber?: number,
    dueDate?: string,
    principalDue?: number,
    interestDue?: number,
  ) => void;
}
