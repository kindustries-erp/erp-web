import type { ErpInvoice, ErpInvoiceItem } from "../../api/erpInvoicesCoreApi";

export interface ErpInvoiceDetailLinesTableProps {
  invoice: ErpInvoice;
  items?: ErpInvoiceItem[];
  className?: string;
  loading?: boolean;
}
