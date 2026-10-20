export interface AdjustmentOriginalInvoiceSummary {
  id?: string | null;
  invoiceNo?: string | null;
  serialNo?: string | null;
  invoiceDate?: string | null;
  totalAmount?: number | string | null;
}

export interface AdjustmentOriginalInvoiceCardProps {
  relatedInvNo?: string | null;
  relatedSerNo?: string | null;
  originalInvoice?: AdjustmentOriginalInvoiceSummary | null;
  loading?: boolean;
  onOpenInvoice: (id?: string | null, no?: string | null) => void;
  taxInvoiceStatus?: number | null;
  className?: string;
}
