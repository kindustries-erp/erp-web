import { keepPreviousData, useQuery } from "@tanstack/react-query";
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
