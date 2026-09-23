import React from "react";
import { useTranslation } from "react-i18next";
import { Percent } from "lucide-react";

interface FunnelRateProgressBarProps {
  totalCount: number;
  completed: { count: number; rate?: number };
  inProgress: { count: number; rate?: number };
  cancelled: { count: number; rate?: number };
}

export function FunnelRateProgressBar({
  totalCount,
  completed,
  inProgress,
  cancelled,
}: FunnelRateProgressBarProps) {
  const { t } = useTranslation("garage");

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs flex-wrap gap-1">
        <span className="text-muted-foreground font-medium flex items-center gap-1">
          <Percent className="w-3.5 h-3.5" />
          {t(
            "dashboard.funnel.stageIntake",
            "Cơ cấu chuyển đổi trên tổng tiếp nhận",
          )}{" "}
          ({totalCount} {t("dashboard.funnel.casesUnit", "phiếu")})
        </span>
        <span className="text-foreground font-semibold">
          {t("dashboard.funnel.chartCompletionRate", "Tỷ lệ hoàn tất")}:{" "}
          {completed.rate ?? 0}%
        </span>
      </div>

      <div className="h-3 w-full bg-muted/60 rounded-full overflow-hidden flex gap-0.5 p-0.5">
        {completed.rate ? (
          <div
            className="h-full bg-emerald-500 rounded-l-full transition-all duration-500"
            style={{ width: `${completed.rate}%` }}
            title={`Hoàn tất: ${completed.count} phiếu (${completed.rate}%)`}
          />
        ) : null}

        {inProgress.rate ? (
          <div
            className="h-full bg-indigo-500 transition-all duration-500"
            style={{ width: `${inProgress.rate}%` }}
            title={`Đang làm: ${inProgress.count} phiếu (${inProgress.rate}%)`}
          />
        ) : null}

        {cancelled.rate ? (
          <div
            className="h-full bg-rose-500 rounded-r-full transition-all duration-500"
            style={{ width: `${cancelled.rate}%` }}
            title={`Đã hủy: ${cancelled.count} phiếu (${cancelled.rate}%)`}
          />
        ) : null}
      </div>

      <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 flex-wrap gap-2">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
          <span>
            {t("dashboard.funnel.chartCompleted", "Hoàn tất")}:{" "}
            <strong className="text-foreground">{completed.count}</strong> (
            {completed.rate}%)
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-indigo-500 inline-block" />
          <span>
            {t("dashboard.funnel.chartInProgress", "Đang làm")}:{" "}
            <strong className="text-foreground">{inProgress.count}</strong> (
            {inProgress.rate}%)
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
          <span>
            {t("dashboard.funnel.chartCancelled", "Đã hủy")}:{" "}
            <strong className="text-foreground">{cancelled.count}</strong> (
            {cancelled.rate}%)
          </span>
        </div>
      </div>
    </div>
  );
}
