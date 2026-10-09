import axiosInstance from "@/core/api/axiosInstance";

export interface GarageCashflowVoucher {
  id: string;
  voucher_code: string;
  voucher_type: "RECEIPT" | "PAYMENT";
  partner_name?: string;
  partner_phone?: string;
  description?: string;
  amount: number;
  payment_method?: string;
  reference_number?: string;
  case_id?: string;
  erp_bank_transaction_id?: string;
  erp_cash_transaction_id?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateGarageCashflowVoucherDto {
  voucher_type: "RECEIPT" | "PAYMENT";
  amount: number;
  partner_name?: string;
  partner_phone?: string;
  description?: string;
  payment_method?: string;
  reference_number?: string;
  case_id?: string;
  erp_bank_transaction_id?: string;
  erp_cash_transaction_id?: string;
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
};
