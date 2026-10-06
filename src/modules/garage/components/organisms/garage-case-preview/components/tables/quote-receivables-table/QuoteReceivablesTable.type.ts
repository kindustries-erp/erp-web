export interface QuoteReceivableRow {
  id: "KH" | "BH";
  stt: number;
  payer: "KH" | "BH";
  labelKey: string;
  defaultLabel: string;
  amount: number;
  note?: string;
}

export interface QuoteReceivablesTableProps {
  items?: QuoteReceivableRow[];
  caseData?: any;
  loading?: boolean;
  className?: string;
  canEditFinancial?: boolean;
  canPerformPayment?: boolean;
  disabledReason?: string;
  onPaymentClick?: (row: QuoteReceivableRow) => void;
}
