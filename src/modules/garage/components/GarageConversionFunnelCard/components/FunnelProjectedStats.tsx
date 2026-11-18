import React from "react";
import { useTranslation } from "react-i18next";
import { shortMoney } from "@/shared/utils/format";
import type { GarageProjectedPipeline } from "../../../api/garageDashboardApi";

interface FunnelProjectedStatsProps {
  projectedToday?: GarageProjectedPipeline;
  projectedMonth?: GarageProjectedPipeline;
  fallbackCount: number;
  fallbackAmount: number;
}

export function FunnelProjectedStats({
  projectedToday,
  projectedMonth,
  fallbackCount,
  fallbackAmount,
}: FunnelProjectedStatsProps) {
  const { t } = useTranslation("garage");
  return (
    <div className="flex flex-col gap-1 text-[10.5px]">
      <div className="flex items-center justify-between text-muted-foreground">
        <span>
          • {t("dashboard.funnel.todayProjected", "Hôm nay")}:{" "}
          <strong className="text-foreground">
            {projectedToday?.totalCount || 0} xe
          </strong>
        </span>
        <span className="font-mono text-slate-600 dark:text-slate-400 font-medium">
          {shortMoney(projectedToday?.totalAmount || 0)}
        </span>
      </div>
      <div className="flex items-center justify-between text-muted-foreground">
        <span>
          • {t("dashboard.funnel.monthProjected", "Tháng này")}:{" "}
          <strong className="text-foreground">
            {projectedMonth?.totalCount || fallbackCount} xe
          </strong>
        </span>
        <span className="font-mono text-emerald-600 dark:text-emerald-400 font-medium">
          {shortMoney(projectedMonth?.totalAmount || fallbackAmount)}
        </span>
      </div>
    </div>
  );
}
