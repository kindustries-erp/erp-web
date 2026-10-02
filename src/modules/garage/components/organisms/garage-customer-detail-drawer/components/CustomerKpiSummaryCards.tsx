import React from "react";
import { useTranslation } from "react-i18next";
import { DrawerSection } from "@/shared/components/DrawerModal";
import { money } from "@/shared/utils/format";
import { cn } from "@/shared/utils";
import { Scale, CheckCircle2, Clock } from "lucide-react";
import type { CustomerDebtTotals } from "../types";

interface CustomerKpiSummaryCardsProps {
  totals: CustomerDebtTotals;
}

export const CustomerKpiSummaryCards = React.memo(
  function CustomerKpiSummaryCards({ totals }: CustomerKpiSummaryCardsProps) {
    const { t } = useTranslation(["garage", "common"]);

    return (
      <DrawerSection
        title={
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
            <Scale className="w-4 h-4 text-primary" />
            <span>
              {t(
                "customers.drawer.financialOverview",
                "Chỉ số công nợ & Thu hồi",
              )}
            </span>
          </div>
        }
        collapsible={false}
        className="p-3 border border-slate-200/80 dark:border-slate-800"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-2.5 w-full">
          {/* Card 1: Tổng Doanh Thu Hoàn Thành */}
          <div className="p-3 rounded-xl bg-slate-500/10 border border-slate-500/20">
            <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold">
              <span>
                {t("customers.drawer.totalReceivable", "Tổng doanh thu HT")}
              </span>
              <span className="text-[11px] text-muted-foreground font-normal">
                {totals.completedCount} {t("partners.unitCases", "phiếu")}
              </span>
            </div>
            <div className="mt-2 text-lg font-bold text-foreground tabular-nums">
              {money(totals.totalRevenue)}
            </div>
          </div>

          {/* Card 2: Đã Thu Thực Tế */}
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <div className="flex items-center justify-between text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
              <div className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{t("customers.drawer.totalPaid", "Đã thu thực tế")}</span>
              </div>
              <span className="text-[11px] font-bold">
                {totals.recoveryRate}%
              </span>
            </div>
            <div className="mt-2 text-lg font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
              {money(totals.totalPaid)}
            </div>
          </div>

          {/* Card 3: Còn Phải Thu (Dư Nợ) */}
          <div
            className={cn(
              "p-3 rounded-xl border",
              totals.totalBalance > 0
                ? "bg-amber-500/10 border-amber-500/20"
                : "bg-emerald-500/10 border-emerald-500/20",
            )}
          >
            <div className="flex items-center justify-between text-xs font-semibold">
              <span
                className={
                  totals.totalBalance > 0
                    ? "text-amber-600 dark:text-amber-400"
                    : "text-emerald-600 dark:text-emerald-400"
                }
              >
                {t("customers.drawer.totalBalance", "Còn nợ (Phải thu)")}
              </span>
              <span className="text-[11px] font-mono text-muted-foreground">
                {totals.vehicleCount} {t("partners.unitVehicles", "xe")}
              </span>
            </div>
            <div
              className={cn(
                "mt-2 text-lg font-bold tabular-nums",
                totals.totalBalance > 0
                  ? "text-amber-600 dark:text-amber-400"
                  : "text-emerald-600 dark:text-emerald-400",
              )}
            >
              {money(totals.totalBalance)}
            </div>
          </div>

          {/* Card 4: Tuổi Nợ Cao Nhất (Tính theo ngày hoàn thành) */}
          <div
            className={cn(
              "p-3 rounded-xl border",
              totals.maxAging > 90
                ? "bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400"
                : totals.maxAging > 30
                  ? "bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400"
                  : "bg-slate-500/10 border-slate-500/20 text-foreground",
            )}
          >
            <div className="flex items-center justify-between text-xs font-semibold">
              <div className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>{t("customers.drawer.avgAging", "Tuổi nợ max")}</span>
              </div>
              <span className="text-[10px] uppercase font-bold tracking-wider">
                {totals.maxAging > 90
                  ? t("customers.filter.agingOver90", ">90d")
                  : totals.maxAging > 30
                    ? t("customers.filter.aging31_60", "Theo dõi")
                    : t("customers.filter.aging0_30", "Trong hạn")}
              </span>
            </div>
            <div className="mt-2 text-lg font-bold tabular-nums">
              {totals.maxAging} {t("common:days", "ngày")}
            </div>
          </div>
        </div>
      </DrawerSection>
    );
  },
);
