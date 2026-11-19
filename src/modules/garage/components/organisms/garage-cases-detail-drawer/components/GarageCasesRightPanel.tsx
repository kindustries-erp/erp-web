import React from "react";
import { AlertTriangle } from "lucide-react";
import { DrawerSection } from "@/v2/shared/components/molecules/v2-drawer-section";
import { useTranslation } from "react-i18next";
import { DebtPnlKpiCard, type PnlSummaryData } from "./DebtPnlKpiCard";
import { DebtPayerKpiGrid } from "../../garage-debt-detail-drawer/components/DebtPayerKpiGrid";
import { DebtCostPayableKpiCard } from "../../garage-debt-detail-drawer/components/DebtCostPayableKpiCard";
import { Badge } from "@/v2/shared/ui/badge";
import { money } from "@/shared/utils/format";
import type {
  GarageTrendItem,
  MonthlyReceivablesSummary,
  ReceivablesVatWarningSummary,
  GarageCheckpointSummary,
} from "@/modules/garage/api/garageDashboardApi";

export interface GarageCasesRightPanelProps {
  item: GarageTrendItem;
  pnlSummary?: PnlSummaryData;
  breakdownSummary?: MonthlyReceivablesSummary;
  vatWarningInfo?: ReceivablesVatWarningSummary;
  checkpointSummary?: GarageCheckpointSummary;
  isReceipt: boolean;
  showProfitMetrics?: boolean;
}

/** Panel phải đa năng: hiển thị P&L & Tiến độ dòng tiền (khi checkpoint) hoặc Cơ cấu & Chi phí (khi debt) */
export const GarageCasesRightPanel: React.FC<GarageCasesRightPanelProps> = ({
  item,
  pnlSummary,
  breakdownSummary,
  vatWarningInfo,
  checkpointSummary,
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

      {/* Chế độ Checkpoint: Hiện P&L và Tiến độ dòng tiền */}
      {showProfitMetrics ? (
        <>
          <DrawerSection
            title={t(
              "progress.sections.pnlPerformance",
              "Hiệu quả kinh doanh (P&L)",
            )}
            collapsible
            defaultCollapsed={false}
          >
            <DebtPnlKpiCard summary={pnlSummary} />
          </DrawerSection>

          <DrawerSection
            title={t(
              "progress.sections.cashflowProgress",
              "Tiến độ Thu tiền & Công nợ",
            )}
            collapsible
            defaultCollapsed={false}
          >
            <div className="flex flex-col gap-2 w-full text-xs">
              <div className="flex items-center justify-between p-2 rounded-lg bg-surface border border-border/60">
                <span className="text-[11px] font-medium text-muted-foreground uppercase">
                  Tổng phải thu (Có VAT)
                </span>
                <span className="font-mono font-bold text-foreground tabular-nums">
                  {money(checkpointSummary?.totalTienCoThue || 0)}
                </span>
              </div>

              <div className="flex flex-col gap-1 p-2 rounded-lg bg-surface border border-border/60">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 uppercase">
                    Đã thu thực tế
                  </span>
                  <Badge
                    variant="outline"
                    className="text-[9px] px-1 py-0 border-emerald-500/30 text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 font-bold tabular-nums"
                  >
                    {(checkpointSummary?.collectionRate || 0).toFixed(1)}%
                  </Badge>
                </div>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                  {money(checkpointSummary?.totalPaid || 0)}
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-amber-500/5 border border-amber-500/20">
                <span className="text-[11px] font-medium text-amber-700 dark:text-amber-400 uppercase">
                  Còn nợ phải thu
                </span>
                <span className="font-mono font-bold text-amber-600 dark:text-amber-400 tabular-nums">
                  {money(checkpointSummary?.totalRemaining || 0)}
                </span>
              </div>
            </div>
          </DrawerSection>
        </>
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
