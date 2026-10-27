import type { NetOffPartnerType } from "../../domain/rules/debtNetOffRules";

/** Dòng hóa đơn của đối tác từ `GET /erp-invoices/debts/:taxCode/invoices` (chỉ các trường dùng cho cấn trừ) */
export interface PartnerInvoiceDto {
  id: string;
  invoiceNo: string;
  invoiceDate: string;
  totalAmount: number;
  balanceAmount: number;
  taxInvoiceStatus?: number | null;
}

export interface DebtNetOffAllocateRequestDto {
  partnerType: NetOffPartnerType;
  bankTransactionId: string;
  allocations: { invoiceId: string; amount: number }[];
}

export interface DebtNetOffAllocateResultDto {
  bankTransactionId: string;
  allocations: { invoiceId: string; amount: number }[];
  message: string;
}
