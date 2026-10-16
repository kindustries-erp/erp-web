import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  garageDashboardApi,
  type MonthlyReceivablesBreakdownResponse,
  type MonthlyReceivablesSummary,
  type MonthlyReceivablesGroupItem,
  type MonthlyReceivablesGroupCategorized,
  type ReceivablesVatWarningSummary,
  type GarageTrendItem,
} from "../api/garageDashboardApi";

export interface UseGarageMonthReceivablesBreakdownParams {
  month?: string;
  horizon?: string;
  branchId?: string;
  dateFrom?: string;
  dateTo?: string;
  enabled?: boolean;
}

const EMPTY_CATEGORIZED: MonthlyReceivablesGroupCategorized = {
  all: [],
  withInvoice: [],
  pendingInvoice: [],
  noInvoice: [],
  totals: {
    billed: 0,
    paid: 0,
    remaining: 0,
    caseCount: 0,
    partnerCount: 0,
  },
};

export interface UseGarageMonthReceivablesBreakdownReturn {
  breakdown?: MonthlyReceivablesBreakdownResponse;
  trendItem?: GarageTrendItem;
  summary?: MonthlyReceivablesSummary;
  insuranceCompanies: MonthlyReceivablesGroupItem[];
  customerPartners: MonthlyReceivablesGroupItem[];
  allGroups: MonthlyReceivablesGroupItem[];
  categorized?: {
    insurance: MonthlyReceivablesGroupCategorized;
    enterprise: MonthlyReceivablesGroupCategorized;
    individual: MonthlyReceivablesGroupCategorized;
  };
  insuranceCategorized: MonthlyReceivablesGroupCategorized;
  enterpriseCategorized: MonthlyReceivablesGroupCategorized;
  individualCategorized: MonthlyReceivablesGroupCategorized;
  warning?: ReceivablesVatWarningSummary;
  isLoading: boolean;
  isFetching: boolean;
  refetch: () => Promise<void>;
}

export function useGarageMonthReceivablesBreakdown({
  month,
  horizon,
  branchId,
  dateFrom,
  dateTo,
  enabled = true,
}: UseGarageMonthReceivablesBreakdownParams = {}): UseGarageMonthReceivablesBreakdownReturn {
  const query = useQuery({
    queryKey: [
      "garage-monthly-receivables-breakdown",
      month,
      horizon,
      branchId,
      dateFrom,
      dateTo,
    ],
    queryFn: () =>
      garageDashboardApi.getMonthlyReceivablesBreakdown({
        month: month || undefined,
        horizon: horizon || undefined,
        branch_id: branchId || undefined,
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined,
      }),
    enabled: Boolean(month || horizon) && enabled,
    staleTime: 30000,
  });

  const refetch = async () => {
    await query.refetch();
  };

  const data = query.data;

  const insuranceCategorized = useMemo(
    () => data?.categorized?.insurance ?? EMPTY_CATEGORIZED,
    [data?.categorized?.insurance],
  );

  const enterpriseCategorized = useMemo(
    () => data?.categorized?.enterprise ?? EMPTY_CATEGORIZED,
    [data?.categorized?.enterprise],
  );

  const individualCategorized = useMemo(
    () => data?.categorized?.individual ?? EMPTY_CATEGORIZED,
    [data?.categorized?.individual],
  );

  return {
    breakdown: data,
    trendItem: data?.trendItem,
    summary: data?.summary,
    insuranceCompanies: data?.insuranceCompanies || [],
    customerPartners: data?.customerPartners || [],
    allGroups: data?.allGroups || [],
    categorized: data?.categorized,
    insuranceCategorized,
    enterpriseCategorized,
    individualCategorized,
    warning: data?.summary?.warning,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    refetch,
  };
}
