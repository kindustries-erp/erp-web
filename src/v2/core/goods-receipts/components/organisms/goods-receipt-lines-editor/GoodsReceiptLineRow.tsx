import { TableCell, TableRow } from "@/v2/shared/ui/table";
import { GOODS_RECEIPT_LINES_COLUMNS } from "./GoodsReceiptLinesTable.columns";
import type { LineColumnRenderContext } from "./GoodsReceiptLinesTable.type";

export function GoodsReceiptLineRow(props: LineColumnRenderContext) {
  const visibleColumns = GOODS_RECEIPT_LINES_COLUMNS.filter(
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
