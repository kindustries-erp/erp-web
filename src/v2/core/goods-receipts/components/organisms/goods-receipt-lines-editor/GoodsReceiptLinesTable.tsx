import * as React from "react";
import { Plus } from "lucide-react";
import {
  V2Button,
  DrawerSection,
  V2DrawerLinesTable,
  type V2DrawerLinesColumn,
} from "@/v2/shared/components";
import {
  GOODS_RECEIPT_DEFAULT_UNIT,
  createGoodsReceiptClientKey,
  calcGoodsReceiptLineAmount,
  sumGoodsReceiptLineAmounts,
  sumGoodsReceiptLineQuantities,
} from "@/v2/core/goods-receipts";
import type { GoodsReceiptFormLine } from "@/v2/core/goods-receipts";
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

  const layoutColumns: V2DrawerLinesColumn[] = visibleColumns.map((col) => ({
    id: col.id,
    header: col.headerKey ? t(col.headerKey, col.defaultHeader) : "",
    ...col.layout,
  }));

  const renderCell = (
    column: V2DrawerLinesColumn,
    line: GoodsReceiptFormLine,
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
      <V2DrawerLinesTable<GoodsReceiptFormLine>
        ariaLabel={t(
          "v2.goodsReceipts.lines.title",
          "Chi tiết phụ tùng nhập kho",
        )}
        columns={layoutColumns}
        rows={lines}
        getRowKey={(line, idx) => line.clientKey ?? line.id ?? `row-${idx}`}
        renderCell={renderCell}
        footerLabel={`${t("v2.common.total", "Tổng cộng")}:`}
        footerCells={{
          unit: "—",
          qtyReceived: totalQty.toLocaleString("vi-VN"),
          unitCost: "—",
          amount: totalAmount.toLocaleString("vi-VN"),
        }}
        emptyLabel={t(
          "v2.goodsReceipts.lines.noParts",
          "Chưa có phụ tùng nào trong phiếu nhập",
        )}
      />
    </DrawerSection>
  );
}
