import type { ErpPurchaseOrder } from "@/modules/purchase-orders-core/api/purchaseOrdersCoreApi";

export interface PurchaseOrderSelectionModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (po: ErpPurchaseOrder) => void;
  existingPoIds?: string[];
}
