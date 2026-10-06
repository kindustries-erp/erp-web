export interface RecoveryRateDataset {
  label: string;
  data: number[];
  color: string;
}

export interface PartnerRecoveryRateChartProps {
  labels: string[];
  datasets: RecoveryRateDataset[];
  isCustomer: boolean;
  className?: string;
}
