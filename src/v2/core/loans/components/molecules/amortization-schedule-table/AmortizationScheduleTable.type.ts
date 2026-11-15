import { LoanSchedulePeriod } from "../../../domain/types/loan.types";

export interface AmortizationScheduleTableProps {
  schedule: LoanSchedulePeriod[];
  contractSchedule?: LoanSchedulePeriod[];
  className?: string;
  showExportButton?: boolean;
  paidPeriodNumbers?: Set<number>;
  onRecordPeriod?: (period: LoanSchedulePeriod) => void;
}
