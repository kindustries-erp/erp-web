export interface RecordPaymentModalProps {
  open: boolean;
  onClose: () => void;
  loanId: string;
  loanTitle: string;
  suggestedPeriod?: number;
  suggestedPrincipal?: number;
  suggestedInterest?: number;
}
