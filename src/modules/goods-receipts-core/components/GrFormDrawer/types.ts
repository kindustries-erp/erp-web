import type {
  UseGrDrawerReturn,
  GrLineForm,
} from "@/modules/goods-receipts-core/hooks/useGrDrawer";

export interface GrFormDrawerProps {
  drawer: UseGrDrawerReturn;
}

export type GrTableMode = "po" | "other-edit" | "view";

export interface GrSerialDrawerState {
  open: boolean;
  lineIndex: number;
  line: GrLineForm | null;
  itemId?: string;
  itemSku?: string;
  itemName?: string;
  trackingPolicyCode?: string;
  trackingPolicyName?: string;
  requiredQty: number;
  receiptDate?: string;
  initialSerials?: any[];
  viewOnly?: boolean;
}
