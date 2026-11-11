import { AmortizationMethod, LoanItem, LoanStatus } from "@/v2/core/loans";

export interface CreateLoanPayload {
  loanCode?: string;
  title: string;
  lenderName: string;
  partnerId?: string;
  principalAmount: number;
  annualInterestRate: number;
  tenorMonths: number;
  amortizationMethod: AmortizationMethod;
  startDate: string;
  firstPaymentDate?: string;
  status?: LoanStatus;
  notes?: string;
}

export interface BatchCreateLoansPayload {
  loans: CreateLoanPayload[];
}

export type UpdateLoanPayload = Partial<CreateLoanPayload>;

export interface RecordPaymentPayload {
  periodNumber: number;
  paymentDate: string;
  principalPaid: number;
  interestPaid: number;
  paymentRef?: string;
  notes?: string;
}

export interface LoanListResponse {
  items: LoanItem[];
  total: number;
  page: number;
  pageSize: number;
}

export interface MonthlyCashflowProjection {
  month: string;
  principalDue: number;
  interestDue: number;
  totalPaymentDue: number;
  cumulativeRemainingPrincipal: number;
  activeLoanCount: number;
}

export interface CashflowProjectionResponse {
  monthlyProjections: MonthlyCashflowProjection[];
  totalPrincipalDue: number;
  totalInterestDue: number;
  totalObligationDue: number;
}
