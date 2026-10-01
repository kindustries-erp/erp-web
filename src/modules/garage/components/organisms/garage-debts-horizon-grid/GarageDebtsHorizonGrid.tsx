import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { PillTabs } from "@/shared/components/PillTabs";
import {
  BarChart2,
  Clock,
  Brain,
  Calendar,
  AlertTriangle,
  AlertOctagon,
} from "lucide-react";
import { DebtTimeHorizonCard } from "../../molecules/debt-time-horizon-card";
import { DebtAgingExplanationPopover } from "../../molecules/debt-aging-explanation-popover";
import type { GarageDebtsHorizonGridProps } from "./GarageDebtsHorizonGrid.type";

export const GarageDebtsHorizonGrid: React.FC<GarageDebtsHorizonGridProps> = ({
  timeHorizons,
  forecastHorizons,
  onSelectHorizon,
}) => {
  const { t } = useTranslation(["garage", "debts", "common"]);
  const [viewMode, setViewMode] = useState<"aging" | "forecast">("aging");

  return (
    <div className="flex flex-col gap-3 mb-4">
      {/* Header bar: Title + Mode PillTabs + Explanation Popover */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-3 flex-1 min-w-[240px]">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-md border border-slate-200/80 dark:border-slate-700 shadow-xs flex items-center gap-1.5 whitespace-nowrap">
            <BarChart2 className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
            {t(
              "debts:dashboard.sectionAgingAndForecast",
              "Phân bổ & Dự báo Công nợ",
            )}
          </h4>
          <div className="h-px bg-slate-200/80 dark:bg-slate-700 flex-1 hidden sm:block" />
        </div>

        <div className="flex items-center gap-2">
          <PillTabs<"aging" | "forecast">
            value={viewMode}
            onValueChange={setViewMode}
            size="sm"
            items={[
              {
                value: "aging",
                label: t("debts:dashboard.viewAgingMode", "Phân bổ Tuổi nợ"),
                icon: Clock,
              },
              {
                value: "forecast",
                label: t(
                  "debts:dashboard.viewForecastMode",
                  "Dự báo Thuật toán",
                ),
                icon: Brain,
              },
            ]}
            className="w-auto"
          />
          <DebtAgingExplanationPopover />
        </div>
      </div>

      <div className="flex items-center justify-between -mt-1">
        <span className="text-[11px] text-muted-foreground/70 font-normal hidden sm:inline">
          {t(
            "debts:dashboard.horizonClickHint",
            "Click vào từng thẻ để xem chi tiết vụ việc & đối tác",
          )}
        </span>
      </div>

      {viewMode === "aging" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <DebtTimeHorizonCard
            title={t("debts:dashboard.freshDebt7", "Mới phát sinh (≤ 7 ngày)")}
            badge={t("debts:dashboard.freshBadge", "Mới")}
            badgeVariant="emerald"
            icon={Calendar}
            iconColor="text-emerald-600"
            hoverBorderColor="hover:border-emerald-500/50"
            inLabel={t("garage:debts.receivable", "Phải thu (KH)")}
            inAmount={timeHorizons?.nextWeekDue?.receivable || 0}
            outLabel={t("garage:debts.payable", "Phải trả (NCC/CP)")}
            outAmount={timeHorizons?.nextWeekDue?.payable || 0}
            netLabel={t("debts:dashboard.netFlow", "Chênh lệch")}
            netAmount={timeHorizons?.nextWeekDue?.net || 0}
            onClick={() => onSelectHorizon("nextWeekDue")}
          />
          <DebtTimeHorizonCard
            title={t(
              "debts:dashboard.standardDebt30",
              "Trong hạn chuẩn (≤ 30 ngày)",
            )}
            badge={t("debts:dashboard.standardBadge", "Chuẩn")}
            badgeVariant="slate"
            icon={Calendar}
            iconColor="text-primary"
            hoverBorderColor="hover:border-primary/50"
            inLabel={t("garage:debts.receivable", "Phải thu (KH)")}
            inAmount={timeHorizons?.nextMonthDue?.receivable || 0}
            outLabel={t("garage:debts.payable", "Phải trả (NCC/CP)")}
            outAmount={timeHorizons?.nextMonthDue?.payable || 0}
            netLabel={t("debts:dashboard.netFlow", "Chênh lệch")}
            netAmount={timeHorizons?.nextMonthDue?.net || 0}
            onClick={() => onSelectHorizon("nextMonthDue")}
          />
          <DebtTimeHorizonCard
            title={t("debts:dashboard.overdue30To90", "Quá hạn 31-90 ngày")}
            badge={t("debts:dashboard.urgentBadge", "Đôn đốc")}
            badgeVariant="orange"
            icon={AlertTriangle}
            iconColor="text-orange-600"
            hoverBorderColor="hover:border-orange-400/60"
            inLabel={t("garage:debts.receivable", "Phải thu (KH)")}
            inAmount={timeHorizons?.overdue30To90?.receivable || 0}
            outLabel={t("garage:debts.payable", "Phải trả (NCC/CP)")}
            outAmount={timeHorizons?.overdue30To90?.payable || 0}
            netLabel={t("debts:dashboard.netFlow", "Chênh lệch")}
            netAmount={timeHorizons?.overdue30To90?.net || 0}
            onClick={() => onSelectHorizon("overdue30To90")}
          />
          <DebtTimeHorizonCard
            title={t(
              "debts:dashboard.criticalOverdue90Plus",
              "Quá hạn >90 ngày",
            )}
            badge={t("debts:dashboard.warningBadge", "Cảnh báo")}
            badgeVariant="rose"
            icon={AlertOctagon}
            iconColor="text-rose-600"
            hoverBorderColor="hover:border-rose-400/60"
            inLabel={t("garage:debts.receivable", "Phải thu (KH)")}
            inAmount={timeHorizons?.criticalOverdue90Plus?.receivable || 0}
            outLabel={t("garage:debts.payable", "Phải trả (NCC/CP)")}
            outAmount={timeHorizons?.criticalOverdue90Plus?.payable || 0}
            netLabel={t("debts:dashboard.netFlow", "Chênh lệch")}
            netAmount={timeHorizons?.criticalOverdue90Plus?.net || 0}
            onClick={() => onSelectHorizon("criticalOverdue90Plus")}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <DebtTimeHorizonCard
            title={t(
              "debts:dashboard.forecastNext7Days",
              "Dự báo Tuần tới (7 ngày)",
            )}
            badge={t("debts:dashboard.forecastNextBadge", "T+7")}
            badgeVariant="emerald"
            icon={Calendar}
            iconColor="text-emerald-600"
            hoverBorderColor="hover:border-emerald-500/50"
            inLabel={t("garage:debts.forecastIn", "Thu dự báo")}
            inAmount={forecastHorizons?.next7Days?.receivable || 0}
            outLabel={t("garage:debts.forecastOut", "Chi dự báo")}
            outAmount={forecastHorizons?.next7Days?.payable || 0}
            netLabel={t("garage:debts.netForecast", "Ròng dự báo")}
            netAmount={forecastHorizons?.next7Days?.net || 0}
            onClick={() => onSelectHorizon("forecastNext7Days")}
          />
          <DebtTimeHorizonCard
            title={t(
              "debts:dashboard.forecastNext30Days",
              "Kế hoạch Tháng tới (30 ngày)",
            )}
            badge={t("debts:dashboard.forecastMonthBadge", "T+30")}
            badgeVariant="slate"
            icon={Calendar}
            iconColor="text-primary"
            hoverBorderColor="hover:border-primary/50"
            inLabel={t("garage:debts.forecastIn", "Thu dự báo")}
            inAmount={forecastHorizons?.next30Days?.receivable || 0}
            outLabel={t("garage:debts.forecastOut", "Chi dự báo")}
            outAmount={forecastHorizons?.next30Days?.payable || 0}
            netLabel={t("garage:debts.netForecast", "Ròng dự báo")}
            netAmount={forecastHorizons?.next30Days?.net || 0}
            onClick={() => onSelectHorizon("forecastNext30Days")}
          />
          <DebtTimeHorizonCard
            title={t(
              "debts:dashboard.expectedCashflow",
              "Dòng tiền Kỳ vọng (IFRS 9)",
            )}
            badge={t("debts:dashboard.forecastExpectedBadge", "Kỳ vọng")}
            badgeVariant="violet"
            icon={Brain}
            iconColor="text-violet-600"
            hoverBorderColor="hover:border-violet-500/50"
            inLabel={t("garage:debts.expectedIn", "Thu kỳ vọng")}
            inAmount={forecastHorizons?.expectedCashflow?.receivable || 0}
            outLabel={t("garage:debts.expectedOut", "Chi kỳ vọng")}
            outAmount={forecastHorizons?.expectedCashflow?.payable || 0}
            netLabel={t("garage:debts.netExpected", "Ròng kỳ vọng")}
            netAmount={forecastHorizons?.expectedCashflow?.net || 0}
            onClick={() => onSelectHorizon("expectedCashflow")}
          />
          <DebtTimeHorizonCard
            title={t(
              "debts:dashboard.defaultRiskProvision",
              "Dự phòng Rủi ro Nợ",
            )}
            badge={t("debts:dashboard.forecastRiskBadge", "Rủi ro")}
            badgeVariant="rose"
            icon={AlertOctagon}
            iconColor="text-rose-600"
            hoverBorderColor="hover:border-rose-400/60"
            inLabel={t("garage:debts.riskIn", "Rủi ro Phải thu")}
            inAmount={
              forecastHorizons?.defaultRiskProvision?.receivableRisk || 0
            }
            outLabel={t("garage:debts.riskOut", "Rủi ro Phải trả")}
            outAmount={forecastHorizons?.defaultRiskProvision?.payableRisk || 0}
            netLabel={t("garage:debts.netRisk", "Chênh lệch rủi ro")}
            netAmount={forecastHorizons?.defaultRiskProvision?.netRisk || 0}
            isNetPositiveGood={false}
            onClick={() => onSelectHorizon("defaultRiskProvision")}
          />
        </div>
      )}
    </div>
  );
};
