import React from "react";
import { useTranslation } from "react-i18next";
import { Calendar, AlertTriangle, AlertOctagon } from "lucide-react";
import { DebtTimeHorizonCard } from "@/shared/components/molecules/debt-time-horizon-card";
import type {
  GarageTimeHorizonsOverview,
  GarageTimeHorizonKey,
} from "@/modules/garage/api/garageDebtsAnalyticsApi";

interface GarageDebtsAgingCardsGridProps {
  timeHorizons?: GarageTimeHorizonsOverview;
  onSelectHorizon: (key: GarageTimeHorizonKey) => void;
}

export const GarageDebtsAgingCardsGrid: React.FC<
  GarageDebtsAgingCardsGridProps
> = ({ timeHorizons, onSelectHorizon }) => {
  const { t } = useTranslation(["garage", "debts", "common"]);

  return (
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
        title={t("debts:dashboard.aging31_90", "Quá hạn 31-90 ngày")}
        badge={t("debts:dashboard.followBadge", "Đôn đốc")}
        badgeVariant="orange"
        icon={AlertTriangle}
        iconColor="text-orange-600"
        hoverBorderColor="hover:border-orange-500/50"
        inLabel={t("garage:debts.receivable", "Phải thu (KH)")}
        inAmount={timeHorizons?.overdue30To90?.receivable || 0}
        outLabel={t("garage:debts.payable", "Phải trả (NCC/CP)")}
        outAmount={timeHorizons?.overdue30To90?.payable || 0}
        netLabel={t("debts:dashboard.netFlow", "Chênh lệch")}
        netAmount={timeHorizons?.overdue30To90?.net || 0}
        onClick={() => onSelectHorizon("overdue30To90")}
      />
      <DebtTimeHorizonCard
        title={t("debts:dashboard.overdueOver90", "Quá hạn sâu (> 90 ngày)")}
        badge={t("debts:dashboard.dangerBadge", "Cảnh báo")}
        badgeVariant="rose"
        icon={AlertOctagon}
        iconColor="text-rose-600"
        hoverBorderColor="hover:border-rose-500/50"
        inLabel={t("garage:debts.receivable", "Phải thu (KH)")}
        inAmount={timeHorizons?.criticalOverdue90Plus?.receivable || 0}
        outLabel={t("garage:debts.payable", "Phải trả (NCC/CP)")}
        outAmount={timeHorizons?.criticalOverdue90Plus?.payable || 0}
        netLabel={t("debts:dashboard.netFlow", "Chênh lệch")}
        netAmount={timeHorizons?.criticalOverdue90Plus?.net || 0}
        onClick={() => onSelectHorizon("criticalOverdue90Plus")}
      />
    </div>
  );
};
