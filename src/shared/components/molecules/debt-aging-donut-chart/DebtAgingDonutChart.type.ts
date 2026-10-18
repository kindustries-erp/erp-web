import type { DonutItem } from "@/shared/components/charts/DonutChart";

export type AgingDonutItem = DonutItem;

export interface DebtAgingDonutChartProps {
  items: DonutItem[];
  totalBalance: number;
  title?: string;
  className?: string;
  emptyLabel?: string;
}
