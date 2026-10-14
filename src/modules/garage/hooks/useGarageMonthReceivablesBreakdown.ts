import { useQuery } from "@tanstack/react-query";
import {
  garageDashboardApi,
  type MonthlyReceivablesBreakdownResponse,
  type MonthlyReceivablesSummary,
  type MonthlyReceivablesGroupItem,
  type ReceivablesVatWarningSummary,
} from "../api/garageDashboardApi";

export interface UseGarageMonthReceivablesBreakdownParams {
  month?: string;
  branchId?: string;
  enabled?: boolean;
}

export interface UseGarageMonthReceivablesBreakdownReturn {
  breakdown?: MonthlyReceivablesBreakdownResponse;
  summary?: MonthlyReceivablesSummary;
  insuranceCompanies: MonthlyReceivablesGroupItem[];
  customerPartners: MonthlyReceivablesGroupItem[];
  allGroups: MonthlyReceivablesGroupItem[];
  warning?: ReceivablesVatWarningSummary;
  isLoading: boolean;
  isFetching: boolean;
  refetch: () => Promise<void>;
}

export function useGarageMonthReceivablesBreakdown({
  month,
  branchId,
  enabled = true,
}: UseGarageMonthReceivablesBreakdownParams = {}): UseGarageMonthReceivablesBreakdownReturn {
  const query = useQuery({
    queryKey: ["garage-monthly-receivables-breakdown", month, branchId],
    queryFn: () =>
      garageDashboardApi.getMonthlyReceivablesBreakdown({
        month: month || "",
        branch_id: branchId || undefined,
      }),
    enabled: Boolean(month) && enabled,
    staleTime: 30000,
  });

  const refetch = async () => {
    await query.refetch();
  };

  const data = query.data;

  return {
    breakdown: data,
    summary: data?.summary,
    insuranceCompanies: data?.insuranceCompanies || [],
    customerPartners: data?.customerPartners || [],
    allGroups: data?.allGroups || [],
    warning: data?.summary?.warning,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    refetch,
  };
}
