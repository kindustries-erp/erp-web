import type { ErpSalesOrder } from "@/modules/sales-orders-core/api/salesOrdersCoreApi";

export interface SalesOrderSelectionModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (so: ErpSalesOrder) => void;
  existingSoIds?: string[];
}
