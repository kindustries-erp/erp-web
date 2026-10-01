import type { GarageDebtsAnalyticsSummary } from "@/modules/garage/api/garageDebtsAnalyticsApi";

export interface GarageDebtsKpiGridProps {
  summary?: GarageDebtsAnalyticsSummary;
  isLoading?: boolean;
}
