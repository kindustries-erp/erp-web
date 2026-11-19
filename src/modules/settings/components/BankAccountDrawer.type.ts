import type { ErpBankAccount } from "@/modules/bank-statements/api/bankStatementApi";

export interface BankAccountFormState {
  selectedBranchId: string;
  accountingAccountId: string;
  bankCode: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  currency: string;
  isActive: boolean;
  openingBalance: number;
  periodDate: string;
}

export interface UseBankAccountDrawerProps {
  open: boolean;
  bankAccount: ErpBankAccount | null;
  onSuccess: () => void;
  onClose: () => void;
}

export const DEFAULT_BANK_ACCOUNT_STATE: BankAccountFormState = {
  selectedBranchId: "",
  accountingAccountId: "",
  bankCode: "",
  bankName: "",
  accountNumber: "",
  accountName: "",
  currency: "VND",
  isActive: true,
  openingBalance: 0,
  periodDate: "",
};
