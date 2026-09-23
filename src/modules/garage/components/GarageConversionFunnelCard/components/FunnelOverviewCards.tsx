import React from "react";
import { useTranslation } from "react-i18next";
import { CheckCircle2, Clock, Inbox, XCircle } from "lucide-react";
import { money, shortMoney } from "@/shared/utils/format";
import type { GarageProjectedPipeline } from "../../../api/garageDashboardApi";
import { FunnelRateProgressBar } from "./FunnelRateProgressBar";

interface FunnelOverviewCardsProps {
  totalIntake: { count: number; amount: number; rate?: number };
  inProgress: { count: number; amount: number; rate?: number };
  completed: { count: number; amount: number; rate?: number };
  cancelled: { count: number; amount: number; rate?: number };
  projectedToday?: GarageProjectedPipeline;
  projectedMonth?: GarageProjectedPipeline;
}

export function FunnelOverviewCards({
  totalIntake,
  inProgress,
  completed,
  cancelled,
  projectedToday,
  projectedMonth,
}: FunnelOverviewCardsProps) {
  const { t } = useTranslation("garage");

  return (
    <>
      {/* Card Header: Title on Left */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
          <Inbox className="w-3.5 h-3.5 text-primary" />
          {t(
            "dashboard.funnel.stageOverviewTitle",
            "Tổng Quan Các Giai Đoạn Phễu Tiếp Nhận",
          )}
        </span>
      </div>

      {/* TẦNG 1: 4 Cards Phễu Chuyển Đổi Tinh Gọn */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Stage 1: Tiếp Nhận */}
        <div className="p-3.5 rounded-xl border border-indigo-500/20 bg-indigo-50/40 dark:bg-indigo-950/20 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-indigo-700 dark:text-indigo-400 flex items-center gap-1.5">
              <Inbox className="w-4 h-4" />
              {t("dashboard.funnel.stageIntake", "1. Tổng Tiếp Nhận")}
            </span>
            <span className="text-[11px] font-bold px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300">
              100%
            </span>
          </div>
          <div className="mt-3">
            <div className="text-xl font-bold text-foreground">
              {totalIntake.count}{" "}
              <span className="text-xs font-normal text-muted-foreground">
                {t("dashboard.funnel.casesUnit", "phiếu")}
              </span>
            </div>
            <div className="text-xs font-medium text-indigo-600 dark:text-indigo-400 mt-0.5">
              {money(totalIntake.amount)}
            </div>
          </div>
          <div className="text-[11px] text-muted-foreground mt-2 border-t border-indigo-100 dark:border-indigo-900/40 pt-1.5">
            {t(
              "dashboard.funnel.stageIntakeSub",
              "Tổng nhu cầu đưa xe vào xưởng",
            )}
          </div>
        </div>

        {/* Stage 2: Đang Làm (Dự Thu) */}
        <div className="p-3.5 rounded-xl border border-indigo-500/20 bg-indigo-50/20 dark:bg-indigo-950/15 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-indigo-700 dark:text-indigo-400 flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              {t("dashboard.funnel.stageInProgress", "2. Đang Xử Lý (Dự thu)")}
            </span>
            <span className="text-[11px] font-bold px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300">
              {inProgress.rate ?? 0}%
            </span>
          </div>
          <div className="mt-2.5">
            <div className="text-xl font-bold text-foreground">
              {inProgress.count}{" "}
              <span className="text-xs font-normal text-muted-foreground">
                {t("dashboard.funnel.casesUnit", "phiếu")}
              </span>
            </div>
            <div className="text-xs font-medium text-indigo-600 dark:text-indigo-400 mt-0.5">
              {money(inProgress.amount)}
            </div>
          </div>
          <div className="mt-2 pt-1.5 border-t border-indigo-100 dark:border-indigo-900/40 flex flex-col gap-1 text-[10.5px]">
            <div className="flex items-center justify-between text-muted-foreground">
              <span>
                • {t("dashboard.funnel.todayProjected", "Hôm nay")}:{" "}
                <strong className="text-foreground">
                  {projectedToday?.totalCount || 0} xe
                </strong>
              </span>
              <span className="font-mono text-indigo-600 dark:text-indigo-400 font-medium">
                {shortMoney(projectedToday?.totalAmount || 0)}
              </span>
            </div>
            <div className="flex items-center justify-between text-muted-foreground">
              <span>
                • {t("dashboard.funnel.monthProjected", "Tháng này")}:{" "}
                <strong className="text-foreground">
                  {projectedMonth?.totalCount || inProgress.count} xe
                </strong>
              </span>
              <span className="font-mono text-emerald-600 dark:text-emerald-400 font-medium">
                {shortMoney(projectedMonth?.totalAmount || inProgress.amount)}
              </span>
            </div>
          </div>
        </div>

        {/* Stage 3: Hoàn Tất */}
        <div className="p-3.5 rounded-xl border border-emerald-500/20 bg-emerald-50/40 dark:bg-emerald-950/20 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              {t(
                "dashboard.funnel.stageCompleted",
                "3. Đã Hoàn Thành (Doanh thu)",
              )}
            </span>
            <span className="text-[11px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300">
              {completed.rate ?? 0}%
            </span>
          </div>
          <div className="mt-3">
            <div className="text-xl font-bold text-foreground">
              {completed.count}{" "}
              <span className="text-xs font-normal text-muted-foreground">
                {t("dashboard.funnel.casesUnit", "phiếu")}
              </span>
            </div>
            <div className="text-xs font-medium text-emerald-600 dark:text-emerald-400 mt-0.5">
              {money(completed.amount)}
            </div>
          </div>
          <div className="text-[11px] text-emerald-600/80 dark:text-emerald-400/80 mt-2 border-t border-emerald-100 dark:border-emerald-900/40 pt-1.5">
            {t(
              "dashboard.funnel.stageCompletedSub",
              "Doanh thu thực tế (Kế toán dồn tích)",
            )}
          </div>
        </div>

        {/* Stage 4: Đã Hủy */}
        <div className="p-3.5 rounded-xl border border-rose-500/20 bg-rose-50/40 dark:bg-rose-950/20 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-700 dark:text-rose-400 flex items-center gap-1.5">
              <XCircle className="w-4 h-4" />
              {t("dashboard.funnel.stageCancelled", "4. Hủy / Từ Chối")}
            </span>
            <span className="text-[11px] font-bold px-1.5 py-0.5 rounded bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300">
              {cancelled.rate ?? 0}%
            </span>
          </div>
          <div className="mt-3">
            <div className="text-xl font-bold text-foreground">
              {cancelled.count}{" "}
              <span className="text-xs font-normal text-muted-foreground">
                {t("dashboard.funnel.casesUnit", "phiếu")}
              </span>
            </div>
            <div className="text-xs font-medium text-rose-600 dark:text-rose-400 mt-0.5">
              {money(cancelled.amount)}
            </div>
          </div>
          <div className="text-[11px] text-muted-foreground mt-2 border-t border-rose-100 dark:border-rose-900/40 pt-1.5">
            {t(
              "dashboard.funnel.stageCancelledSub",
              "Doanh thu tổn thất / khách hủy",
            )}
          </div>
        </div>
      </div>

      {/* Visual Progress Ratio Bar */}
      <FunnelRateProgressBar
        totalCount={totalIntake.count}
        completed={completed}
        inProgress={inProgress}
        cancelled={cancelled}
      />
    </>
  );
}
