import type { V2SummaryMetric } from "@/v2/shared/types/v2-table";
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

export interface LoanPagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface LoanListResponse {
  items: LoanItem[];
  pagination: LoanPagination;
  summaries: Record<string, V2SummaryMetric | null>;
}

export interface CashflowLoanBreakdownItem {
  loanId: string;
  loanName: string;
  dueDate: string;
  principalDue: number;
  interestDue: number;
  totalPayment: number;
  endingBalance: number;
}

export interface MonthlyCashflowProjection {
  month: string;
  principalDue: number;
  interestDue: number;
  totalPaymentDue: number;
  cumulativeRemainingPrincipal: number;
  activeLoanCount: number;
  breakdown?: CashflowLoanBreakdownItem[];
}

export interface CashflowProjectionResponse {
  monthlyProjections: MonthlyCashflowProjection[];
  totalPrincipalDue: number;
  totalInterestDue: number;
  totalObligationDue: number;
}
