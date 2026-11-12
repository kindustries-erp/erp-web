import { AmortizationMethod, LoanItem, LoanStatus } from "@/v2/core/loans";

export interface LoanFormValues {
  loanCode: string;
  title: string;
  lenderName: string;
  principalAmount: number;
  annualInterestRate: number;
  tenorMonths: number;
  amortizationMethod: AmortizationMethod;
  startDate: string;
  firstPaymentDate: string;
  status: LoanStatus;
  notes: string;
}

export interface LoanFormDrawerProps {
  open: boolean;
  onClose: () => void;
  record?: LoanItem | null;
  initialValues?: Partial<LoanFormValues>;
  onSuccess?: (savedLoan: LoanItem) => void;
}
