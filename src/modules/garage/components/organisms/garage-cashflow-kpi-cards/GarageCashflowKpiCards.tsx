import React from "react";
import { TrendingUp, TrendingDown, Scale, Clock } from "lucide-react";
import { KpiCard } from "@/shared/components/KpiCard";
import { money } from "@/shared/utils/format";
import { useT } from "@/core/i18n";
import { CashflowKpiBadge } from "../../atoms/cashflow-kpi-badge";
import type { GarageCashflowKpiCardsProps } from "./GarageCashflowKpiCards.type";

export const GarageCashflowKpiCards: React.FC<GarageCashflowKpiCardsProps> = ({
  kpi,
  loading = false,
}) => {
  const t = useT();

  const totalIn = kpi?.totalIn ?? 0;
  const totalOut = kpi?.totalOut ?? 0;
  const net = kpi?.net ?? 0;
  const countIn = kpi?.countIn ?? 0;
  const countOut = kpi?.countOut ?? 0;
  const pendingOutAmount = kpi?.pendingOutAmount ?? 0;
  const pendingOutCount = kpi?.pendingOutCount ?? 0;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
      {/* 1. Tổng tiền vào (Thu) */}
      <KpiCard
        label={t("garage.cashflow.kpi.totalIn", "Tiền vào (Thu)")}
        value={`+${money(totalIn)}`}
        sub={`${countIn} ${t("garage.cashflow.vouchersCount", "phiếu thu")}`}
        loading={loading}
        icon={<TrendingUp className="w-4 h-4 text-emerald-600" />}
        badge={
          <CashflowKpiBadge
            variant="emerald"
            label={t("garage.cashflow.kpi.receiptBadge", "Đã thu")}
          />
        }
      />

      {/* 2. Tổng tiền ra (Chi) */}
      <KpiCard
        label={t("garage.cashflow.kpi.totalOut", "Tiền ra (Chi)")}
        value={`-${money(totalOut)}`}
        sub={`${countOut} ${t("garage.cashflow.paymentCount", "phiếu chi")}`}
        loading={loading}
        icon={<TrendingDown className="w-4 h-4 text-[#ea580c]" />}
        badge={
          <CashflowKpiBadge
            variant="orange"
            label={t("garage.cashflow.kpi.paymentBadge", "Đã chi")}
          />
        }
      />

      {/* 3. Thu chi ròng (Net) */}
      <KpiCard
        label={t("garage.cashflow.kpi.net", "Dòng tiền ròng")}
        value={`${net >= 0 ? "+" : ""}${money(net)}`}
        sub={
          net >= 0
            ? t("garage.cashflow.kpi.netSurplus", "Dương tiền (Thu > Chi)")
            : t("garage.cashflow.kpi.netDeficit", "Âm tiền (Chi > Thu)")
        }
        loading={loading}
        icon={
          <Scale
            className={`w-4 h-4 ${
              net >= 0 ? "text-emerald-600" : "text-[#ea580c]"
            }`}
          />
        }
        badge={
          <CashflowKpiBadge
            variant={net >= 0 ? "emerald" : "orange"}
            label={net >= 0 ? "Thặng dư" : "Thâm hụt"}
          />
        }
      />

      {/* 4. Phiếu chi chờ duyệt */}
      <KpiCard
        label={t("garage.cashflow.kpi.pendingOut", "Chi chờ duyệt")}
        value={money(pendingOutAmount)}
        sub={`${pendingOutCount} ${t("garage.cashflow.pendingCount", "phiếu chờ duyệt")}`}
        loading={loading}
        warn={pendingOutCount > 0}
        icon={<Clock className="w-4 h-4 text-amber-600" />}
        badge={
          <CashflowKpiBadge
            variant={pendingOutCount > 0 ? "amber" : "slate"}
            label={pendingOutCount > 0 ? "Cần duyệt" : "Không có"}
          />
        }
      />
    </div>
  );
};
