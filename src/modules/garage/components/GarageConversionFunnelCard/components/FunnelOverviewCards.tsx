import React from "react";
import { useTranslation } from "react-i18next";
import { CheckCircle2, Clock, FileText, Inbox, XCircle } from "lucide-react";
import { money, shortMoney } from "@/shared/utils/format";
import type { GarageProjectedPipeline } from "../../../api/garageDashboardApi";
import { FunnelRateProgressBar } from "./FunnelRateProgressBar";
import { FunnelStageCard } from "./FunnelStageCard";

interface Stage {
  count: number;
  amount: number;
  rate?: number;
}

interface FunnelOverviewCardsProps {
  totalIntake: Stage;
  quotation: Stage;
  inProgress: Stage;
  completed: Stage;
  cancelled: Stage;
  projectedToday?: GarageProjectedPipeline;
  projectedMonth?: GarageProjectedPipeline;
}

const SUB_CLASS = "text-[11px] text-muted-foreground";

export function FunnelOverviewCards({
  totalIntake,
  quotation,
  inProgress,
  completed,
  cancelled,
  projectedToday,
  projectedMonth,
}: FunnelOverviewCardsProps) {
  const { t } = useTranslation("garage");
  const unit = t("dashboard.funnel.casesUnit", "phiếu");

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

      {/* TẦNG 1: 5 Cards Phễu Chuyển Đổi */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <FunnelStageCard
          tone="teal"
          icon={<Inbox className="w-4 h-4" />}
          title={t("dashboard.funnel.stageIntake", "1. Tổng Tiếp Nhận")}
          badge="100%"
          count={totalIntake.count}
          unit={unit}
          amount={money(totalIntake.amount)}
        >
          <div className={SUB_CLASS}>
            {t(
              "dashboard.funnel.stageIntakeSub",
              "Tổng nhu cầu đưa xe vào xưởng",
            )}
          </div>
        </FunnelStageCard>

        <FunnelStageCard
          tone="violet"
          icon={<FileText className="w-4 h-4" />}
          title={t("dashboard.funnel.stageQuotation", "2. Báo Giá")}
          badge={`${quotation.rate ?? 0}%`}
          count={quotation.count}
          unit={unit}
          amount={money(quotation.amount)}
        >
          <div className={SUB_CLASS}>
            {t(
              "dashboard.funnel.stageQuotationSub",
              "Phiếu báo giá đang chờ khách duyệt",
            )}
          </div>
        </FunnelStageCard>

        <FunnelStageCard
          tone="slate"
          icon={<Clock className="w-4 h-4" />}
          title={t(
            "dashboard.funnel.stageInProgress",
            "3. Đang Xử Lý (Dự thu)",
          )}
          badge={`${inProgress.rate ?? 0}%`}
          count={inProgress.count}
          unit={unit}
          amount={money(inProgress.amount)}
        >
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
                  {projectedMonth?.totalCount || inProgress.count} xe
                </strong>
              </span>
              <span className="font-mono text-emerald-600 dark:text-emerald-400 font-medium">
                {shortMoney(projectedMonth?.totalAmount || inProgress.amount)}
              </span>
            </div>
          </div>
        </FunnelStageCard>

        <FunnelStageCard
          tone="emerald"
          icon={<CheckCircle2 className="w-4 h-4" />}
          title={t(
            "dashboard.funnel.stageCompleted",
            "4. Đã Hoàn Thành (Doanh thu)",
          )}
          badge={`${completed.rate ?? 0}%`}
          count={completed.count}
          unit={unit}
          amount={money(completed.amount)}
        >
          <div className="text-[11px] text-emerald-600/80 dark:text-emerald-400/80">
            {t(
              "dashboard.funnel.stageCompletedSub",
              "Doanh thu thực tế (Kế toán dồn tích)",
            )}
          </div>
        </FunnelStageCard>

        <FunnelStageCard
          tone="rose"
          icon={<XCircle className="w-4 h-4" />}
          title={t("dashboard.funnel.stageCancelled", "5. Hủy / Từ Chối")}
          badge={`${cancelled.rate ?? 0}%`}
          count={cancelled.count}
          unit={unit}
          amount={money(cancelled.amount)}
        >
          <div className={SUB_CLASS}>
            {t(
              "dashboard.funnel.stageCancelledSub",
              "Doanh thu tổn thất / khách hủy",
            )}
          </div>
        </FunnelStageCard>
      </div>

      {/* Visual Progress Ratio Bar */}
      <FunnelRateProgressBar
        totalCount={totalIntake.count}
        completed={completed}
        quotation={quotation}
        inProgress={inProgress}
        cancelled={cancelled}
      />
    </>
  );
}
