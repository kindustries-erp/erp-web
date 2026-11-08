import * as React from "react";
import { Plus } from "lucide-react";
import { V2Button, DrawerSection } from "@/v2/shared/components";
import {
  GOODS_RECEIPT_DEFAULT_UNIT,
  createGoodsReceiptClientKey,
  calcGoodsReceiptLineAmount,
  sumGoodsReceiptLineAmounts,
  sumGoodsReceiptLineQuantities,
} from "@/v2/core/goods-receipts";
import type { GoodsReceiptFormLine } from "@/v2/core/goods-receipts";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/v2/shared/ui/table";
import { GoodsReceiptLineRow } from "./GoodsReceiptLineRow";
import { GOODS_RECEIPT_LINES_COLUMNS } from "./GoodsReceiptLinesTable.columns";
import type { GoodsReceiptTranslate } from "./GoodsReceiptLinesTable.type";
import "../../../goodsReceipts.locale";

export interface GoodsReceiptLinesTableProps {
  lines: GoodsReceiptFormLine[];
  viewing: boolean;
  t: GoodsReceiptTranslate;
  onChangeLines: (lines: GoodsReceiptFormLine[]) => void;
}

/** Bảng dòng phụ tùng dùng chung của họ phiếu nhập; không gắn namespace module nào */
export function GoodsReceiptLinesTable({
  lines,
  viewing,
  t,
  onChangeLines,
}: GoodsReceiptLinesTableProps) {
  const visibleColumns = GOODS_RECEIPT_LINES_COLUMNS.filter(
    (col) => !viewing || !col.hideWhenViewing,
  );

  const handleAddLine = () => {
    const newLine: GoodsReceiptFormLine = {
      clientKey: createGoodsReceiptClientKey(),
      itemCode: "",
      itemName: "",
      unit: GOODS_RECEIPT_DEFAULT_UNIT,
      qtyReceived: "1",
      unitCost: "0",
      amount: "0",
      notes: "",
    };
    onChangeLines([...lines, newLine]);
  };

  const handleUpdateLine = (
    index: number,
    field: keyof GoodsReceiptFormLine,
    val: string,
  ) => {
    const next = [...lines];
    const current = { ...next[index], [field]: val };

    if (field === "qtyReceived" || field === "unitCost") {
      current.amount = String(
        calcGoodsReceiptLineAmount(current.qtyReceived, current.unitCost),
      );
    }
    next[index] = current;
    onChangeLines(next);
  };

  const handleRemoveLine = (index: number) => {
    onChangeLines(lines.filter((_, i) => i !== index));
  };

  const totalQty = React.useMemo(
    () => sumGoodsReceiptLineQuantities(lines),
    [lines],
  );
  const totalAmount = React.useMemo(
    () => sumGoodsReceiptLineAmounts(lines),
    [lines],
  );

  return (
    <DrawerSection
      title={t("v2.goodsReceipts.lines.title", "Chi tiết phụ tùng nhập kho")}
      count={lines.length}
      titleExtra={
        !viewing && (
          <V2Button variant="outline" size="sm" onClick={handleAddLine}>
            <Plus className="w-3.5 h-3.5 mr-1" />
            {t("v2.goodsReceipts.lines.addPart", "Thêm phụ tùng")}
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
                    "v2.goodsReceipts.lines.noParts",
                    "Chưa có phụ tùng nào trong phiếu nhập",
                  )}
                </TableCell>
              </TableRow>
            ) : (
              lines.map((line, idx) => (
                <GoodsReceiptLineRow
                  key={line.clientKey ?? line.id ?? `row-${idx}`}
                  line={line}
                  index={idx}
                  viewing={viewing}
                  t={t}
                  onUpdate={handleUpdateLine}
                  onRemove={handleRemoveLine}
                />
              ))
            )}
          </TableBody>
          {lines.length > 0 && (
            <TableFooter className="bg-muted/40 font-semibold border-t border-border">
              <TableRow>
                <TableCell
                  colSpan={3}
                  className="text-right p-2 font-bold text-xs"
                >
                  {t("v2.common.total", "Tổng cộng")}:
                </TableCell>
                <TableCell className="text-center p-2 text-xs">—</TableCell>
                <TableCell className="text-right p-2 tabular-nums text-xs font-semibold">
                  {totalQty.toLocaleString("vi-VN")}
                </TableCell>
                <TableCell className="text-right p-2 text-xs">—</TableCell>
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
