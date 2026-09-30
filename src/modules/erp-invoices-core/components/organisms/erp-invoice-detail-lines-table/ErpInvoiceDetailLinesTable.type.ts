import type {
  ErpInvoice,
  ErpInvoiceItem,
} from "@/modules/erp-invoices-core/api/erpInvoicesCoreApi";

export interface ErpInvoiceDetailLinesTableProps {
  invoice: ErpInvoice;
  items?: ErpInvoiceItem[];
  className?: string;
  loading?: boolean;
}
