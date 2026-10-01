import React from "react";
import { useTranslation } from "react-i18next";
import { KpiCard, KpiBadge } from "@/shared/components/KpiCard";
import { money } from "@/shared/utils/format";
import { ArrowUpRight, ArrowDownLeft, Wallet } from "lucide-react";
import type { GarageDebtsKpiGridProps } from "./GarageDebtsKpiGrid.type";

export const GarageDebtsKpiGrid: React.FC<GarageDebtsKpiGridProps> = ({
  summary,
  isLoading = false,
}) => {
  const { t } = useTranslation(["garage", "debts", "common"]);

  const isNetPositive = (summary?.netBalance || 0) >= 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-3">
      {/* Card 1: Phải thu Khách hàng */}
      <KpiCard
        label={t("garage:debts.totalReceivable", "Phải thu Khách hàng")}
        value={money(summary?.remainingReceivable || 0)}
        sub={`${t("common:total", "Tổng")}: ${money(summary?.totalReceivable || 0)} • ${t("garage:debts.collectionRate", "Tỷ lệ thu hồi")}: ${(summary?.collectionRate || 0).toFixed(1)}%`}
        icon={<ArrowUpRight className="w-4 h-4 text-emerald-600" />}
        badge={
          <KpiBadge variant="up">
            {`${(summary?.collectionRate || 0).toFixed(0)}% ${t("debts:received", "Đã thu")}`}
          </KpiBadge>
        }
        loading={isLoading}
      />

      {/* Card 2: Phải trả Nhà cung cấp / Chi phí xưởng */}
      <KpiCard
        label={t(
          "garage:debts.totalPayable",
          "Phải trả Nhà cung cấp & Chi phí",
        )}
        value={money(summary?.remainingPayable || 0)}
        sub={`${t("common:total", "Tổng")}: ${money(summary?.totalPayable || 0)} • ${t("garage:debts.paymentRate", "Tỷ lệ chi trả")}: ${(summary?.paymentRate || 0).toFixed(1)}%`}
        icon={<ArrowDownLeft className="w-4 h-4 text-amber-600" />}
        badge={
          <KpiBadge variant="warn">
            {`${(summary?.paymentRate || 0).toFixed(0)}% ${t("debts:paid", "Đã trả")}`}
          </KpiBadge>
        }
        loading={isLoading}
      />

      {/* Card 3: Vị thế Công nợ Ròng */}
      <KpiCard
        label={t("garage:debts.netDebtPosition", "Vị thế Công nợ ròng")}
        value={`${isNetPositive ? "+" : ""}${money(summary?.netBalance || 0)}`}
        sub={t("garage:debts.netDifference", "Chênh lệch Phải thu - Phải trả")}
        icon={<Wallet className="w-4 h-4 text-primary" />}
        badge={
          isNetPositive ? (
            <span className="text-[10px] px-2 py-[3px] rounded-[20px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200/80">
              {t("debts:dashboard.netSurplus", "Thặng dư phải thu")}
            </span>
          ) : (
            <span className="text-[10px] px-2 py-[3px] rounded-[20px] font-semibold bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200/80">
              {t("debts:dashboard.netDeficit", "Áp lực chi trả")}
            </span>
          )
        }
        loading={isLoading}
      />
    </div>
  );
};
