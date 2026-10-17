import axiosInstance from "@/core/api/axiosInstance";

export interface GarageCashflowVoucher {
  id: string;
  voucherCode: string;
  voucherType: "RECEIPT" | "PAYMENT";
  partnerName?: string;
  partnerPhone?: string;
  licensePlate?: string;
  note?: string;
  amount: number;
  paymentMethod?: string;
  paymentContent?: string;
  paymentStatus?: "PENDING" | "APPROVED" | "PAID" | null;
  referenceNumber?: string;
  caseId?: string;
  erpBankTransactionId?: string;
  erpCashVoucherId?: string; // backend is erpCashVoucherId not erp_cash_transaction_id
  createdAt: string;
  updatedAt: string;
  transDate: string;
  createdBy?: string;
  case?: {
    id: string;
    khachHangName: string;
    khachHangCode?: string;
    soChungTu?: string;
    bienSoXe?: string;
  };
  erpBankTransaction?: {
    id: string;
    referenceNumber?: string;
    seqNo?: string;
  };
  erpCashVoucher?: {
    id: string;
    referenceNumber?: string;
    seqNo?: string;
  };
}

export interface CreateGarageCashflowVoucherDto {
  voucherType: "RECEIPT" | "PAYMENT";
  amount: number;
  voucherCode?: string;
  partnerName?: string;
  partnerPhone?: string;
  licensePlate?: string;
  note?: string;
  paymentMethod?: string;
  paymentContent?: string;
  paymentStatus?: "PENDING" | "APPROVED" | "PAID";
  referenceNumber?: string;
  caseId?: string;
  erpBankTransactionId?: string;
  erpCashVoucherId?: string;
  transDate?: string;
}

export type UpdateGarageCashflowVoucherDto =
  Partial<CreateGarageCashflowVoucherDto>;

export interface CashflowDuplicateItem {
  id: string;
  voucherCode: string;
  voucherType: "RECEIPT" | "PAYMENT";
  amount: number;
  transDate: string;
  licensePlate?: string | null;
  caseCode?: string | null;
  partnerName?: string | null;
}

export interface CashflowDuplicateGroup {
  items: CashflowDuplicateItem[];
  total: number;
}

export interface CashflowDuplicateResult {
  nearbyDate: CashflowDuplicateGroup;
  sameCase: CashflowDuplicateGroup;
  samePlate: CashflowDuplicateGroup;
}

export interface CashflowDuplicateParams {
  amount: number;
  transDate?: string;
  caseId?: string;
  licensePlate?: string;
  excludeId?: string;
}

export interface GarageCashflowDashboardParams {
  dateFrom?: string;
  dateTo?: string;
  paymentMethod?: string;
  paymentContent?: string;
  branchId?: string;
}

export interface GarageCashflowKpiData {
  totalIn: number;
  totalOut: number;
  net: number;
  countIn: number;
  countOut: number;
  pendingOutAmount: number;
  pendingOutCount: number;
}

export interface GarageCashflowBreakdownItem {
  name: string;
  amount: number;
  count: number;
  percentage?: number;
}

export interface GarageCashflowMethodBreakdown {
  in: GarageCashflowBreakdownItem[];
  out: GarageCashflowBreakdownItem[];
}

export interface GarageCashflowContentBreakdown {
  in: GarageCashflowBreakdownItem[];
  out: GarageCashflowBreakdownItem[];
}

export interface GarageCashflowTrendItem {
  label: string;
  cashIn: number;
  cashOut: number;
  net: number;
}

export interface GarageCashflowTopTransactionItem {
  id: string;
  voucherCode: string;
  transDate: string;
  amount: number;
  partnerName?: string | null;
  licensePlate?: string | null;
  paymentMethod?: string | null;
  paymentContent?: string | null;
  paymentStatus?: "PENDING" | "APPROVED" | "PAID" | null;
  caseCode?: string | null;
  caseId?: string | null;
}

export interface GarageCashflowTopTransactions {
  in: GarageCashflowTopTransactionItem[];
  out: GarageCashflowTopTransactionItem[];
}

export interface GarageCashflowDashboardData {
  kpi: GarageCashflowKpiData;
  methodBreakdown: GarageCashflowMethodBreakdown;
  contentBreakdown: GarageCashflowContentBreakdown;
  trend: GarageCashflowTrendItem[];
  topTransactions: GarageCashflowTopTransactions;
}

export const garageCashflowApi = {
  checkDuplicates: async (
    params: CashflowDuplicateParams,
  ): Promise<CashflowDuplicateResult> => {
    const res = await axiosInstance.get(
      "/api/v1/greenway/cashflow-vouchers/duplicate-check",
      { params },
    );
    return res.data;
  },
  getList: async (params?: Record<string, any>) => {
    const res = await axiosInstance.get("/api/v1/greenway/cashflow-vouchers", {
      params,
    });
    return res.data;
  },
  getDashboard: async (
    params?: GarageCashflowDashboardParams,
  ): Promise<GarageCashflowDashboardData> => {
    const res = await axiosInstance.get(
      "/api/v1/greenway/cashflow-vouchers/dashboard",
      { params },
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
  startExportExcelBackground: async (
    params: any,
  ): Promise<{ jobId: string; message: string; reused?: boolean }> => {
    const res = await axiosInstance.post(
      "/api/v1/greenway/cashflow-vouchers/export/excel/background",
      params,
    );
    return res.data;
  },
  listExportExcelHistory: async (page = 1, pageSize = 10) => {
    const res = await axiosInstance.get(
      "/api/v1/greenway/cashflow-vouchers/export/excel/background/history",
      {
        params: { page, pageSize },
      },
    );
    return res.data;
  },
  downloadExportExcelFile: async (jobId: string) => {
    const res = await axiosInstance.get(
      `/api/v1/greenway/cashflow-vouchers/export/excel/background/${jobId}/download`,
      {
        responseType: "blob",
      },
    );
    return res.data;
  },
};
