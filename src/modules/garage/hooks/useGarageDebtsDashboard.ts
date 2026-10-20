import { useQuery } from "@tanstack/react-query";
import {
  garageDebtsAnalyticsApi,
  type GarageDebtsAnalyticsResponse,
  type GarageDebtsAnalyticsSummary,
  type GarageAgingComparisonItem,
  type GarageTimeHorizonsOverview,
  type GarageForecastHorizonsOverview,
  type GarageCashTrendItem,
  type GarageTopDebtPartnerItem,
} from "../api/garageDebtsAnalyticsApi";

export interface UseGarageDebtsDashboardParams {
  dateFrom?: string;
  dateTo?: string;
  branchId?: string;
}

export interface UseGarageDebtsDashboardReturn {
  analytics?: GarageDebtsAnalyticsResponse;
  summary?: GarageDebtsAnalyticsSummary;
  agingComparison: GarageAgingComparisonItem[];
  timeHorizons?: GarageTimeHorizonsOverview;
  forecastHorizons?: GarageForecastHorizonsOverview;
  cashTrend: GarageCashTrendItem[];
  topReceivableCustomers: GarageTopDebtPartnerItem[];
  topPayableSuppliers: GarageTopDebtPartnerItem[];
  isLoading: boolean;
  isFetching: boolean;
  refetch: () => Promise<void>;
}

export function useGarageDebtsDashboard({
  dateFrom,
  dateTo,
  branchId,
}: UseGarageDebtsDashboardParams = {}): UseGarageDebtsDashboardReturn {
  const query = useQuery({
    queryKey: ["garage-debts-analytics", dateFrom, dateTo, branchId],
    queryFn: () =>
      garageDebtsAnalyticsApi.getDebtsAnalytics({
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined,
        branch_id: branchId || undefined,
      }),
    staleTime: 30000,
  });

  const refetch = async () => {
    await query.refetch();
  };

  const data = query.data;

  return {
    analytics: data,
    summary: data?.summary,
    agingComparison: data?.agingComparison || [],
    timeHorizons: data?.timeHorizons,
    forecastHorizons: data?.forecastHorizons,
    cashTrend: data?.cashTrend || [],
    topReceivableCustomers: data?.topReceivableCustomers || [],
    topPayableSuppliers: data?.topPayableSuppliers || [],
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    refetch,
  };
}
