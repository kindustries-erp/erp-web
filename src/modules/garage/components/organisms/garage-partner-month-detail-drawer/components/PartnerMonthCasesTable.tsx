import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  DataTable,
  createColumnHeaderFilter,
} from "@/shared/components/DataTable";
import { money } from "@/shared/utils/format";
import { cn } from "@/shared/utils";
import { Eye, Pencil, Scale, Link2 } from "lucide-react";
import { extractCaseFinancials } from "../GaragePartnerMonthDetailDrawer.helper";
import { createPartnerMonthCasesColumns } from "./PartnerMonthCasesTable.columns";

interface PartnerMonthCasesTableProps {
  cases: any[];
  debtType: "receivables" | "payables";
  tableHook: any;
  onOpenCaseDetail?: (caseCode: string, editMode?: boolean) => void;
  onOpenSettlementModal?: (caseItem: any) => void;
  onOpenInvoiceLinkingModal?: (caseItem: any) => void;
}

export const PartnerMonthCasesTable: React.FC<PartnerMonthCasesTableProps> = ({
  cases,
  debtType,
  tableHook,
  onOpenCaseDetail,
  onOpenSettlementModal,
  onOpenInvoiceLinkingModal,
}) => {
  const { t } = useTranslation(["garage", "debts", "common"]);
  const isPayable = debtType === "payables";

  const headerFilter = useMemo(
    () =>
      createColumnHeaderFilter({
        listHook: tableHook,
        items: cases,
        defaultAlign: "center",
      }),
    [tableHook, cases],
  );

  const columns = useMemo(
    () =>
      createPartnerMonthCasesColumns({
        headerFilter,
        isPayable,
        onOpenCaseDetail,
        t,
      }),
    [headerFilter, isPayable, onOpenCaseDetail, t],
  );

  const summaryRow = useMemo(() => {
    let billed = 0;
    let paid = 0;
    let remaining = 0;
    cases.forEach((c) => {
      const f = extractCaseFinancials(c, isPayable);
      billed += f.billed;
      paid += f.paid;
      remaining += f.remaining;
    });
    return {
      index: (
        <span className="font-bold text-center block text-muted-foreground">
          Σ
        </span>
      ),
      soChungTu: (
        <span className="font-bold text-xs">{cases.length} vụ việc</span>
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
    };
  }, [cases, isPayable]);

  return (
    <DataTable
      tableId={`garage-partner-month-cases-${debtType}`}
      variant="spreadsheet"
      items={cases}
      columns={columns}
      summaryRow={summaryRow}
      enableColumnResizing={true}
      emptyLabel={t("cases.empty", "Không có vụ việc nào trong tháng")}
      rowHoverActions={(row: any) => [
        {
          groupLabel: "TRA CỨU",
          items: [
            {
              label: "Xem chi tiết vụ việc",
              icon: <Eye className="w-3.5 h-3.5" />,
              onClick: () => onOpenCaseDetail?.(row.soChungTu || row.id, false),
              quickAction: true,
            },
            {
              label: "Chỉnh sửa vụ việc",
              icon: <Pencil className="w-3.5 h-3.5" />,
              onClick: () => onOpenCaseDetail?.(row.soChungTu || row.id, true),
            },
          ],
        },
        {
          groupLabel: "THAO TÁC",
          items: [
            {
              label: "Cấn trừ sao kê",
              icon: <Scale className="w-3.5 h-3.5" />,
              onClick: () => onOpenSettlementModal?.(row),
            },
            {
              label: "Liên kết hóa đơn",
              icon: <Link2 className="w-3.5 h-3.5" />,
              onClick: () => onOpenInvoiceLinkingModal?.(row),
            },
          ],
        },
      ]}
    />
  );
};
