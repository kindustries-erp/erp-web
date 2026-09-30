export interface MonthlyDebtChartDataset {
  label: string;
  data: number[];
  color: string;
}

export interface PartnerMonthlyDebtChartProps {
  labels: string[];
  datasets: MonthlyDebtChartDataset[];
  isLoading?: boolean;
  className?: string;
}
