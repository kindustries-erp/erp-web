import * as React from "react";
import { Plus } from "lucide-react";
import {
  V2Button,
  DrawerSection,
  V2DrawerLinesTable,
  type V2DrawerLinesColumn,
} from "@/v2/shared/components";
import {
  calcPurchaseOrderLineAmount,
  sumPurchaseOrderLineAmounts,
} from "../../../domain/purchaseOrderRules";
import { emptyPurchaseOrderLine } from "../../../domain/purchaseOrder";
import type { PurchaseOrderFormLine } from "../../../domain/purchaseOrderLine";
import { PURCHASE_ORDER_LINES_COLUMNS } from "./PurchaseOrderLinesTable.columns";
import type { PurchaseOrderTranslate } from "./PurchaseOrderLinesTable.type";
import "../../../purchaseOrders.locale";

export interface PurchaseOrderLinesTableProps {
  lines: PurchaseOrderFormLine[];
  viewing: boolean;
  creating: boolean;
  t: PurchaseOrderTranslate;
  onChangeLines: (lines: PurchaseOrderFormLine[]) => void;
}

/** Bảng dòng hàng của đơn mua hàng: thêm, sửa, xóa dòng; thành tiền tự tính */
export function PurchaseOrderLinesTable({
  lines,
  viewing,
  creating,
  t,
  onChangeLines,
}: PurchaseOrderLinesTableProps) {
  const visibleColumns = PURCHASE_ORDER_LINES_COLUMNS.filter(
    (col) =>
      !(col.hideWhenViewing && viewing) && !(col.hideWhenCreating && creating),
  );

  const handleAddLine = () =>
    onChangeLines([...lines, emptyPurchaseOrderLine()]);

  const handleUpdateLine = (
    index: number,
    field: keyof PurchaseOrderFormLine,
    val: string,
  ) => {
    const next = [...lines];
    const current = { ...next[index], [field]: val };
    if (field === "qtyOrdered" || field === "unitPrice") {
      current.amount = String(
        calcPurchaseOrderLineAmount(current.qtyOrdered, current.unitPrice),
      );
    }
    next[index] = current;
    onChangeLines(next);
  };

  const handleRemoveLine = (index: number) =>
    onChangeLines(lines.filter((_, i) => i !== index));

  const totalAmount = React.useMemo(
    () => sumPurchaseOrderLineAmounts(lines),
    [lines],
  );

  const layoutColumns: V2DrawerLinesColumn[] = visibleColumns.map((col) => ({
    id: col.id,
    header: col.headerKey ? t(col.headerKey, col.defaultHeader) : "",
    ...col.layout,
  }));

  const renderCell = (
    column: V2DrawerLinesColumn,
    line: PurchaseOrderFormLine,
    index: number,
  ) => {
    const def = visibleColumns.find((col) => col.id === column.id);
    if (!def) return null;
    return def.renderCell({
      line,
      index,
      viewing,
      t,
      onUpdate: handleUpdateLine,
      onRemove: handleRemoveLine,
    });
  };

  return (
    <DrawerSection
      title={t("v2.purchaseOrders.lines.title", "Chi tiết hàng đặt")}
      count={lines.length}
      titleExtra={
        !viewing && (
          <V2Button variant="outline" size="sm" onClick={handleAddLine}>
            <Plus className="w-3.5 h-3.5 mr-1" />
            {t("v2.purchaseOrders.lines.addLine", "Thêm dòng")}
          </V2Button>
        )
      }
    >
      <V2DrawerLinesTable<PurchaseOrderFormLine>
        ariaLabel={t("v2.purchaseOrders.lines.title", "Chi tiết hàng đặt")}
        columns={layoutColumns}
        rows={lines}
        getRowKey={(line) => line.clientKey}
        renderCell={renderCell}
        footerLabel={`${t("v2.purchaseOrders.lines.total", "Tổng cộng")}:`}
        footerCells={{ amount: totalAmount.toLocaleString("vi-VN") }}
        emptyLabel={t(
          "v2.purchaseOrders.lines.noLines",
          "Chưa có dòng hàng nào trong đơn",
        )}
      />
    </DrawerSection>
  );
}
