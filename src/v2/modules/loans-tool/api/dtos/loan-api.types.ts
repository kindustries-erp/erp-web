import type { V2SummaryMetric } from "@/v2/shared/types/v2-table";
import { AmortizationMethod, LoanItem, LoanStatus } from "@/v2/core/loans";
import type { V2PaginatedResponseWithSummaries } from "@/v2/shared/types/v2-pagination";

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

export type UpdatePaymentPayload = Partial<RecordPaymentPayload>;

/** Response danh sách chuẩn v2: `items`, `pagination` và `summaries`. */
export type LoanListResponse = V2PaginatedResponseWithSummaries<
  LoanItem,
  Record<string, V2SummaryMetric | null>
>;

export interface CashflowLoanBreakdownItem {
  loanId: string;
  loanName: string;
  dueDate: string;
  principalDue: number;
  interestDue: number;
  totalPayment: number;
  endingBalance: number;
  scheduledPrincipal?: number;
  scheduledInterest?: number;
  scheduledTotal?: number;
  actualPrincipalPaid?: number;
  actualInterestPaid?: number;
  actualTotalPaid?: number;
  isPaid?: boolean;
}

export interface MonthlyCashflowProjection {
  month: string;
  principalDue: number;
  interestDue: number;
  totalPaymentDue: number;
  cumulativeRemainingPrincipal: number;
  activeLoanCount: number;
  scheduledPrincipalDue?: number;
  scheduledInterestDue?: number;
  scheduledTotalDue?: number;
  actualPrincipalPaid?: number;
  actualInterestPaid?: number;
  actualTotalPaid?: number;
  isPaid?: boolean;
  breakdown?: CashflowLoanBreakdownItem[];
}

export interface CashflowProjectionResponse {
  monthlyProjections: MonthlyCashflowProjection[];
  totalPrincipalDue: number;
  totalInterestDue: number;
  totalObligationDue: number;
  totalScheduledPrincipal?: number;
  totalScheduledInterest?: number;
  totalScheduledObligation?: number;
  totalActualPrincipalPaid?: number;
  totalActualInterestPaid?: number;
  totalActualPaid?: number;
}
