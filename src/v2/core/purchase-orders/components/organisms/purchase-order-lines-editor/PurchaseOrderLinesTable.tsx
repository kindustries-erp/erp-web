import * as React from "react";
import { Plus } from "lucide-react";
import { V2Button, DrawerSection } from "@/v2/shared/components";
import {
  calcPurchaseOrderLineAmount,
  sumPurchaseOrderLineAmounts,
} from "../../../domain/purchaseOrderRules";
import { emptyPurchaseOrderLine } from "../../../domain/purchaseOrder";
import type { PurchaseOrderFormLine } from "../../../domain/purchaseOrderLine";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/v2/shared/ui/table";
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
      <div className="overflow-x-auto rounded border border-border">
        <Table className="w-full text-xs">
          <TableHeader>
            <TableRow className="bg-muted/50 border-b border-border text-muted-fg font-medium">
              {visibleColumns.map((col) => (
                <TableHead key={col.id} className={col.headerClassName}>
                  {col.headerKey ? t(col.headerKey, col.defaultHeader) : ""}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {lines.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={visibleColumns.length}
                  className="p-6 text-center text-muted-fg"
                >
                  {t(
                    "v2.purchaseOrders.lines.noLines",
                    "Chưa có dòng hàng nào trong đơn",
                  )}
                </TableCell>
              </TableRow>
            ) : (
              lines.map((line, idx) => (
                <TableRow
                  key={line.clientKey}
                  className="border-b border-border hover:bg-muted/30"
                >
                  {visibleColumns.map((col) => (
                    <TableCell key={col.id} className={col.cellClassName}>
                      {col.renderCell({
                        line,
                        index: idx,
                        viewing,
                        t,
                        onUpdate: handleUpdateLine,
                        onRemove: handleRemoveLine,
                      })}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
          {lines.length > 0 && (
            <TableFooter className="bg-muted/40 font-semibold border-t border-border">
              <TableRow>
                <TableCell
                  // Ô nhãn phủ các cột trước "Thành tiền"; khi sửa còn thêm ô thao tác cuối
                  colSpan={visibleColumns.length - (viewing ? 1 : 2)}
                  className="text-right p-2 font-bold text-xs"
                >
                  {t("v2.purchaseOrders.lines.total", "Tổng cộng")}:
                </TableCell>
                <TableCell className="text-right p-2 tabular-nums font-bold text-primary text-xs">
                  {totalAmount.toLocaleString("vi-VN")}
                </TableCell>
                {!viewing && <TableCell className="p-2" />}
              </TableRow>
            </TableFooter>
          )}
        </Table>
      </div>
    </DrawerSection>
  );
}
