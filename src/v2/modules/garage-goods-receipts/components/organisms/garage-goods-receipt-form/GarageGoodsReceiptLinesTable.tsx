import * as React from "react";
import { Plus } from "lucide-react";
import { V2Button } from "@/v2/shared/components/atoms";
import { DrawerSection } from "@/v2/shared/components/molecules/v2-drawer-section";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/v2/shared/ui/table";
import type { GarageGoodsReceiptFormLine } from "@/v2/modules/garage-goods-receipts/domain/entities/garageGoodsReceipt";
import { GarageGoodsReceiptLineRow } from "./GarageGoodsReceiptLineRow";
import { GARAGE_GOODS_RECEIPT_LINES_COLUMNS } from "./GarageGoodsReceiptLinesTable.columns";

interface LinesTableProps {
  lines: GarageGoodsReceiptFormLine[];
  viewing: boolean;
  t: (key: string, fallback?: string) => string;
  onChangeLines: (lines: GarageGoodsReceiptFormLine[]) => void;
}

export function GarageGoodsReceiptLinesTable({
  lines,
  viewing,
  t,
  onChangeLines,
}: LinesTableProps) {
  const visibleColumns = GARAGE_GOODS_RECEIPT_LINES_COLUMNS.filter(
    (col) => !viewing || !col.hideWhenViewing,
  );

  const handleAddLine = () => {
    const newLine: GarageGoodsReceiptFormLine = {
      itemCode: "",
      itemName: "",
      unit: "Cái",
      qtyReceived: "1",
      unitCost: "0",
      amount: "0",
      notes: "",
    };
    onChangeLines([...lines, newLine]);
  };

  const handleUpdateLine = (
    index: number,
    field: keyof GarageGoodsReceiptFormLine,
    val: string,
  ) => {
    const next = [...lines];
    const current = { ...next[index], [field]: val };

    if (field === "qtyReceived" || field === "unitCost") {
      const q =
        Number(field === "qtyReceived" ? val : current.qtyReceived) || 0;
      const c = Number(field === "unitCost" ? val : current.unitCost) || 0;
      current.amount = String(q * c);
    }
    next[index] = current;
    onChangeLines(next);
  };

  const handleRemoveLine = (index: number) => {
    onChangeLines(lines.filter((_, i) => i !== index));
  };

  const totalQty = React.useMemo(
    () => lines.reduce((acc, l) => acc + (Number(l.qtyReceived) || 0), 0),
    [lines],
  );

  const totalAmount = React.useMemo(
    () => lines.reduce((acc, l) => acc + (Number(l.amount) || 0), 0),
    [lines],
  );

  return (
    <DrawerSection
      title={t(
        "v2.garageGoodsReceipts.form.partsList",
        "Chi tiết phụ tùng nhập kho",
      )}
      count={lines.length}
      titleExtra={
        !viewing && (
          <V2Button variant="outline" size="sm" onClick={handleAddLine}>
            <Plus className="w-3.5 h-3.5 mr-1" />
            {t("v2.garageGoodsReceipts.form.addPart", "Thêm phụ tùng")}
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
                    "v2.garageGoodsReceipts.form.noParts",
                    "Chưa có phụ tùng nào trong phiếu nhập",
                  )}
                </TableCell>
              </TableRow>
            ) : (
              lines.map((l, idx) => (
                <GarageGoodsReceiptLineRow
                  key={idx}
                  line={l}
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
