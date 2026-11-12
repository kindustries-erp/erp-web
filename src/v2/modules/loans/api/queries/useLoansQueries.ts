import * as React from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type { V2ModuleListData } from "@/v2/shared/components";
import { loansApi, LoansQueryParams } from "../loansApi";
import { loansKeys } from "./loansKeys";
import {
  CashflowProjectionResponse,
  LoanListResponse,
} from "../dtos/loan-api.types";
import { LoanItem } from "@/v2/core/loans";

export function useLoansListQuery(params?: LoansQueryParams) {
  return useQuery<LoanListResponse>({
    queryKey: loansKeys.list(params),
    queryFn: () => loansApi.list(params),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}

/** Kết nối `useLoansListQuery` với `V2ModuleListTab`, trích xuất `pagination.total` và `summaries`. */
export function useLoansTableData(
  params: LoansQueryParams,
  onError?: (error: unknown) => void,
): V2ModuleListData<LoanItem> {
  const result = useLoansListQuery(params);

  React.useEffect(() => {
    if (result.error) onError?.(result.error);
  }, [result.error, onError]);

  return {
    items: result.data?.items ?? [],
    total: result.data?.pagination?.total ?? 0,
    summaries: result.data?.summaries,
    loading: result.isFetching,
    refetch: () => void result.refetch(),
  };
}

export function useLoanDetailQuery(id: string | null) {
  return useQuery<LoanItem>({
    queryKey: loansKeys.detail(id || ""),
    queryFn: () => loansApi.getById(id!),
    enabled: Boolean(id),
    staleTime: 30_000,
  });
}

export function useCashflowProjectionQuery() {
  return useQuery<CashflowProjectionResponse>({
    queryKey: loansKeys.cashflow(),
    queryFn: () => loansApi.getCashflow(),
    staleTime: 60_000,
  });
}
