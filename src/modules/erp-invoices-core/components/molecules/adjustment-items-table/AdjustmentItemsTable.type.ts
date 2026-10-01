import type { ItemReconciliationDto } from "@/modules/erp-invoices-core/api/erpInvoicesCoreApi";

export interface AdjustmentItemsTableProps {
  items: ItemReconciliationDto[];
  className?: string;
}
