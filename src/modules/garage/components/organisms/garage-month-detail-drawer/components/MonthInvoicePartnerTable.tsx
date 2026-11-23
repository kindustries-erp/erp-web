import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { V2StandardTable } from "@/v2/shared/components/organisms/v2-standard-table";
import type { MonthlyReceivablesGroupItem } from "../../../../api/garageDashboardApi";
import type { MonthInvoiceCaseRow } from "./MonthInvoiceCaseRow.type";
import { flattenReceivablesGroupsToCases } from "./MonthInvoiceCaseRow.helper";
import { useInvoiceCaseColumns } from "./MonthInvoiceCaseTable.columns";

export interface MonthInvoicePartnerTableProps {
  items: MonthlyReceivablesGroupItem[];
  tableId: string;
  totalBilled?: number;
  debtType?: "receivables" | "payables";
  emptyLabel?: string;
  onSelectGroup?: (group: MonthlyReceivablesGroupItem) => void;
  onOpenCaseDetail?: (caseCode: string) => void;
}

export const MonthInvoicePartnerTable: React.FC<
  MonthInvoicePartnerTableProps
> = ({
  items,
  tableId,
  totalBilled = 0,
  debtType = "receivables",
  emptyLabel,
  onSelectGroup,
  onOpenCaseDetail,
}) => {
  const { t } = useTranslation("garage");

  // Làm phẳng groups thành danh sách từng phiếu dịch vụ / xe
  const caseRows = useMemo(
    () => flattenReceivablesGroupsToCases(items, totalBilled, debtType),
    [items, totalBilled, debtType],
  );

  const columns = useInvoiceCaseColumns({
    debtType,
    onOpenCaseDetail,
    onSelectGroup,
  });

  return (
    <div className="w-full min-w-0">
      <V2StandardTable<MonthInvoiceCaseRow>
        tableId={tableId}
        mode="client"
        columns={columns}
        items={caseRows}
        getRowKey={(row: MonthInvoiceCaseRow) => row.id}
        initialQuery={{ pageSize: 10, page: 1 }}
        emptyLabel={
          emptyLabel ||
          t("progress.partnerTableEmpty", "Không có đối tượng hóa đơn")
        }
        containerClassName="max-h-[360px] overflow-x-auto overflow-y-auto"
      />
    </div>
  );
};

export const MonthInvoiceCaseTable = MonthInvoicePartnerTable;
