import type { CompanyProfile } from "@/core/api/companyProfileApi";

export type GarageCashflowPrintVariant = "RECEIPT" | "PAYMENT";

/** Nguồn dữ liệu đầu vào cho bản in (cấu trúc con của GarageCashflowVoucher). */
export interface GarageCashflowPrintSource {
  voucherCode: string;
  voucherType: GarageCashflowPrintVariant;
  transDate: string;
  amount: number;
  partnerName?: string | null;
  licensePlate?: string | null;
  paymentContent?: string | null;
  note?: string | null;
  case?: {
    khachHangName?: string | null;
    bienSoXe?: string | null;
  } | null;
}

/** Dữ liệu đã chuẩn hóa dùng để render bản in. */
export interface GarageCashflowPrintData {
  variant: GarageCashflowPrintVariant;
  voucherCode: string;
  transDate: string;
  partyName: string;
  partyAddress: string;
  reason: string;
  amount: number;
  amountInWords: string;
  note: string;
}

export interface GarageCashflowPrintLabels {
  templateNo: string;
  title: string;
  partyLabel: string;
  reasonLabel: string;
  signerLabel: string;
}

export interface GarageCashflowPrintTemplateProps {
  companyProfile?: CompanyProfile | null;
  data: GarageCashflowPrintData | null;
}
