import type { PartnerInvoiceDetailItem } from "@/modules/accounting/api/invoiceDebtsApi";

export interface ErpInvoicePartnerInvoicesSectionProps {
  taxCode?: string | null;
  partnerName?: string;
  partnerType: "SUPPLIER" | "CUSTOMER";
  direction?: "IN" | "OUT";
  onPreviewInvoice?: (invoice: PartnerInvoiceDetailItem) => void;
  className?: string;
}
