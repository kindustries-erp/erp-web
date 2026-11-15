import { LoansViewKey } from "./loansList.enum";

export const LOANS_TABLE_ID = "loans-master-table";

export const LOAN_VIEW_VISIBILITY: Record<
  LoansViewKey,
  Record<string, boolean>
> = {
  [LoansViewKey.OVERVIEW]: {
    loanCode: true,
    title: true,
    lenderName: true,
    startDate: true,
    principalAmount: true,
    totalPaidPrincipal: true,
    remainingPrincipal: true,
    status: true,
    annualInterestRate: false,
    tenorMonths: false,
    amortizationMethod: false,
    firstPaymentDate: false,
  },
  [LoansViewKey.ALL]: {
    loanCode: true,
    title: true,
    lenderName: true,
    startDate: true,
    firstPaymentDate: true,
    principalAmount: true,
    totalPaidPrincipal: true,
    remainingPrincipal: true,
    annualInterestRate: true,
    tenorMonths: true,
    amortizationMethod: true,
    status: true,
  },
};
