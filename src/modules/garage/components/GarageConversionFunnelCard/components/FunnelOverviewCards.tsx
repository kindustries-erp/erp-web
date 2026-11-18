import React from "react";
import { useTranslation } from "react-i18next";
import { CheckCircle2, Clock, FileText, Inbox, XCircle } from "lucide-react";
import { money } from "@/shared/utils/format";
import type { GarageProjectedPipeline } from "../../../api/garageDashboardApi";
import { FunnelStageCard } from "./FunnelStageCard";
import { FunnelProjectedStats } from "./FunnelProjectedStats";

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
  onStageClick?: (stageKey: string, stageTitle: string) => void;
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
  onStageClick,
}: FunnelOverviewCardsProps) {
  const { t } = useTranslation("garage");
  const unit = t("dashboard.funnel.casesUnit", "phiếu");

  const intakeTitle = t("dashboard.funnel.stageIntake", "1. Tổng Tiếp Nhận");
  const quotationTitle = t("dashboard.funnel.stageQuotation", "2. Báo Giá");
  const inProgressTitle = t(
    "dashboard.funnel.stageInProgress",
    "3. Đang Xử Lý (Dự thu)",
  );
  const completedTitle = t(
    "dashboard.funnel.stageCompleted",
    "4. Đã Hoàn Thành (Doanh thu)",
  );
  const cancelledTitle = t(
    "dashboard.funnel.stageCancelled",
    "5. Hủy / Từ Chối",
  );

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
          title={intakeTitle}
          badge="100%"
          count={totalIntake.count}
          unit={unit}
          amount={money(totalIntake.amount)}
          onClick={
            onStageClick ? () => onStageClick("ALL", intakeTitle) : undefined
          }
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
          title={quotationTitle}
          badge={`${quotation.rate ?? 0}%`}
          count={quotation.count}
          unit={unit}
          amount={money(quotation.amount)}
          onClick={
            onStageClick
              ? () => onStageClick("QUOTATION", quotationTitle)
              : undefined
          }
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
          title={inProgressTitle}
          badge={`${inProgress.rate ?? 0}%`}
          count={inProgress.count}
          unit={unit}
          amount={money(inProgress.amount)}
          onClick={
            onStageClick
              ? () => onStageClick("IN_PROGRESS", inProgressTitle)
              : undefined
          }
        >
          <FunnelProjectedStats
            projectedToday={projectedToday}
            projectedMonth={projectedMonth}
            fallbackCount={inProgress.count}
            fallbackAmount={inProgress.amount}
          />
        </FunnelStageCard>

        <FunnelStageCard
          tone="emerald"
          icon={<CheckCircle2 className="w-4 h-4" />}
          title={completedTitle}
          badge={`${completed.rate ?? 0}%`}
          count={completed.count}
          unit={unit}
          amount={money(completed.amount)}
          onClick={
            onStageClick
              ? () => onStageClick("COMPLETED", completedTitle)
              : undefined
          }
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
          title={cancelledTitle}
          badge={`${cancelled.rate ?? 0}%`}
          count={cancelled.count}
          unit={unit}
          amount={money(cancelled.amount)}
          onClick={
            onStageClick
              ? () => onStageClick("CANCELLED", cancelledTitle)
              : undefined
          }
        >
          <div className={SUB_CLASS}>
            {t(
              "dashboard.funnel.stageCancelledSub",
              "Doanh thu tổn thất / khách hủy",
            )}
          </div>
        </FunnelStageCard>
      </div>
    </>
  );
}
