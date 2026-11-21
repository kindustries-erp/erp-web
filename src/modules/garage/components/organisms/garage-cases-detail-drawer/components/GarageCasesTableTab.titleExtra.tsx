import React from "react";
import { V2Badge } from "@/v2/shared/components/atoms/v2-badge";
import { money } from "@/shared/utils/format";

export interface GarageCasesTableTitleExtraProps {
  showProfitMetrics: boolean;
  /** Số hàng (xe) đang hiển thị sau lọc. */
  rowCount: number;
  /** Số lệnh sau lọc. */
  caseCount: number;
  /** Số xe đã tải (trước lọc). */
  loadedVehicles: number;
  /** Tổng số xe theo API; lớn hơn số đã tải thì báo bị cắt. */
  vehicleTotal?: number;
  totalBilled: number;
  totalRemaining: number;
  t: (key: string, fallback: string, opts?: Record<string, unknown>) => string;
}

const AMOUNT_BADGE =
  "h-6 px-2.5 rounded-full text-[11px] font-mono font-bold bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30";

export const GarageCasesTableTitleExtra: React.FC<
  GarageCasesTableTitleExtraProps
> = ({
  showProfitMetrics,
  rowCount,
  caseCount,
  loadedVehicles,
  vehicleTotal,
  totalBilled,
  totalRemaining,
  t,
}) => {
  const truncated = showProfitMetrics && (vehicleTotal ?? 0) > loadedVehicles;
  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      <span
        data-testid="cases-table-counts"
        className="text-xs font-semibold text-muted-foreground"
      >
        {showProfitMetrics
          ? `${rowCount} ${t("dashboard.funnel.vehiclesUnit", "xe")} · ${caseCount} ${t("dashboard.funnel.casesCountUnit", "lệnh")}`
          : `${caseCount} ${t("common.cases", "phiếu")}`}
      </span>
      {truncated && (
        <V2Badge
          data-testid="cases-table-truncated"
          variant="outline"
          className="h-6 px-2 rounded-full text-[11px] bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30"
        >
          {t("cases.vehicleTruncated", "Hiển thị {{shown}}/{{total}} xe", {
            shown: loadedVehicles,
            total: vehicleTotal,
          })}
        </V2Badge>
      )}
      {showProfitMetrics && totalBilled > 0 && (
        <V2Badge
          variant="outline"
          className="h-6 px-2.5 rounded-full text-[11px] font-mono font-bold bg-primary/10 text-primary border-primary/20 dark:border-primary/30"
        >
          {money(totalBilled)}
        </V2Badge>
      )}
      {totalRemaining > 0 && (
        <V2Badge variant="outline" className={AMOUNT_BADGE}>
          {money(totalRemaining)}
        </V2Badge>
      )}
    </div>
  );
};
