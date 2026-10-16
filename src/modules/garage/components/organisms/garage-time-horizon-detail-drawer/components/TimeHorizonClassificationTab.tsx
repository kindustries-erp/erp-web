import React from "react";
import { useTranslation } from "react-i18next";
import { DrawerSection } from "@/shared/components/DrawerModal";
import { MonthClassificationTable } from "@/modules/garage/components/organisms/garage-month-detail-drawer/components/MonthClassificationTable";
import type { MonthClassificationRow } from "@/modules/garage/components/organisms/garage-month-detail-drawer/components/MonthClassificationTable.type";

export interface TimeHorizonClassificationTabProps {
  receivableRows: MonthClassificationRow[];
  payableRows: MonthClassificationRow[];
  totalBilled: number;
  totalCost: number;
  onSelectClassification: (row: MonthClassificationRow) => void;
}

export const TimeHorizonClassificationTab: React.FC<
  TimeHorizonClassificationTabProps
> = ({
  receivableRows,
  payableRows,
  totalBilled,
  totalCost,
  onSelectClassification,
}) => {
  const { t } = useTranslation(["garage", "common"]);

  return (
    <div className="space-y-4">
      {/* 1. Bảng Phải thu theo nghiệp vụ */}
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
          tableId="garage-horizon-detail-receivables-table"
          onSelectClassification={onSelectClassification}
        />
      </DrawerSection>

      {/* 2. Bảng Phải trả theo chi phí */}
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
          tableId="garage-horizon-detail-payables-table"
          onSelectClassification={onSelectClassification}
        />
      </DrawerSection>
    </div>
  );
};
