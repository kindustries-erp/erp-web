import type {
  LoanItem,
  LoanPaymentRecord,
  LoanSchedulePeriod,
} from "@/v2/core/loans";

export interface RecordPaymentModalProps {
  open: boolean;
  onClose: () => void;
  loanId: string;
  loanTitle: string;
  loanCode?: string;
  remainingPrincipal?: number;
  loan?: LoanItem;
  schedule?: LoanSchedulePeriod[];
  paidPeriodNumbers?: number[];
  suggestedPeriod?: number;
  suggestedPrincipal?: number;
  suggestedInterest?: number;
  mode?: "create" | "edit";
  editPayment?: LoanPaymentRecord | null;
}
