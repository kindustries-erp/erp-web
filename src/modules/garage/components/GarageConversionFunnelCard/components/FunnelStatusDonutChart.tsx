import React from "react";
import { useTranslation } from "react-i18next";
import { PieChart as PieIcon } from "lucide-react";
import { DonutChart, DonutLegend } from "@/shared/components/charts/DonutChart";
import { money, shortMoney } from "@/shared/utils/format";

interface DonutItem {
  label: string;
  value: number;
  color: string;
}

interface FunnelStatusDonutChartProps {
  items: DonutItem[];
  totalValue: number;
  isAmount: boolean;
}

export function FunnelStatusDonutChart({
  items,
  totalValue,
  isAmount,
}: FunnelStatusDonutChartProps) {
  const { t } = useTranslation("garage");

  return (
    <div className="col-span-12 md:col-span-1 lg:col-span-3 bg-slate-50/50 dark:bg-slate-900/30 border border-border/80 rounded-xl p-4 flex flex-col justify-between">
      <div>
        <div className="flex items-center gap-1.5 mb-0.5">
          <PieIcon className="w-4 h-4 text-indigo-500" />
          <span className="text-xs font-semibold text-foreground">
            {t(
              "dashboard.funnel.donutStatusTitle",
              "Phân Bổ Trạng Thái Phiếu DV",
            )}
          </span>
        </div>
        <p className="text-[11px] text-muted-foreground">
          {t(
            "dashboard.funnel.donutStatusSubtitle",
            "Tỷ lệ trạng thái phiếu tiếp nhận & xử lý",
          )}
        </p>
      </div>

      <div className="flex flex-col my-auto">
        <div className="h-[145px] w-full flex items-center justify-center relative my-1">
          <DonutChart
            items={items}
            cutout="62%"
            valueFormatter={(val) => (isAmount ? money(val) : `${val} xe`)}
          />
        </div>
        <div className="border-t border-border/60 pt-1.5 max-h-[95px] overflow-y-auto">
          <DonutLegend
            items={items}
            valueFormatter={(val) => {
              const pct =
                totalValue > 0 ? ((val / totalValue) * 100).toFixed(1) : "0.0";
              return isAmount
                ? `${shortMoney(val)} (${pct}%)`
                : `${val} xe (${pct}%)`;
            }}
          />
        </div>
      </div>
    </div>
  );
}
