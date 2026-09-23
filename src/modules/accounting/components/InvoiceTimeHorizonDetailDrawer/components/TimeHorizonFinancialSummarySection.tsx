import React from "react";
import { ArrowUpRight, ArrowDownLeft, Wallet } from "lucide-react";
import { DrawerSection } from "@/shared/components/DrawerModal";
import { cn } from "@/shared/utils";
import { money } from "@/shared/utils/format";
import type { TimeHorizonDetailSummary, TimeHorizonKey } from "../types";

export interface TimeHorizonFinancialSummarySectionProps {
  horizon: TimeHorizonKey | null;
  summary?: TimeHorizonDetailSummary | null;
  t: any;
}

export function TimeHorizonFinancialSummarySection({
  horizon,
  summary,
  t,
}: TimeHorizonFinancialSummarySectionProps) {
  const isExpectedCashflow = horizon === "expectedCashflow";
  const isDefaultRisk = horizon === "defaultRiskProvision";

  return (
    <DrawerSection
      title={t(
        "debts:horizonDrawer.financialSummary",
        "Tổng quan tài chính mốc thời gian",
      )}
      collapsible
      defaultCollapsed={false}
    >
      <div className="space-y-2.5">
        {/* Expected In (Dự thu / Thu kỳ vọng) */}
        <div className="p-3 rounded-xl border border-border/70 bg-emerald-50/30 dark:bg-emerald-950/20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ArrowUpRight className="w-4 h-4 text-emerald-600" />
            <div>
              <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                {isExpectedCashflow
                  ? t("debts:dashboard.forecastExpectedIn", "Thu kỳ vọng (KH)")
                  : isDefaultRisk
                    ? t("debts:dashboard.forecastRiskIn", "Rủi ro Phải thu")
                    : t("debts:dashboard.expectedIn", "Dự thu (Phải thu)")}
              </div>
              <div className="text-xs text-muted-foreground">
                {summary?.receivableCount || 0}{" "}
                {t("debts:unitInvoice", "hóa đơn")}
              </div>
            </div>
          </div>
          <div className="text-right font-mono font-bold text-sm text-emerald-600 dark:text-emerald-400">
            +{money(summary?.receivableAmount || 0)}
          </div>
        </div>

        {/* Expected Out (Dự chi / Chi kỳ vọng) */}
        <div className="p-3 rounded-xl border border-border/70 bg-amber-50/30 dark:bg-amber-950/20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ArrowDownLeft className="w-4 h-4 text-amber-600" />
            <div>
              <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                {isExpectedCashflow
                  ? t(
                      "debts:dashboard.forecastExpectedOut",
                      "Chi kỳ vọng (NCC)",
                    )
                  : isDefaultRisk
                    ? t("debts:dashboard.forecastRiskOut", "Rủi ro Phải trả")
                    : t("debts:dashboard.expectedOut", "Dự chi (Phải trả)")}
              </div>
              <div className="text-xs text-muted-foreground">
                {summary?.payableCount || 0} {t("debts:unitInvoice", "hóa đơn")}
              </div>
            </div>
          </div>
          <div className="text-right font-mono font-bold text-sm text-amber-700 dark:text-amber-400">
            -{money(summary?.payableAmount || 0)}
          </div>
        </div>

        {/* Net Position (Vị thế ròng) */}
        <div className="p-3 rounded-xl border border-border/70 bg-muted/20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wallet className="w-4 h-4 text-primary" />
            <div>
              <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                {isDefaultRisk
                  ? t("debts:dashboard.forecastNetRisk", "Chênh lệch rủi ro")
                  : t("debts:dashboard.netFlow", "Vị thế ròng")}
              </div>
              <div className="text-xs text-muted-foreground">
                {(summary?.netAmount || 0) >= 0
                  ? t("debts:horizonDrawer.surplus", "Thặng dư dòng tiền")
                  : t("debts:horizonDrawer.deficit", "Áp lực chi trả")}
              </div>
            </div>
          </div>
          <div
            className={cn(
              "text-right font-mono font-bold text-sm",
              (summary?.netAmount || 0) >= 0
                ? "text-emerald-700 dark:text-emerald-400"
                : "text-destructive",
            )}
          >
            {(summary?.netAmount || 0) >= 0 ? "+" : ""}
            {money(summary?.netAmount || 0)}
          </div>
        </div>
      </div>
    </DrawerSection>
  );
}
