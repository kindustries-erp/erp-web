import type { V2DrawerLinesLayout } from "@/v2/shared/components";
import type { ReactNode } from "react";
import type { GoodsReceiptFormLine } from "@/v2/core/goods-receipts";

export type GoodsReceiptTranslate = (key: string, fallback?: string) => string;

export interface LineColumnRenderContext {
  line: GoodsReceiptFormLine;
  index: number;
  viewing: boolean;
  t: GoodsReceiptTranslate;
  onUpdate: (
    index: number,
    field: keyof GoodsReceiptFormLine,
    val: string,
  ) => void;
  /** Cập nhật nhiều trường của một dòng trong một lần ghi */
  onPatch: (index: number, patch: Partial<GoodsReceiptFormLine>) => void;
  onRemove: (index: number) => void;
}

export interface GoodsReceiptLineColumn {
  id: string;
  headerKey: string;
  defaultHeader: string;
  layout: V2DrawerLinesLayout;
  hideWhenViewing?: boolean;
  renderCell: (ctx: LineColumnRenderContext) => ReactNode;
}
