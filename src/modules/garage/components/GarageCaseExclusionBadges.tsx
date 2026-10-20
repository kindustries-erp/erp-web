import React from "react";
import { cn } from "@/shared/utils";
import { BarChart3, CreditCard, Ban } from "lucide-react";
import { Tooltip } from "@/core/components/ui/Tooltip";
import { useTranslation } from "react-i18next";

export interface GarageCaseExclusionBadgesProps {
  excludeFromReports?: boolean | null;
  excludeFromDebt?: boolean | null;
  className?: string;
  showLabels?: boolean;
}

export function GarageCaseExclusionBadges({
  excludeFromReports,
  excludeFromDebt,
  className,
  showLabels = false,
}: GarageCaseExclusionBadgesProps) {
  const { t } = useTranslation("garage");

  if (!excludeFromReports && !excludeFromDebt) {
    return null;
  }

  return (
    <div
      className={cn("inline-flex items-center gap-1.5 flex-wrap", className)}
    >
      {excludeFromReports && (
        <Tooltip
          content={t(
            "cases.drawer.excludeFromReportsDesc",
            "Loại trừ khỏi Báo cáo P&L, Checkpoint & Doanh thu Garage",
          )}
        >
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/50">
            <Ban className="w-2.5 h-2.5 text-amber-600 dark:text-amber-400" />
            <BarChart3 className="w-2.5 h-2.5 opacity-80" />
            {showLabels && (
              <span>{t("cases.exclusions.reports", "Không báo cáo")}</span>
            )}
          </span>
        </Tooltip>
      )}

      {excludeFromDebt && (
        <Tooltip
          content={t(
            "cases.drawer.excludeFromDebtDesc",
            "Loại trừ khỏi Sổ theo dõi công nợ khách hàng Garage",
          )}
        >
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800/50">
            <Ban className="w-2.5 h-2.5 text-rose-600 dark:text-rose-400" />
            <CreditCard className="w-2.5 h-2.5 opacity-80" />
            {showLabels && (
              <span>{t("cases.exclusions.debt", "Không công nợ")}</span>
            )}
          </span>
        </Tooltip>
      )}
    </div>
  );
}
