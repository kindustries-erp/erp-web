import type {
  GarageCashTrendItem,
  GarageAgingComparisonItem,
} from "@/modules/garage/api/garageDebtsAnalyticsApi";

export interface GarageDebtsAnalyticsChartsProps {
  cashTrend: GarageCashTrendItem[];
  agingComparison: GarageAgingComparisonItem[];
  isLoading?: boolean;
}
