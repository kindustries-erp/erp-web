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
  /** Thanh toán đã ghi nhận. Bỏ trống thì modal tự tải chi tiết khoản vay. */
  payments?: LoanPaymentRecord[];
  suggestedPeriod?: number;
  suggestedPrincipal?: number;
  suggestedInterest?: number;
  mode?: "create" | "edit";
  editPayment?: LoanPaymentRecord | null;
}
