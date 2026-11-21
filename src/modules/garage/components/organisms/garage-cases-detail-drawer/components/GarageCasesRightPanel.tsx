import React from "react";
import { AlertTriangle } from "lucide-react";
import { DrawerSection } from "@/v2/shared/components/molecules/v2-drawer-section";
import { useTranslation } from "react-i18next";
import type { PnlSummaryData } from "./DebtPnlKpiCard";
import { DebtPayerKpiGrid } from "../../garage-debt-detail-drawer/components/DebtPayerKpiGrid";
import { DebtCostPayableKpiCard } from "../../garage-debt-detail-drawer/components/DebtCostPayableKpiCard";
import { GarageVehicleProgressRightPanel } from "./GarageVehicleProgressRightPanel";
import type { GarageCaseDetailRow } from "./GarageCasesTableTab.type";
import type {
  GarageTrendItem,
  MonthlyReceivablesSummary,
  ReceivablesVatWarningSummary,
  GarageCheckpointSummary,
} from "@/modules/garage/api/garageDashboardApi";

export interface GarageCasesRightPanelProps {
  item: GarageTrendItem;
  cases?: GarageCaseDetailRow[];
  pnlSummary?: PnlSummaryData;
  breakdownSummary?: MonthlyReceivablesSummary;
  vatWarningInfo?: ReceivablesVatWarningSummary;
  checkpointSummary?: GarageCheckpointSummary;
  isReceipt: boolean;
  showProfitMetrics?: boolean;
}

/** Panel phải đa năng: hiển thị Tiến độ xe & Hãng xe (khi checkpoint/dashboard) hoặc Cơ cấu & Chi phí (khi debt) */
export const GarageCasesRightPanel: React.FC<GarageCasesRightPanelProps> = ({
  item,
  cases,
  breakdownSummary,
  vatWarningInfo,
  isReceipt,
  showProfitMetrics = false,
}) => {
  const { t } = useTranslation(["garage", "debts", "common"]);

  return (
    <div className="flex flex-col gap-2.5 w-full">
      {/* Cảnh báo VAT */}
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

      {/* Chế độ Checkpoint / Vụ việc dịch vụ: Hiện Tiến độ xe, Top Hãng xe & Dòng tiền thực tế */}
      {showProfitMetrics ? (
        <GarageVehicleProgressRightPanel cases={cases} />
      ) : (
        /* Chế độ Công nợ/Tuổi nợ: Hiện cơ cấu đối tác & chi phí */
        <>
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
        </>
      )}
    </div>
  );
};
