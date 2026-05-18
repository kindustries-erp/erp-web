import type { Dispatch, SetStateAction } from "react";
import type { CompanyBankAccount } from "@/modules/accounting/api/catalogApi";
import type { BusinessPartner } from "@/modules/partners/api/partnerApi";
import type { Employee } from "@/modules/auth/api/auth";
import type {
  CounterpartyRole,
  PaymentVoucher,
  PaymentVoucherAttachment,
  VoucherStatus,
} from "@/modules/finance/api/financeApi";

export interface LoadVouchersParams {
  page: number;
  pageSize: number;
  search: string;
  statusFilter: VoucherStatus | "";
  channelFilter: string;
  channelParam: "company_bank_account_id";
  voucherChannel: "BANK";
  sortCol: string;
  dateFrom: string;
  dateTo: string;
  amountMin: string;
  amountMax: string;
}

export interface DashboardParams {
  voucherChannel: "BANK";
  channelParam: "company_bank_account_id";
  channelFilter: string;
  receiptType: "BANK_RECEIPT";
  paymentType: "BANK_PAYMENT";
}

export interface UseBankVoucherHandlersParams {
  companyBankAccounts: CompanyBankAccount[];
  partners: BusinessPartner[];
  employees: Employee[];
  vouchers: PaymentVoucher[];
  page: number;
  pageSize: number;
  search: string;
  statusFilter: VoucherStatus | "";
  bankFilter: string;
  sortCol: string;
  dateFrom: string;
  dateTo: string;
  amountMin: string;
  amountMax: string;
  coaItemsLength: number;
  attachmentFileName: (item: PaymentVoucherAttachment) => string;
  setPage: Dispatch<SetStateAction<number>>;
  loadVouchers: (
    params: LoadVouchersParams,
  ) => Promise<PaymentVoucher[] | undefined>;
  loadVoucherAttachments: (items: PaymentVoucher[]) => Promise<void>;
  loadSummary: (
    from: string,
    to: string,
    params: DashboardParams,
  ) => Promise<void>;
  loadOpeningBalanceAndChart: (
    from: string,
    chartEndDate: string,
    params: DashboardParams,
  ) => Promise<void>;
  reloadDonutData: () => void;
}

export const bankDashboardParamsBase = {
  voucherChannel: "BANK",
  channelParam: "company_bank_account_id",
  receiptType: "BANK_RECEIPT",
  paymentType: "BANK_PAYMENT",
} as const;
