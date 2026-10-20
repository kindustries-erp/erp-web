export interface QuoteReceivableInvoiceItem {
  id?: string;
  invoiceId?: string;
  invoiceNo?: string;
  totalAmount?: number;
  invoiceDate?: string;
  buyerName?: string;
  sellerName?: string;
  hasBankNetOff?: boolean;
  bankSettledAmount?: number;
}

export interface QuoteReceivableRow {
  id: "KH" | "BH";
  stt: number;
  payer: "KH" | "BH";
  labelKey: string;
  defaultLabel: string;
  amount: number;
  collectedAmount?: number;
  remainingAmount?: number;
  note?: string;
  linkedInvoices?: QuoteReceivableInvoiceItem[];
}

export interface QuoteReceivablesTableProps {
  items?: QuoteReceivableRow[];
  caseData?: any;
  activeSettlements?: any[];
  activeLinkedInvoices?: any[];
  loading?: boolean;
  className?: string;
  canEditFinancial?: boolean;
  canPerformPayment?: boolean;
  disabledReason?: string;
  onPaymentClick?: (row: QuoteReceivableRow) => void;
  onRemoveInvoice?: (id: string) => void;
  onRemoveSettlement?: (id: string) => void;
}
