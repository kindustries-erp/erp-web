import React from "react";
import { useTranslation } from "react-i18next";
import { DrawerSection } from "@/shared/components/DrawerModal";
import { MonthClassificationTable } from "../../garage-month-detail-drawer/components/MonthClassificationTable";
import type { MonthClassificationRow } from "../../garage-month-detail-drawer/components/MonthClassificationTable.type";

export interface DebtClassificationTabProps {
  receivableRows: MonthClassificationRow[];
  payableRows: MonthClassificationRow[];
  totalBilled: number;
  totalCost: number;
  onSelectClassification: (row: MonthClassificationRow) => void;
}

/** Tab "Phân loại Nghiệp vụ": bảng phải thu và bảng phải trả theo phân loại. Dùng chung cho tháng và mốc. */
export const DebtClassificationTab: React.FC<DebtClassificationTabProps> = ({
  receivableRows,
  payableRows,
  totalBilled,
  totalCost,
  onSelectClassification,
}) => {
  const { t } = useTranslation(["garage", "common"]);

  return (
    <div className="space-y-4">
      <DrawerSection
        title={t(
          "progress.sections.receivableClassification",
          "Bảng Phải thu theo nghiệp vụ",
        )}
        titleExtra={`${receivableRows.length}/${receivableRows.length} phân loại`}
        collapsible
        defaultCollapsed={false}
      >
        <MonthClassificationTable
          rows={receivableRows}
          debtType="receivables"
          totalBilled={totalBilled}
          tableId="garage-debt-detail-receivables-table"
          onSelectClassification={onSelectClassification}
        />
      </DrawerSection>
      <DrawerSection
        title={t(
          "progress.sections.payableClassification",
          "Bảng Phải trả theo chi phí",
        )}
        titleExtra={`${payableRows.length}/${payableRows.length} phân loại`}
        collapsible
        defaultCollapsed={false}
      >
        <MonthClassificationTable
          rows={payableRows}
          debtType="payables"
          totalBilled={totalCost}
          tableId="garage-debt-detail-payables-table"
          onSelectClassification={onSelectClassification}
        />
      </DrawerSection>
    </div>
  );
};
