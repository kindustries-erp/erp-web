import type { V2DrawerLinesLayout } from "@/v2/shared/components";
import type { ReactNode } from "react";
import type { PurchaseOrderFormLine } from "../../../domain/purchaseOrderLine";

export type PurchaseOrderTranslate = (key: string, fallback?: string) => string;

export interface LineCellContext {
  line: PurchaseOrderFormLine;
  index: number;
  viewing: boolean;
  t: PurchaseOrderTranslate;
  onUpdate: (
    index: number,
    field: keyof PurchaseOrderFormLine,
    val: string,
  ) => void;
  onRemove: (index: number) => void;
}

export interface PurchaseOrderLineColumn {
  id: string;
  headerKey: string;
  defaultHeader: string;
  layout: V2DrawerLinesLayout;
  /** Ẩn khi đang xem (chỉ đọc) */
  hideWhenViewing?: boolean;
  /** Ẩn khi đang tạo mới (ví dụ SL đã nhận chỉ có ý nghĩa sau khi lưu) */
  hideWhenCreating?: boolean;
  renderCell: (ctx: LineCellContext) => ReactNode;
}
