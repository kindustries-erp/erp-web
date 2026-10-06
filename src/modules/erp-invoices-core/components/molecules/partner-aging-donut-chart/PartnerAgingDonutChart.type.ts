export interface AgingDonutItem {
  id: string;
  label: string;
  value: number;
  color: string;
}

export interface PartnerAgingDonutChartProps {
  items: AgingDonutItem[];
  totalBalance: number;
  className?: string;
}
