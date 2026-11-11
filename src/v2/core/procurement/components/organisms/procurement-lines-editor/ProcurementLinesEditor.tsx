import * as React from "react";
import { Plus } from "lucide-react";
import {
  V2Button,
  DrawerSection,
  V2DrawerLinesTable,
  type V2DrawerLinesColumn,
} from "@/v2/shared/components";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import {
  emptyProcurementLine,
  procurementLineAmount,
  type ProcurementLineFormValue,
} from "../../../form/procurementLine.form";
import {
  getProcurementLineColumns,
  type ProcurementLineColumn,
  type ProcurementLineColumnContext,
} from "./ProcurementLinesEditor.columns";

export interface ProcurementLinesEditorProps {
  lines: ProcurementLineFormValue[];
  onChange: (lines: ProcurementLineFormValue[]) => void;
  viewing: boolean;
  priceLabel: string;
  errorText?: string;
  title?: React.ReactNode;
  addButtonLabel?: string;
  /** Khóa thêm/xóa dòng (dòng do đề nghị mua điền sẵn). Vẫn sửa được nội dung dòng. */
  lockLines?: boolean;
  /** Đánh dấu cột Mã là bắt buộc (đơn mua Garage) */
  itemCodeRequired?: boolean;
}

/** Bảng dòng chứng từ PR/PO chuẩn V2: dùng V2DrawerLinesTable (table-fixed, cuộn, header không xuống dòng). */
export function ProcurementLinesEditor({
  lines,
  onChange,
  viewing,
  priceLabel,
  errorText,
  title,
  addButtonLabel,
  lockLines = false,
  itemCodeRequired = false,
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
    () =>
      columns.filter(
        (col) =>
          (!viewing || !col.hideWhenViewing) &&
          !(lockLines && col.id === "actions"),
      ),
    [columns, viewing, lockLines],
  );
  const canEditLines = !viewing && !lockLines;

  const layoutColumns: V2DrawerLinesColumn[] = React.useMemo(
    () =>
      visibleColumns.map((col) => ({
        id: col.id,
        header: col.headerKey
          ? t(col.headerKey, col.defaultHeader)
          : col.defaultHeader,
        ...col.layout,
      })),
    [visibleColumns, t],
  );

  const totalQty = React.useMemo(
    () => lines.reduce((sum, l) => sum + (Number(l.qty) || 0), 0),
    [lines],
  );

  const totalAmount = React.useMemo(
    () => lines.reduce((sum, l) => sum + (procurementLineAmount(l) ?? 0), 0),
    [lines],
  );

  const renderCell = (
    column: V2DrawerLinesColumn,
    line: ProcurementLineFormValue,
    index: number,
  ) => {
    const def = visibleColumns.find((col) => col.id === column.id);
    if (!def) return null;
    const context: ProcurementLineColumnContext = {
      line,
      index,
      viewing,
      priceLabel,
      canRemove: lines.length > 1,
      typeOptions,
      onPatch: (ch) => patch(line.key, ch),
      onRemove: () => onChange(lines.filter((l) => l.key !== line.key)),
      t,
    };
    return def.renderCell(context);
  };

  return (
    <DrawerSection
      title={title ?? t("v2.procurement.sections.lines", "Dòng hàng")}
      count={lines.length}
      titleExtra={
        canEditLines && (
          <V2Button
            variant="outline"
            size="sm"
            onClick={() => onChange([...lines, emptyProcurementLine()])}
          >
            <Plus className="w-3.5 h-3.5 mr-1" />
            {addButtonLabel ?? t("v2.procurement.lines.add", "Thêm dòng")}
          </V2Button>
        )
      }
    >
      <V2DrawerLinesTable<ProcurementLineFormValue>
        ariaLabel={t("v2.procurement.sections.lines", "Dòng hàng")}
        columns={layoutColumns.map((col) =>
          col.id === "itemCode" && itemCodeRequired && !viewing
            ? {
                ...col,
                header: (
                  <>
                    {col.header}
                    <span className="text-destructive"> *</span>
                  </>
                ),
              }
            : col,
        )}
        rows={lines}
        getRowKey={(line) => line.key}
        renderCell={renderCell}
        footerLabel={t("v2.common.total", "Tổng cộng") + ":"}
        footerCells={{
          qty: totalQty.toLocaleString("vi-VN", { maximumFractionDigits: 3 }),
          price: "—",
          amount: totalAmount.toLocaleString("vi-VN", {
            maximumFractionDigits: 3,
          }),
        }}
        emptyLabel={t(
          "v2.procurement.lines.empty",
          "Chưa có dòng hàng nào trong chứng từ",
        )}
      />

      {errorText && (
        <p className="mt-2 text-sm text-destructive">{errorText}</p>
      )}
    </DrawerSection>
  );
}
