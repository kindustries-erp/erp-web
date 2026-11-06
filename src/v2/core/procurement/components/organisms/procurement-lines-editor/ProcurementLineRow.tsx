import { TableCell, TableRow } from "@/v2/shared/ui/table";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import type { ProcurementLineFormValue } from "../../../form/procurementLine.form";
import type {
  ProcurementLineColumn,
  ProcurementLineColumnContext,
} from "./ProcurementLinesEditor.columns";

export interface ProcurementLineRowProps {
  line: ProcurementLineFormValue;
  index: number;
  viewing: boolean;
  priceLabel: string;
  canRemove: boolean;
  typeOptions: { value: string; label: string }[];
  visibleColumns: ProcurementLineColumn[];
  onPatch: (change: Partial<ProcurementLineFormValue>) => void;
  onRemove: () => void;
}

/** Dòng chi tiết PR/PO dùng thẻ TableCell chuẩn V2, render dựa trên mảng config cột. */
export function ProcurementLineRow({
  visibleColumns,
  ...rest
}: ProcurementLineRowProps) {
  const { t } = useV2Translation();
  const context: ProcurementLineColumnContext = {
    ...rest,
    t,
  };

  return (
    <TableRow className="border-b border-border hover:bg-muted/30">
      {visibleColumns.map((col) => (
        <TableCell key={col.id} className={col.cellClassName}>
          {col.renderCell(context)}
        </TableCell>
      ))}
    </TableRow>
  );
}
