import React from "react";
import { useTranslation } from "react-i18next";
import { Calendar, AlertTriangle, AlertOctagon } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { DebtTimeHorizonCard } from "@/shared/components/molecules/debt-time-horizon-card";
import type { DebtHorizonBadgeVariant } from "@/shared/components/atoms/debt-horizon-badge";
import type {
  GarageTimeHorizonsOverview,
  GarageTimeHorizonKey,
} from "@/modules/garage/api/garageDebtsAnalyticsApi";

interface GarageDebtsAgingCardsGridProps {
  timeHorizons?: GarageTimeHorizonsOverview;
  onSelectHorizon: (key: GarageTimeHorizonKey) => void;
}

type AgingHorizonKey = Exclude<
  keyof GarageTimeHorizonsOverview,
  "overdue30To90"
>;

interface AgingCardConfig {
  key: AgingHorizonKey;
  titleKey: string;
  titleDefault: string;
  badgeKey: string;
  badgeDefault: string;
  badgeVariant: DebtHorizonBadgeVariant;
  icon: LucideIcon;
  iconColor: string;
  hoverBorderColor: string;
}

/** 5 thẻ tuổi nợ không chồng lấn: ≤7, 8–30, 31–60, 61–90, >90 ngày. */
const AGING_CARDS: AgingCardConfig[] = [
  {
    key: "nextWeekDue",
    titleKey: "debts:dashboard.garageFresh7",
    titleDefault: "Mới phát sinh (≤ 7 ngày)",
    badgeKey: "debts:dashboard.freshBadge",
    badgeDefault: "Mới",
    badgeVariant: "emerald",
    icon: Calendar,
    iconColor: "text-emerald-600",
    hoverBorderColor: "hover:border-emerald-500/50",
  },
  {
    key: "nextMonthDue",
    titleKey: "debts:dashboard.garageStandard8To30",
    titleDefault: "Trong hạn chuẩn (8–30 ngày)",
    badgeKey: "debts:dashboard.standardBadge",
    badgeDefault: "Chuẩn",
    badgeVariant: "slate",
    icon: Calendar,
    iconColor: "text-primary",
    hoverBorderColor: "hover:border-primary/50",
  },
  {
    key: "overdue31To60",
    titleKey: "debts:dashboard.garageOverdue31To60",
    titleDefault: "Quá hạn 31-60 ngày",
    badgeKey: "debts:dashboard.followBadge",
    badgeDefault: "Đôn đốc",
    badgeVariant: "orange",
    icon: AlertTriangle,
    iconColor: "text-orange-600",
    hoverBorderColor: "hover:border-orange-500/50",
  },
  {
    key: "overdue61To90",
    titleKey: "debts:dashboard.garageOverdue61To90",
    titleDefault: "Quá hạn 61-90 ngày",
    badgeKey: "debts:dashboard.riskBadge",
    badgeDefault: "Nguy cơ",
    badgeVariant: "amber",
    icon: AlertTriangle,
    iconColor: "text-amber-600",
    hoverBorderColor: "hover:border-amber-500/50",
  },
  {
    key: "criticalOverdue90Plus",
    titleKey: "debts:dashboard.garageOverdueOver90",
    titleDefault: "Quá hạn >90 ngày",
    badgeKey: "debts:dashboard.dangerBadge",
    badgeDefault: "Cảnh báo",
    badgeVariant: "rose",
    icon: AlertOctagon,
    iconColor: "text-rose-600",
    hoverBorderColor: "hover:border-rose-500/50",
  },
];

export const GarageDebtsAgingCardsGrid: React.FC<
  GarageDebtsAgingCardsGridProps
> = ({ timeHorizons, onSelectHorizon }) => {
  const { t } = useTranslation(["garage", "debts", "common"]);

  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-3">
      {AGING_CARDS.map((card) => {
        const item = timeHorizons?.[card.key];
        return (
          <DebtTimeHorizonCard
            key={card.key}
            title={t(card.titleKey, card.titleDefault)}
            badge={t(card.badgeKey, card.badgeDefault)}
            badgeVariant={card.badgeVariant}
            icon={card.icon}
            iconColor={card.iconColor}
            hoverBorderColor={card.hoverBorderColor}
            inLabel={t("debts:dashboard.garageReceivableTotal", "Phải thu")}
            inAmount={item?.receivable || 0}
            outLabel={t("garage:debts.payable", "Phải trả (NCC/CP)")}
            outAmount={item?.payable || 0}
            netLabel={t("debts:dashboard.netFlow", "Chênh lệch")}
            netAmount={item?.net || 0}
            onClick={() => onSelectHorizon(card.key)}
          />
        );
      })}
    </div>
  );
};
