import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Layers } from "lucide-react";
import { DataTable } from "@/shared/components/DataTable";
import type { ClassificationTableRow } from "../types";
import {
  getFunnelTableColumns,
  getFunnelSummaryRow,
} from "../utils/funnelTableColumns";

interface FunnelSpreadsheetTableProps {
  tableRows: ClassificationTableRow[];
  totalIntake: { count: number; amount: number };
  inProgress: { count: number; amount: number };
  completed: { count: number; amount: number; rate?: number };
  cancelled: { count: number; amount: number };
}

export function FunnelSpreadsheetTable({
  tableRows,
  totalIntake,
  inProgress,
  completed,
  cancelled,
}: FunnelSpreadsheetTableProps) {
  const { t } = useTranslation("garage");

  const columns = useMemo(() => getFunnelTableColumns(t), [t]);

  const summaryRow = useMemo(
    () => getFunnelSummaryRow(t, totalIntake, inProgress, completed, cancelled),
    [t, totalIntake, inProgress, completed, cancelled],
  );

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h5 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-primary" />
          <span>
            {t(
              "dashboard.funnel.tableTitle",
              "Chi tiết Phễu Chuyển Đổi theo 4 Phân Loại ERP",
            )}
          </span>
        </h5>
        <span className="text-[11px] text-muted-foreground">
          {t(
            "dashboard.funnel.tableDesc",
            "Phân loại chuẩn: Sửa chữa chung • Ký gửi/Nội bộ • OJ Ngoài • Khác",
          )}
        </span>
      </div>

      <DataTable
        items={tableRows}
        getRowKey={(item) => item.id}
        variant="spreadsheet"
        columns={columns}
        summaryRow={summaryRow}
        emptyLabel={t(
          "dashboard.funnel.noFunnelData",
          "Chưa có dữ liệu phân loại trong kỳ",
        )}
        enableColumnResizing={true}
      />
    </div>
  );
}
