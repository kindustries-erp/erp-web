import { v2HttpClient } from "@/v2/shared/api/v2HttpClient";
import type {
  V2FetchOptionsParams,
  V2FetchOptionsResult,
  V2TableQuery,
} from "@/v2/shared/types/v2-table";
import { toSummaryKeysParam } from "@/v2/shared/utils/toSummaryKeysParam";
import {
  BatchCreateLoansPayload,
  CashflowProjectionResponse,
  CreateLoanPayload,
  LoanListResponse,
  RecordPaymentPayload,
  UpdateLoanPayload,
} from "./dtos/loan-api.types";
import {
  LoanItem,
  LoanSimulationInput,
  LoanSimulationResult,
} from "@/v2/core/loans";

const BASE_URL = "/api/v2/loans";
const PUBLIC_SIMULATE_URL = "/api/v2/public/loans/simulate";

export interface LoansListFilter {
  status?: string;
  lenderName?: string;
  deleted?: "only";
}

export type LoansQueryParams = Partial<V2TableQuery> & LoansListFilter;

export type LoansFetchOptionsParams = V2FetchOptionsParams &
  Pick<LoansListFilter, "deleted">;

/** Chuyển query bảng V2 của loans thành params gửi lên API. */
export const toLoansListParams = (query: LoansQueryParams = {}) => ({
  page: query.page,
  pageSize: query.pageSize,
  status: query.status || undefined,
  lenderName: query.lenderName?.trim() || undefined,
  deleted: query.deleted,
  search: query.search?.trim() || undefined,
  sort: query.sorts?.length
    ? query.sorts
        .map((s) => (s.direction === "desc" ? `-${s.columnKey}` : s.columnKey))
        .join(",")
    : undefined,
  column_filters:
    query.columnFilters && Object.keys(query.columnFilters).length
      ? JSON.stringify(query.columnFilters)
      : undefined,
  column_search:
    query.columnSearch && Object.keys(query.columnSearch).length
      ? JSON.stringify(query.columnSearch)
      : undefined,
  column_operators:
    query.columnOperators && Object.keys(query.columnOperators).length
      ? JSON.stringify(query.columnOperators)
      : undefined,
  date_ranges:
    query.dateRanges && Object.keys(query.dateRanges).length
      ? JSON.stringify(query.dateRanges)
      : undefined,
  summary_keys: toSummaryKeysParam({ summaryKeys: query.summaryKeys }),
});

export const loansApi = {
  list: async (params?: LoansQueryParams): Promise<LoanListResponse> => {
    const { data } = await v2HttpClient.get<LoanListResponse>(BASE_URL, {
      params: toLoansListParams(params),
    });
    return data;
  },

  options: async (
    params: LoansFetchOptionsParams,
  ): Promise<V2FetchOptionsResult> => {
    const { data } = await v2HttpClient.get<V2FetchOptionsResult>(
      `${BASE_URL}/column-options`,
      {
        params: {
          column: params.columnKey,
          search: params.search,
          page: params.pageParam,
          pageSize: 20,
          filters: params.filtersStr,
          deleted: params.deleted,
        },
      },
    );
    return data;
  },

  getById: async (id: string): Promise<LoanItem> => {
    const { data } = await v2HttpClient.get<LoanItem>(`${BASE_URL}/${id}`);
    return data;
  },

  getCashflow: async (): Promise<CashflowProjectionResponse> => {
    const { data } = await v2HttpClient.get<CashflowProjectionResponse>(
      `${BASE_URL}/cashflow/projection`,
    );
    return data;
  },

  create: async (payload: CreateLoanPayload): Promise<LoanItem> => {
    const { data } = await v2HttpClient.post<LoanItem>(BASE_URL, payload);
    return data;
  },

  createBatch: async (
    payload: BatchCreateLoansPayload,
  ): Promise<LoanItem[]> => {
    const { data } = await v2HttpClient.post<LoanItem[]>(
      `${BASE_URL}/batch`,
      payload,
    );
    return data;
  },

  update: async (id: string, payload: UpdateLoanPayload): Promise<LoanItem> => {
    const { data } = await v2HttpClient.patch<LoanItem>(
      `${BASE_URL}/${id}`,
      payload,
    );
    return data;
  },

  remove: async (id: string): Promise<void> => {
    await v2HttpClient.delete(`${BASE_URL}/${id}`);
  },

  purge: async (id: string): Promise<{ id: string }> => {
    const { data } = await v2HttpClient.delete<{ id: string }>(
      `${BASE_URL}/${id}/permanent`,
    );
    return data;
  },

  recordPayment: async (
    loanId: string,
    payload: RecordPaymentPayload,
  ): Promise<LoanItem> => {
    const { data } = await v2HttpClient.post<LoanItem>(
      `${BASE_URL}/${loanId}/payments`,
      payload,
    );
    return data;
  },

  simulate: async (
    input: LoanSimulationInput,
  ): Promise<LoanSimulationResult> => {
    const { data } = await v2HttpClient.post<LoanSimulationResult>(
      PUBLIC_SIMULATE_URL,
      input,
    );
    return data;
  },
};
