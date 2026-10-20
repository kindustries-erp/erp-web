import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { DataTable } from "@/shared/components/DataTable";
import { money } from "@/shared/utils/format";
import { cn } from "@/shared/utils";
import { getPartnerClassificationColumns } from "./PartnerMonthClassificationTable.columns";
import type { PartnerClassificationRow } from "../GaragePartnerMonthDetailDrawer.type";

interface PartnerMonthClassificationTableProps {
  rows: PartnerClassificationRow[];
  debtType: "receivables" | "payables";
  totalBilled: number;
}

export const PartnerMonthClassificationTable: React.FC<
  PartnerMonthClassificationTableProps
> = ({ rows, debtType, totalBilled }) => {
  const { t } = useTranslation(["garage", "debts", "common"]);
  const isPayable = debtType === "payables";

  const columns = useMemo(
    () => getPartnerClassificationColumns(isPayable, t),
    [isPayable, t],
  );

  const summaryRow = useMemo(() => {
    let billed = 0;
    let paid = 0;
    let remaining = 0;
    let withInv = 0;
    let noInv = 0;
    rows.forEach((r) => {
      billed += r.billed;
      paid += r.paid;
      remaining += r.remaining;
      withInv += r.remainingWithInvoice;
      noInv += r.remainingNoInvoice;
    });
    return {
      name: (
        <span className="font-bold text-xs">
          Tổng ({rows.length} phân loại)
        </span>
      ),
      billed: (
        <span className="font-bold text-right block font-mono text-xs">
          {money(billed)}
        </span>
      ),
      paid: (
        <span className="font-bold text-right block font-mono text-xs text-emerald-600 dark:text-emerald-400">
          {money(paid)}
        </span>
      ),
      remaining: (
        <span
          className={cn(
            "font-bold text-right block font-mono text-xs",
            remaining > 0
              ? isPayable
                ? "text-orange-600 dark:text-orange-400"
                : "text-amber-600 dark:text-amber-400"
              : "text-muted-foreground/60",
          )}
        >
          {remaining > 0 ? money(remaining) : "—"}
        </span>
      ),
      remainingWithInvoice: (
        <span className="text-right block font-mono text-xs">
          {withInv > 0 ? money(withInv) : "—"}
        </span>
      ),
      remainingNoInvoice: (
        <span className="text-right block font-mono text-xs">
          {noInv > 0 ? money(noInv) : "—"}
        </span>
      ),
      shareRate: (
        <span className="text-center block font-bold text-xs">
          {totalBilled > 0 ? "100%" : "0%"}
        </span>
      ),
    };
  }, [rows, isPayable, totalBilled]);

  return (
    <DataTable
      tableId={`garage-partner-month-classification-${debtType}`}
      variant="spreadsheet"
      items={rows}
      columns={columns}
      summaryRow={summaryRow}
      enableColumnResizing={true}
      emptyLabel={t("cases.emptyClassification", "Chưa có dữ liệu phân loại")}
    />
  );
};
