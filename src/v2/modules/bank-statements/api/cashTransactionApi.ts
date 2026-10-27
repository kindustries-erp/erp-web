import { v2HttpClient } from "@/v2/shared/api/v2HttpClient";
import type {
  CashTransactionDto,
  CashTransactionPostRequestDto,
  CashTransactionUpdateDto,
} from "./dtos/cashTransaction.dto";
import type { TraceabilityGraphData } from "@/v2/shared/components/organisms/v2-document-traceability/types/traceability.type";

const BASE = "/api/v1/bank-transactions-core";

export interface CashTransactionListQuery {
  page?: number;
  pageSize?: number;
  sourceType?: "BANK" | "CASH";
  correspondentAccount?: string;
  correspondentName?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
  column_search?: string;
  column_filters?: string;
}

export interface CashTransactionListResponse {
  items: CashTransactionDto[];
  total: number;
}

export interface CashTransactionLinkResponse {
  message: string;
}

/** Hợp đồng HTTP của chi tiết sao kê tiền mặt (V2 không import axios V1) */
export const cashTransactionApi = {
  getTransaction: async (id: string): Promise<CashTransactionDto> => {
    const { data } = await v2HttpClient.get<CashTransactionDto>(
      `${BASE}/transactions/${id}`,
    );
    return data;
  },

  updateTransaction: async (
    id: string,
    payload: CashTransactionUpdateDto,
  ): Promise<CashTransactionDto> => {
    const { data } = await v2HttpClient.patch<CashTransactionDto>(
      `${BASE}/transactions/${id}`,
      payload,
    );
    return data;
  },

  postTransaction: async (
    id: string,
    payload: CashTransactionPostRequestDto,
  ): Promise<CashTransactionDto> => {
    const { data } = await v2HttpClient.post<CashTransactionDto>(
      `${BASE}/transactions/${id}/post`,
      payload,
    );
    return data;
  },

  unpostTransaction: async (id: string): Promise<CashTransactionDto> => {
    const { data } = await v2HttpClient.post<CashTransactionDto>(
      `${BASE}/transactions/${id}/unpost`,
    );
    return data;
  },

  /** Danh sách giao dịch của một đối tác (dùng cho bảng kê đối tác và đếm badge) */
  listTransactions: async (
    query: CashTransactionListQuery,
  ): Promise<CashTransactionListResponse> => {
    const { data } = await v2HttpClient.get<CashTransactionListResponse>(
      `${BASE}/transactions`,
      { params: query },
    );
    return data;
  },

  getTraceabilityGraph: async (id: string): Promise<TraceabilityGraphData> => {
    const { data } = await v2HttpClient.get<TraceabilityGraphData>(
      `${BASE}/transactions/${id}/traceability-graph`,
    );
    return data;
  },

  linkInvoice: async (
    id: string,
    payload: { invoiceId: string; netOffAmount?: number },
  ): Promise<CashTransactionLinkResponse> => {
    const { data } = await v2HttpClient.post<CashTransactionLinkResponse>(
      `${BASE}/transactions/${id}/net-off-invoices`,
      payload,
    );
    return data;
  },

  removeInvoice: async (
    id: string,
    netOffId: string,
  ): Promise<CashTransactionLinkResponse> => {
    const { data } = await v2HttpClient.delete<CashTransactionLinkResponse>(
      `${BASE}/transactions/${id}/net-off-invoices/${netOffId}`,
    );
    return data;
  },
};
