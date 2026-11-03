import * as React from "react";
import { TableCell, TableRow } from "@/v2/shared/ui/table";
import {
  GARAGE_GOODS_RECEIPT_LINES_COLUMNS,
  type LineColumnRenderContext,
} from "./GarageGoodsReceiptLinesTable.columns";

export function GarageGoodsReceiptLineRow(props: LineColumnRenderContext) {
  const visibleColumns = GARAGE_GOODS_RECEIPT_LINES_COLUMNS.filter(
    (col) => !props.viewing || !col.hideWhenViewing,
  );

  return (
    <TableRow className="border-b border-border hover:bg-muted/30">
      {visibleColumns.map((col) => (
        <TableCell key={col.id} className={col.cellClassName}>
          {col.renderCell(props)}
        </TableCell>
      ))}
    </TableRow>
  );
}
