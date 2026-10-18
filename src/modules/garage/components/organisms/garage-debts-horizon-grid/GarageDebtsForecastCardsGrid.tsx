import React from "react";
import { useTranslation } from "react-i18next";
import { TrendingUp, Clock, Sparkles } from "lucide-react";
import { DebtTimeHorizonCard } from "@/shared/components/molecules/debt-time-horizon-card";
import type {
  GarageForecastHorizonsOverview,
  GarageTimeHorizonKey,
} from "@/modules/garage/api/garageDebtsAnalyticsApi";

interface GarageDebtsForecastCardsGridProps {
  forecastHorizons?: GarageForecastHorizonsOverview;
  onSelectHorizon: (key: GarageTimeHorizonKey) => void;
}

export const GarageDebtsForecastCardsGrid: React.FC<
  GarageDebtsForecastCardsGridProps
> = ({ forecastHorizons, onSelectHorizon }) => {
  const { t } = useTranslation(["garage", "debts", "common"]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <DebtTimeHorizonCard
        title={t(
          "debts:dashboard.forecast7Title",
          "Dự báo Dòng tiền 7 ngày tới",
        )}
        badge={t("debts:dashboard.forecastBadge", "T+7 Forecast")}
        badgeVariant="emerald"
        icon={TrendingUp}
        iconColor="text-emerald-600"
        hoverBorderColor="hover:border-emerald-500/50"
        inLabel={t("garage:debts.expectedIn", "Dự kiến thu")}
        inAmount={forecastHorizons?.next7Days?.receivable || 0}
        outLabel={t("garage:debts.expectedOut", "Dự kiến chi")}
        outAmount={forecastHorizons?.next7Days?.payable || 0}
        netLabel={t("debts:dashboard.netExpected", "Dòng tiền kỳ vọng")}
        netAmount={forecastHorizons?.next7Days?.net || 0}
        onClick={() => onSelectHorizon("forecastNext7Days")}
      />
      <DebtTimeHorizonCard
        title={t(
          "debts:dashboard.forecast30Title",
          "Dự báo Dòng tiền 30 ngày tới",
        )}
        badge={t("debts:dashboard.forecastBadge30", "T+30 Forecast")}
        badgeVariant="violet"
        icon={Clock}
        iconColor="text-violet-600"
        hoverBorderColor="hover:border-violet-500/50"
        inLabel={t("garage:debts.expectedIn", "Dự kiến thu")}
        inAmount={forecastHorizons?.next30Days?.receivable || 0}
        outLabel={t("garage:debts.expectedOut", "Dự kiến chi")}
        outAmount={forecastHorizons?.next30Days?.payable || 0}
        netLabel={t("debts:dashboard.netExpected", "Dòng tiền kỳ vọng")}
        netAmount={forecastHorizons?.next30Days?.net || 0}
        onClick={() => onSelectHorizon("forecastNext30Days")}
      />
      <DebtTimeHorizonCard
        title={t(
          "debts:dashboard.forecastExpectedTitle",
          "Dự phòng rủi ro & Dòng tiền kỳ vọng",
        )}
        badge={t("debts:dashboard.ifrsBadge", "IFRS 9 Expected")}
        badgeVariant="amber"
        icon={Sparkles}
        iconColor="text-amber-600"
        hoverBorderColor="hover:border-amber-500/50"
        inLabel={t("garage:debts.expectedCollection", "Thu kỳ vọng (ECL)")}
        inAmount={forecastHorizons?.expectedCashflow?.receivable || 0}
        outLabel={t("garage:debts.provisioningCost", "Chi phí dự phòng")}
        outAmount={forecastHorizons?.expectedCashflow?.payable || 0}
        netLabel={t("debts:dashboard.netSafe", "Dòng tiền an toàn")}
        netAmount={forecastHorizons?.expectedCashflow?.net || 0}
        onClick={() => onSelectHorizon("expectedCashflow")}
      />
    </div>
  );
};
