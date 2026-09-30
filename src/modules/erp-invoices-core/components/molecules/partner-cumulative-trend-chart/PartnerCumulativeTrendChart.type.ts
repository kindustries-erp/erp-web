export interface CumulativeTrendDataset {
  label: string;
  data: number[];
  color: string;
  fill?: boolean;
  borderDash?: number[];
}

export interface PartnerCumulativeTrendChartProps {
  labels: string[];
  datasets: CumulativeTrendDataset[];
  className?: string;
}
