export interface QuoteCostSummarySectionProps {
  totalCostAmount: number;
  activeSettlements?: any[];
  activeLinkedInvoices?: any[];
  editMode?: boolean;
  canPerformPayment?: boolean;
  disabledReason?: string;
  canEditFinancial?: boolean;
  caseId: string;
  caseCode?: string;
  caseData: any;
  onPaymentSaved?: () => void;
  onAddSettlement?: (items: any[]) => void;
  onRemoveSettlement?: (id: string) => void;
  onAddInvoice?: (payload: any) => void;
  onRemoveInvoice?: (id: string) => void;
  className?: string;
}

export interface QuoteCostSummaryRowProps {
  totalCostAmount: number;
  totalPaid: number;
  remainingAmount: number;
  canPerformPayment: boolean;
  disabledReason?: string;
  onPaymentClick: () => void;
}

export interface QuoteCostTableRow {
  id: string;
  stt: number;
  payer: "GARAGE" | "VENDOR";
  labelKey: string;
  defaultLabel: string;
  amount: number;
  paidAmount: number;
  remainingAmount: number;
  note?: string;
  linkedInvoices?: any[];
}

export interface QuoteCostTableProps {
  totalCostAmount: number;
  totalPaid: number;
  remainingAmount: number;
  activeLinkedInvoices?: any[];
  activeSettlements?: any[];
  canPerformPayment: boolean;
  disabledReason?: string;
  onPaymentClick: () => void;
  onRemoveInvoice?: (id: string) => void;
  onRemoveSettlement?: (id: string) => void;
  className?: string;
}

export interface QuoteCostSettlementItem {
  id: string;
  transDate?: string;
  sourceChannel?: string;
  category?: string;
  partnerName?: string;
  amount: number;
  note?: string;
  isPending?: boolean;
  type?: "SETTLEMENT" | "INVOICE";
  invoiceNo?: string;
}
