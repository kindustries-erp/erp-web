import type {
  CashflowClassification,
  CashflowPurpose,
} from "../../domain/value-objects/cashflowAttributes";

export type CashTransactionPostingStatus = "POSTED" | "UNPOSTED";

export interface CashTransactionBranchDto {
  id: string;
  name?: string | null;
}

export interface CashTransactionBankAccountDto {
  id?: string;
  bankName?: string | null;
  bankCode?: string | null;
  accountNumber?: string | null;
  accountName?: string | null;
  accountingAccountId?: string | null;
}

export interface CashTransactionPartnerDto {
  id: string;
  name?: string | null;
  taxCode?: string | null;
}

export interface CashTransactionBookDto {
  id?: string;
  name?: string | null;
  accountingAccountId?: string | null;
}

export interface CashTransactionNetOffDto {
  id: string;
  invoiceId?: string | null;
  invoice?: { id: string } | null;
  netOffAmount?: number | null;
}

export interface CashTransactionPostingLineDto {
  id?: string;
  accountId: string;
  debit: number;
  credit: number;
  description?: string | null;
}

/** Giao dịch sổ quỹ tiền mặt từ `GET /bank-transactions-core/transactions/:id` */
export interface CashTransactionDto {
  id: string;
  sourceType: "BANK" | "CASH";
  transDate: string;
  referenceNumber?: string | null;
  description?: string | null;
  note?: string | null;
  debitAmount: number | string;
  creditAmount: number | string;
  correspondentName?: string | null;
  correspondentAccount?: string | null;
  correspondentBank?: string | null;
  correspondentAccountingAccountId?: string | null;
  branch?: CashTransactionBranchDto | null;
  branchIds?: string[] | null;
  branchId?: string | null;
  branchName?: string | null;
  bankAccount?: CashTransactionBankAccountDto | null;
  cashBook?: CashTransactionBookDto | null;
  partner?: CashTransactionPartnerDto | null;
  cashflowClassification?: CashflowClassification | null;
  cashflowPurpose?: CashflowPurpose | null;
  postingStatus: CashTransactionPostingStatus;
  postingDate?: string | null;
  postingDescription?: string | null;
  journalEntryId?: string | null;
  lines?: CashTransactionPostingLineDto[] | null;
  invoiceNetOffs?: CashTransactionNetOffDto[] | null;
  createdAt?: string | null;
}

export interface CashTransactionUpdateDto {
  branchIds?: string[];
  partnerId?: string | null;
  invoicePartner?: {
    taxCode: string | null;
    name: string;
    partnerType: "CUSTOMER" | "VENDOR";
  };
  note?: string;
  cashflowClassification?: CashflowClassification | null;
  cashflowPurpose?: CashflowPurpose | null;
}

export interface CashTransactionPostRequestDto {
  postingDate: string;
  description?: string;
  lines: {
    accountId: string;
    debit: number;
    credit: number;
    description?: string;
  }[];
}
