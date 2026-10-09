import axiosInstance from "@/core/api/axiosInstance";

export interface GarageCashflowVoucher {
  id: string;
  voucherCode: string;
  voucherType: "RECEIPT" | "PAYMENT";
  partnerName?: string;
  partnerPhone?: string;
  note?: string;
  amount: number;
  paymentMethod?: string;
  referenceNumber?: string;
  caseId?: string;
  erpBankTransactionId?: string;
  erpCashVoucherId?: string; // backend is erpCashVoucherId not erp_cash_transaction_id
  createdAt: string;
  updatedAt: string;
  transDate: string;
  case?: {
    id: string;
    khachHangName: string;
    khachHangCode?: string;
    soChungTu?: string;
  };
  erpBankTransaction?: {
    id: string;
    transactionCode: string;
  };
}

export interface CreateGarageCashflowVoucherDto {
  voucherType: "RECEIPT" | "PAYMENT";
  amount: number;
  partnerName?: string;
  partnerPhone?: string;
  note?: string;
  paymentMethod?: string;
  referenceNumber?: string;
  caseId?: string;
  erpBankTransactionId?: string;
  erpCashVoucherId?: string;
  transDate?: string;
}

export type UpdateGarageCashflowVoucherDto =
  Partial<CreateGarageCashflowVoucherDto>;

export const garageCashflowApi = {
  getList: async (params?: Record<string, any>) => {
    const res = await axiosInstance.get("/api/v1/greenway/cashflow-vouchers", {
      params,
    });
    return res.data;
  },
  getDashboard: async () => {
    const res = await axiosInstance.get(
      "/api/v1/greenway/cashflow-vouchers/dashboard",
    );
    return res.data;
  },
  create: async (data: CreateGarageCashflowVoucherDto) => {
    const res = await axiosInstance.post(
      "/api/v1/greenway/cashflow-vouchers",
      data,
    );
    return res.data;
  },
  update: async (id: string, data: UpdateGarageCashflowVoucherDto) => {
    const res = await axiosInstance.put(
      `/api/v1/greenway/cashflow-vouchers/${id}`,
      data,
    );
    return res.data;
  },
  delete: async (id: string) => {
    const res = await axiosInstance.delete(
      `/api/v1/greenway/cashflow-vouchers/${id}`,
    );
    return res.data;
  },
  getOptions: async (
    column: string,
    search: string,
    page: number,
    pageSize: number,
    columnFilters?: string,
  ) => {
    const res = await axiosInstance.get(
      "/api/v1/greenway/cashflow-vouchers/column-options",
      {
        params: {
          column,
          search,
          page,
          pageSize,
          column_filters: columnFilters,
        },
      },
    );
    return res.data;
  },
};
