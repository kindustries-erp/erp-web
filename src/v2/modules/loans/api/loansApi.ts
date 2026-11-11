import { v2HttpClient } from "@/v2/shared/api/v2HttpClient";
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

export interface LoansQueryParams {
  page?: number;
  pageSize?: number;
  status?: string;
  lenderName?: string;
  search?: string;
}

export const loansApi = {
  list: async (params?: LoansQueryParams): Promise<LoanListResponse> => {
    const { data } = await v2HttpClient.get<LoanListResponse>(BASE_URL, {
      params,
    });
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
