import type { AmortizationMethod } from "@/v2/core/loans";

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
