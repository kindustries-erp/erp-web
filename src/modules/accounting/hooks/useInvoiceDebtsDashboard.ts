import { useQuery } from "@tanstack/react-query";
import {
  invoiceDashboardApi,
  type InvoiceDebtsAnalyticsResponse,
  type InvoiceDebtsAnalyticsSummary,
  type InvoiceAgingComparisonItem,
  type InvoiceTimeHorizons,
  type InvoiceCashTrendItem,
  type TopDebtPartnerItem,
} from "../api/invoiceDashboardApi";

export interface UseInvoiceDebtsDashboardParams {
  dateFrom?: string;
  dateTo?: string;
}

export interface UseInvoiceDebtsDashboardReturn {
  analytics?: InvoiceDebtsAnalyticsResponse;
  summary?: InvoiceDebtsAnalyticsSummary;
  agingComparison: InvoiceAgingComparisonItem[];
  timeHorizons?: InvoiceTimeHorizons;
  forecastHorizons?: import("../api/invoiceDashboardApi").ForecastHorizonsData;
  cashTrend: (InvoiceCashTrendItem & { netCash: number })[];
  topReceivableCustomers: TopDebtPartnerItem[];
  topPayableSuppliers: TopDebtPartnerItem[];
  isLoading: boolean;
  isFetching: boolean;
  refetch: () => Promise<void>;
}

export function useInvoiceDebtsDashboard({
  dateFrom,
  dateTo,
}: UseInvoiceDebtsDashboardParams = {}): UseInvoiceDebtsDashboardReturn {
  const analyticsQuery = useQuery({
    queryKey: ["invoice-debts-analytics", dateFrom, dateTo],
    queryFn: () =>
      invoiceDashboardApi.getDebtsAnalytics({
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined,
      }),
    staleTime: 30000,
  });

  const refetch = async () => {
    await analyticsQuery.refetch();
  };

  const data = analyticsQuery.data;

  return {
    analytics: data,
    summary: data?.summary,
    agingComparison: data?.agingComparison || [],
    timeHorizons: data?.timeHorizons,
    forecastHorizons: data?.forecastHorizons,
    cashTrend: data?.cashTrend || [],
    topReceivableCustomers: data?.topReceivableCustomers || [],
    topPayableSuppliers: data?.topPayableSuppliers || [],
    isLoading: analyticsQuery.isLoading,
    isFetching: analyticsQuery.isFetching,
    refetch,
  };
}
