import { AmortizationMethod, type PortfolioLoanItem } from "@/v2/core/loans";

export interface LoanSimulatorFormValues {
  principalAmount: number;
  annualInterestRate: number;
  tenorMonths: number;
  amortizationMethod: AmortizationMethod;
  startDate: string;
}

export interface LoanSimulatorPageProps {
  initialValues?: Partial<LoanSimulatorFormValues>;
  className?: string;
  onSaved?: () => void;
}

export const DEFAULT_PORTFOLIO_LOANS: PortfolioLoanItem[] = [
  {
    id: "loan-1",
    name: "Khoản vay 1 (Dự án)",
    enabled: true,
    principalAmount: 500_000_000,
    annualInterestRate: 8.5,
    tenorMonths: 24,
    amortizationMethod: AmortizationMethod.AMORTIZED,
    startDate: new Date().toISOString().split("T")[0],
    lenderName: "Ngân hàng TMCP Ngoại thương (VCB)",
  },
];

export const DRAFT_SIMULATION_KEY = "loan_draft_simulation_portfolio";
