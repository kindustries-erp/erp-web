export enum AmortizationMethod {
  AMORTIZED = "AMORTIZED",
  EQUAL_PRINCIPAL = "EQUAL_PRINCIPAL",
  BULLET = "BULLET",
  FLAT = "FLAT",
}

export enum LoanStatus {
  DRAFT = "DRAFT",
  ACTIVE = "ACTIVE",
  COMPLETED = "COMPLETED",
  OVERDUE = "OVERDUE",
}

export interface LoanSimulationInput {
  principalAmount: number;
  annualInterestRate: number;
  tenorMonths: number;
  amortizationMethod: AmortizationMethod;
  startDate: string;
  firstPaymentDate?: string;
}

export interface LoanSchedulePeriod {
  periodNumber: number;
  dueDate: string;
  beginningBalance: number;
  principalDue: number;
  interestDue: number;
  totalPaymentDue: number;
  endingBalance: number;
}

export interface LoanSimulationResult {
  principalAmount: number;
  annualInterestRate: number;
  tenorMonths: number;
  amortizationMethod: AmortizationMethod;
  startDate: string;
  firstPaymentDate: string;
  monthlyPaymentEstimate: number;
  totalInterestDue: number;
  totalAmountDue: number;
  schedule: LoanSchedulePeriod[];
}

export interface PortfolioLoanItem {
  id: string;
  name: string;
  enabled: boolean;
  principalAmount: number;
  annualInterestRate: number;
  tenorMonths: number;
  amortizationMethod: AmortizationMethod;
  startDate: string;
  lenderName?: string;
}

export interface PortfolioMonthlyPeriod {
  monthKey: string;
  paymentDate: string;
  principalDue: number;
  interestDue: number;
  totalPayment: number;
  remainingPrincipal: number;
  loansCount: number;
  breakdown?: Array<{
    loanId: string;
    loanName: string;
    dueDate: string;
    principalDue: number;
    interestDue: number;
    totalPayment: number;
    endingBalance: number;
  }>;
}

export interface PortfolioSimulationResult {
  totalPrincipal: number;
  totalInterest: number;
  totalRepayment: number;
  averageMonthlyPayment: number;
  firstMonthPayment: number;
  activeLoansCount: number;
  schedule: PortfolioMonthlyPeriod[];
}

export interface LoanPaymentRecord {
  id: string;
  loanId: string;
  periodNumber: number;
  paymentDate: string;
  principalPaid: number;
  interestPaid: number;
  totalPaid: number;
  paymentRef?: string | null;
  notes?: string | null;
  createdAt: string;
}

export interface LoanItem {
  id: string;
  loanCode: string;
  title: string;
  lenderName: string;
  partnerId?: string | null;
  principalAmount: number;
  annualInterestRate: number;
  tenorMonths: number;
  amortizationMethod: AmortizationMethod;
  startDate: string;
  firstPaymentDate: string;
  totalPaidPrincipal: number;
  totalPaidInterest: number;
  remainingPrincipal: number;
  status: LoanStatus;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  payments?: LoanPaymentRecord[];
  schedule?: LoanSchedulePeriod[];
}
