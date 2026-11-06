import * as React from "react";
import { Plus } from "lucide-react";
import { V2Button } from "@/v2/shared/components";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/v2/shared/ui/table";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import {
  emptyProcurementLine,
  procurementLineAmount,
  type ProcurementLineFormValue,
} from "../../../form/procurementLine.form";
import {
  getProcurementLineColumns,
  type ProcurementLineColumn,
} from "./ProcurementLinesEditor.columns";
import { ProcurementLineRow } from "./ProcurementLineRow";

export interface ProcurementLinesEditorProps {
  lines: ProcurementLineFormValue[];
  onChange: (lines: ProcurementLineFormValue[]) => void;
  viewing: boolean;
  priceLabel: string;
  errorText?: string;
}

/** Bảng dòng chứng từ PR/PO chuẩn V2: dùng Table và array config, đồng bộ kiến trúc với GoodsReceiptLinesTable. */
export function ProcurementLinesEditor({
  lines,
  onChange,
  viewing,
  priceLabel,
  errorText,
}: ProcurementLinesEditorProps) {
  const { t } = useV2Translation();
  const patch = (key: string, ch: Partial<ProcurementLineFormValue>) =>
    onChange(lines.map((l) => (l.key === key ? { ...l, ...ch } : l)));

  const typeOptions = [
    { value: "GOODS", label: t("v2.procurement.lines.goods", "Hàng hóa") },
    { value: "SERVICE", label: t("v2.procurement.lines.service", "Dịch vụ") },
  ];

  const columns: ProcurementLineColumn[] = React.useMemo(
    () => getProcurementLineColumns(priceLabel),
    [priceLabel],
  );

  const visibleColumns = React.useMemo(
    () => columns.filter((col) => !viewing || !col.hideWhenViewing),
    [columns, viewing],
  );

  const totalQty = React.useMemo(
    () => lines.reduce((sum, l) => sum + (Number(l.qty) || 0), 0),
    [lines],
  );

  const totalAmount = React.useMemo(
    () => lines.reduce((sum, l) => sum + (procurementLineAmount(l) ?? 0), 0),
    [lines],
  );

  const qtyIndex = visibleColumns.findIndex((col) => col.id === "qty");
  const prefixSpan = qtyIndex > 0 ? qtyIndex : 4;
  const amountIndex = visibleColumns.findIndex((col) => col.id === "amount");
  const suffixSpan =
    amountIndex >= 0 ? visibleColumns.length - (amountIndex + 1) : 0;

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto rounded border border-border">
        <Table className="w-full text-xs">
          <TableHeader>
            <TableRow className="bg-muted/50 border-b border-border text-muted-fg font-medium">
              {visibleColumns.map((col) => (
                <TableHead key={col.id} className={col.headerClassName}>
                  {col.headerKey
                    ? t(col.headerKey, col.defaultHeader)
                    : col.defaultHeader}
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
                    "v2.procurement.lines.empty",
                    "Chưa có dòng hàng nào trong chứng từ",
                  )}
                </TableCell>
              </TableRow>
            ) : (
              lines.map((line, idx) => (
                <ProcurementLineRow
                  key={line.key}
                  line={line}
                  index={idx}
                  viewing={viewing}
                  priceLabel={priceLabel}
                  canRemove={lines.length > 1}
                  typeOptions={typeOptions}
                  visibleColumns={visibleColumns}
                  onPatch={(ch) => patch(line.key, ch)}
                  onRemove={() =>
                    onChange(lines.filter((l) => l.key !== line.key))
                  }
                />
              ))
            )}
          </TableBody>
          {lines.length > 0 && (
            <TableFooter className="bg-muted/40 font-semibold border-t border-border">
              <TableRow>
                <TableCell
                  colSpan={prefixSpan}
                  className="text-right p-2 font-bold text-xs"
                >
                  {t("v2.common.total", "Tổng cộng")}:
                </TableCell>
                <TableCell className="text-right p-2 tabular-nums text-xs font-semibold">
                  {totalQty.toLocaleString("vi-VN", {
                    maximumFractionDigits: 3,
                  })}
                </TableCell>
                <TableCell className="text-right p-2 text-xs">—</TableCell>
                <TableCell className="text-right p-2 tabular-nums font-bold text-primary text-xs">
                  {totalAmount.toLocaleString("vi-VN", {
                    maximumFractionDigits: 3,
                  })}
                </TableCell>
                {suffixSpan > 0 && (
                  <TableCell colSpan={suffixSpan} className="p-2" />
                )}
              </TableRow>
            </TableFooter>
          )}
        </Table>
      </div>

      {errorText && <p className="text-sm text-destructive">{errorText}</p>}

      {!viewing && (
        <V2Button
          variant="outline"
          size="sm"
          onClick={() => onChange([...lines, emptyProcurementLine()])}
        >
          <Plus className="mr-1 h-4 w-4" />
          {t("v2.procurement.lines.add", "Thêm dòng")}
        </V2Button>
      )}
    </div>
  );
}
