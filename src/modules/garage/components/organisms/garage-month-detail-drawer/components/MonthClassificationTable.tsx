import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { V2StandardTable } from "@/v2/shared/components/organisms/v2-standard-table";
import type {
  MonthClassificationRow,
  MonthClassificationTableProps,
} from "./MonthClassificationTable.type";
import { createMonthClassificationColumns } from "./MonthClassificationTable.columns";

export function MonthClassificationTable({
  rows,
  debtType,
  tableId,
  onSelectClassification,
}: MonthClassificationTableProps) {
  const { t } = useTranslation("garage");
  const isReceivable = debtType === "receivables";

  const columns = useMemo(
    () =>
      createMonthClassificationColumns({
        isReceivable,
        onSelectClassification,
      }),
    [isReceivable, onSelectClassification],
  );

  return (
    <div className="w-full min-w-0">
      <V2StandardTable<MonthClassificationRow>
        tableId={tableId}
        mode="client"
        columns={columns}
        items={rows}
        getRowKey={(row) => row.key}
        initialQuery={{ pageSize: 10, page: 1 }}
        emptyLabel={t(
          "progress.classificationEmpty",
          "Không tìm thấy phân loại phù hợp bộ lọc",
        )}
        containerClassName="max-h-[360px] overflow-x-auto overflow-y-auto"
      />
    </div>
  );
}
