import React from "react";
import { AlertTriangle } from "lucide-react";
import { DrawerSection } from "@/shared/components/DrawerModal";
import { useTranslation } from "react-i18next";
import { MonthPayerKpiGrid } from "../../garage-month-detail-drawer/components/MonthPayerKpiGrid";
import { MonthCostPayableKpiCard } from "../../garage-month-detail-drawer/components/MonthCostPayableKpiCard";
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
    <div className="flex flex-col gap-3.5 w-full">
      {vatWarningInfo?.hasVatWithoutInvoice && (
        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 text-xs shadow-sm">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex flex-col gap-0.5">
            <span className="font-bold">Cảnh báo hóa đơn VAT:</span>
            <span>
              Có <strong>{vatWarningInfo.casesWithVatNoInvoiceCount}</strong> vụ
              việc chưa xuất hoặc đính kèm hóa đơn điện tử.
            </span>
          </div>
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
          <MonthPayerKpiGrid summary={breakdownSummary} />
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
        <MonthCostPayableKpiCard item={item} />
      </DrawerSection>
    </div>
  );
};
