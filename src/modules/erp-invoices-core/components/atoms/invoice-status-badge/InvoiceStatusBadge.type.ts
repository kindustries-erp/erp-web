export interface TaxInvoiceStatusBadgeProps {
  status?: number | null;
  relatedInvoiceNo?: string | null;
  relatedSerialNo?: string | null;
}

export interface TaxProcessStatusBadgeProps {
  status?: number | null;
}

export interface PostingStatusBadgeProps {
  status?: string | null;
}

export interface InvoiceValidBadgeProps {
  isValid?: boolean;
  validLabel?: string;
  invalidLabel?: string;
}
