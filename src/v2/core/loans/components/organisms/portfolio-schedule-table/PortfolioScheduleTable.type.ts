import { PortfolioMonthlyPeriod } from "../../../domain/types/loan.types";

export interface PortfolioScheduleTableProps {
  schedule: PortfolioMonthlyPeriod[];
  title?: string;
  description?: string;
  className?: string;
}
