import type { LoanItem } from "@/v2/core/loans";

export interface LoanDetailDrawerProps {
  open: boolean;
  onClose: () => void;
  loanId?: string | null;
  onEdit?: (loan: LoanItem) => void;
}
