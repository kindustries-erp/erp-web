import type { OperationalDocument } from "@/modules/operational/api/operationalApi";
import type { ErpPurchaseOrder } from "../../api/purchaseOrdersCoreApi";

export interface PurchaseOrderPartnerTabProps {
  purchaseOrder?: OperationalDocument | ErpPurchaseOrder | null;
  supplierId?: string | null;
  supplierName?: string | null;
  defaultViewMode?: "orders" | "lines";
  onOpenPoDetail?: (po: any) => void;
}

export interface PurchaseOrderPartnerRightPanelProps {
  purchaseOrder?: OperationalDocument | ErpPurchaseOrder | null;
  supplierId?: string | null;
}
