import React from "react";
import { money } from "@/shared/utils/format";
import { TableDateCell } from "@/shared/components/DataTable/TableDateCell";
import type { GarageCaseDetailRow } from "./GarageCasesTableTab.type";

interface GarageVehicleCasesExpandedProps {
  row: GarageCaseDetailRow;
  onOpenCaseDetail?: (caseCode: string) => void;
  showProfitMetrics?: boolean;
  t: (key: string, fallback: string) => string;
}

/** Danh sách từng lệnh của một xe, hiển thị khi mở rộng hàng xe. */
export const GarageVehicleCasesExpanded: React.FC<
  GarageVehicleCasesExpandedProps
> = ({ row, onOpenCaseDetail, showProfitMetrics = false, t }) => (
  <div
    className="flex flex-col gap-1 px-3 py-2 bg-muted/30"
    data-testid="vehicle-cases-expanded"
  >
    {(row.childCases ?? []).map((c) => (
      <div
        key={c.rowKey}
        className="grid grid-cols-[130px_95px_1fr_auto_auto] items-center gap-3 text-xs"
      >
        <button
          type="button"
          className="font-mono font-bold text-primary text-left hover:underline"
          onClick={() => onOpenCaseDetail?.(c.soChungTu || c.id)}
        >
          {c.soChungTu}
        </button>
        <TableDateCell date={c.ngayHoanThanh} format="date" />
        <span className="truncate text-muted-foreground">
          {c.serviceStatus ?? ""}
        </span>
        <span className="font-mono tabular-nums">{money(c.billed)}</span>
        <span className="font-mono tabular-nums text-muted-foreground">
          {showProfitMetrics
            ? `${t("cases.columns.profit", "Lợi nhuận gộp")}: ${money(c.profit ?? 0)}`
            : ""}
        </span>
      </div>
    ))}
  </div>
);
