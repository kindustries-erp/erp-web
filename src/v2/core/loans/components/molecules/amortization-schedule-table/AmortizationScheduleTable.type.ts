import { LoanSchedulePeriod } from "../../../domain/types/loan.types";

export interface AmortizationScheduleTableProps {
  schedule: LoanSchedulePeriod[];
  className?: string;
  showExportButton?: boolean;
}
