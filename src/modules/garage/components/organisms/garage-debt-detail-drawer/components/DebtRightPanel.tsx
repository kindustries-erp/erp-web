import React from "react";
import { AlertTriangle } from "lucide-react";
import { DrawerSection } from "@/v2/shared/components/molecules/v2-drawer-section";
import { useTranslation } from "react-i18next";
import { DebtPayerKpiGrid } from "./DebtPayerKpiGrid";
import { DebtCostPayableKpiCard } from "./DebtCostPayableKpiCard";
import type {
  GarageTrendItem,
  MonthlyReceivablesSummary,
  ReceivablesVatWarningSummary,
} from "@/modules/garage/api/garageDashboardApi";

export interface DebtRightPanelProps {
  item: GarageTrendItem;
  breakdownSummary?: MonthlyReceivablesSummary;
  vatWarningInfo?: ReceivablesVatWarningSummary;
  isReceipt: boolean;
}

/** Panel phải của drawer công nợ: cảnh báo VAT, cơ cấu thu KH/BH, chi phí & còn nợ. Dùng chung cho tháng và mốc. */
export const DebtRightPanel: React.FC<DebtRightPanelProps> = ({
  item,
  breakdownSummary,
  vatWarningInfo,
  isReceipt,
}) => {
  const { t } = useTranslation(["garage", "common"]);

  return (
    <div className="flex flex-col gap-2.5 w-full">
      {vatWarningInfo?.hasVatWithoutInvoice && (
        <div className="flex items-center gap-2 px-2.5 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-300">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          <span className="leading-tight">
            <strong>Cảnh báo VAT:</strong> Có{" "}
            <strong>{vatWarningInfo.casesWithVatNoInvoiceCount}</strong> vụ việc
            chưa xuất hoặc đính kèm HĐĐT.
          </span>
        </div>
      )}

      {isReceipt && breakdownSummary && (
        <DrawerSection
          title={t(
            "progress.sections.payerComposition",
            "Cơ cấu Thu KH vs Thu BH",
          )}
          collapsible
          defaultCollapsed={false}
        >
          <DebtPayerKpiGrid summary={breakdownSummary} />
        </DrawerSection>
      )}

      <DrawerSection
        title={t(
          "progress.sections.costAndPayables",
          "Chi phí phát sinh & Còn nợ",
        )}
        collapsible
        defaultCollapsed={false}
      >
        <DebtCostPayableKpiCard item={item} />
      </DrawerSection>
    </div>
  );
};
