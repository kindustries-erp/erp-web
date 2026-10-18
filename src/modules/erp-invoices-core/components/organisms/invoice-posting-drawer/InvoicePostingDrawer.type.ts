export interface PostInvoiceLine {
  id: string;
  accountId: string;
  debit: number;
  credit: number;
  description: string;
}

export interface InvoicePostingDrawerProps {
  open: boolean;
  onClose: () => void;
  invoiceId: string | null;
}
