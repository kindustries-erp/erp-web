import axiosInstance from "@/core/api/axiosInstance";

export interface GarageCashflowBankTxnSummary {
  id: string;
  bankAccount?: string;
  transDate?: string;
  amount: number;
  description?: string;
  correspondentName?: string;
}

export interface GarageCashflowCaseSummary {
  id: string;
  soChungTu: string;
  bienSoXe?: string;
  tenKhachHang?: string;
  tienCoThue: number;
  tienDaThanhToan: number;
  tienConPhaiThanhToan: number;
}

export interface GarageCashflowItem {
  id: string;
  transDate?: string;
  settlementType: "RECEIPT" | "PAYMENT";
  sourceChannel: "ON_SYSTEM" | "OFF_SYSTEM_MANUAL";
  paymentMethod: "BANK_TRANSFER" | "CASH" | "POS" | "OTHER";
  amount: number;
  partnerName?: string;
  payerType?: "KH" | "BH" | "SUPPLIER" | "OTHER";
  receiptNumber?: string;
  category?: string;
  note?: string;
  caseId?: string;
  caseCode?: string;
  licensePlate?: string;
  bankTransactionId?: string;
  bankTransaction?: GarageCashflowBankTxnSummary;
  caseSummary?: GarageCashflowCaseSummary;
  createdAt: string;
  updatedAt: string;
}

export interface GarageCashflowStats {
  totalReceipts: number;
  totalPayments: number;
  netCashflow: number;
  totalTransactions: number;
  linkedCasesCount: number;
}

export interface GarageCashflowListResponse {
  items: GarageCashflowItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  stats: GarageCashflowStats;
}

const BASE = "/api/v1/greenway/cashflow";

export interface GarageCashflowQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  settlementType?: "RECEIPT" | "PAYMENT";
  paymentMethod?: "BANK_TRANSFER" | "CASH" | "POS" | "OTHER";
  caseCode?: string;
  licensePlate?: string;
  partnerName?: string;
  dateFrom?: string;
  dateTo?: string;
  sortField?: string;
  sortOrder?: "ASC" | "DESC";
  filtersStr?: string;
  sorts?: string | string[];
  statusTab?: string;
}

export interface CreateGarageCashflowPayload {
  settlementType: "RECEIPT" | "PAYMENT";
  paymentMethod?: "BANK_TRANSFER" | "CASH" | "POS" | "OTHER";
  amount: number;
  transDate: string;
  partnerName?: string;
  payerType?: "KH" | "BH" | "SUPPLIER" | "OTHER";
  caseId?: string;
  bankTransactionId?: string;
  receiptNumber?: string;
  category?: string;
  note?: string;
}

export interface UpdateGarageCashflowPayload {
  settlementType?: "RECEIPT" | "PAYMENT";
  paymentMethod?: "BANK_TRANSFER" | "CASH" | "POS" | "OTHER";
  amount?: number;
  transDate?: string;
  partnerName?: string;
  payerType?: "KH" | "BH" | "SUPPLIER" | "OTHER";
  caseId?: string;
  bankTransactionId?: string;
  receiptNumber?: string;
  category?: string;
  note?: string;
}

export const garageCashflowApi = {
  getCashflow: async (
    params?: GarageCashflowQueryParams,
  ): Promise<GarageCashflowListResponse> => {
    const res = await axiosInstance.get<GarageCashflowListResponse>(BASE, {
      params,
    });
    return res.data;
  },

  getColumnOptions: async (params?: {
    column?: string;
    columnKey?: string;
    search?: string;
    page?: number;
    pageSize?: number;
    filtersStr?: string;
    statusTab?: string;
  }) => {
    const res = await axiosInstance.get<any>(`${BASE}/column-options`, {
      params,
    });
    return res.data;
  },

  createCashflow: async (
    payload: CreateGarageCashflowPayload,
  ): Promise<GarageCashflowItem> => {
    const res = await axiosInstance.post<GarageCashflowItem>(BASE, payload);
    return res.data;
  },

  updateCashflow: async (
    id: string,
    payload: UpdateGarageCashflowPayload,
  ): Promise<GarageCashflowItem> => {
    const res = await axiosInstance.patch<GarageCashflowItem>(
      `${BASE}/${id}`,
      payload,
    );
    return res.data;
  },

  deleteCashflow: async (id: string): Promise<{ success: boolean }> => {
    const res = await axiosInstance.delete<{ success: boolean }>(
      `${BASE}/${id}`,
    );
    return res.data;
  },
};
