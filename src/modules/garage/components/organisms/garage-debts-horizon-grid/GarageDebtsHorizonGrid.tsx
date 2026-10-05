import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { PillTabs } from "@/shared/components/PillTabs";
import { BarChart2, Clock, Brain } from "lucide-react";
import { DebtAgingExplanationPopover } from "@/shared/components/molecules/debt-aging-explanation-popover";
import type { GarageDebtsHorizonGridProps } from "./GarageDebtsHorizonGrid.type";
import { GarageDebtsAgingCardsGrid } from "./GarageDebtsAgingCardsGrid";
import { GarageDebtsForecastCardsGrid } from "./GarageDebtsForecastCardsGrid";

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
          <DebtAgingExplanationPopover context="garage" />
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
        <GarageDebtsAgingCardsGrid
          timeHorizons={timeHorizons}
          onSelectHorizon={onSelectHorizon}
        />
      ) : (
        <GarageDebtsForecastCardsGrid
          forecastHorizons={forecastHorizons}
          onSelectHorizon={onSelectHorizon}
        />
      )}
    </div>
  );
};
