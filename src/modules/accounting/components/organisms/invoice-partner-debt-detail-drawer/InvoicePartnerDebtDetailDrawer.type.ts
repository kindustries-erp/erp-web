import type { InvoicePartnerType } from "@/modules/accounting/api/invoiceDebtsApi";

export interface InvoicePartnerDebtDetailDrawerProps {
  open: boolean;
  onClose: () => void;
  taxCode: string | null;
  partnerName?: string;
  partnerType: InvoicePartnerType;
  dateFrom?: string;
  dateTo?: string;
}
