import React from "react";
import { useTranslation } from "react-i18next";
import { DrawerSection } from "@/shared/components/DrawerModal";
import { money } from "@/shared/utils/format";
import { cn } from "@/shared/utils";
import { Scale, CheckCircle2, Clock } from "lucide-react";
import type { CustomerDebtTotals } from "../types";

interface CustomerKpiSummaryCardsProps {
  totals: CustomerDebtTotals;
  debtType?: "receivables" | "payables";
}

export const CustomerKpiSummaryCards = React.memo(
  function CustomerKpiSummaryCards({
    totals,
    debtType = "receivables",
  }: CustomerKpiSummaryCardsProps) {
    const { t } = useTranslation(["garage", "common"]);
    const isPayables = debtType === "payables";

    return (
      <DrawerSection
        title={
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
            <Scale className="w-4 h-4 text-primary" />
            <span>
              {isPayables
                ? t(
                    "customers.drawer.financialOverviewPayables",
                    "Chỉ số công nợ phải trả",
                  )
                : t(
                    "customers.drawer.financialOverview",
                    "Chỉ số công nợ & Thu hồi",
                  )}
            </span>
          </div>
        }
        collapsible
        defaultCollapsed={false}
      >
        <div className="grid grid-cols-2 gap-2 text-xs w-full">
          {/* Card 1: Tổng Doanh Thu / Chi Phí Hoàn Thành */}
          <div className="p-2.5 rounded-xl bg-slate-500/10 border border-slate-500/20 flex flex-col justify-between">
            <div className="text-[11px] text-muted-foreground font-semibold leading-tight">
              {isPayables
                ? t("customers.drawer.totalCost", "Tổng chi phí HT")
                : t("customers.drawer.totalReceivable", "Tổng doanh thu HT")}
            </div>
            <div className="mt-1.5 text-sm font-bold text-foreground tabular-nums">
              {money(totals.totalRevenue)}
            </div>
            <div className="text-[10px] text-muted-foreground font-normal mt-0.5">
              {totals.completedCount} {t("partners.unitCases", "phiếu")}
            </div>
          </div>

          {/* Card 2: Đã Thu / Đã Chi Thực Tế */}
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex flex-col justify-between">
            <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold leading-tight flex items-center justify-between">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 shrink-0" />
                <span>
                  {isPayables
                    ? t("customers.drawer.totalPaidPayables", "Đã chi TT")
                    : t("customers.drawer.totalPaid", "Đã thu TT")}
                </span>
              </span>
              <span className="text-[10px] font-bold">
                {totals.recoveryRate}%
              </span>
            </div>
            <div className="mt-1.5 text-sm font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
              {money(totals.totalPaid)}
            </div>
            <div className="text-[10px] text-emerald-600/80 dark:text-emerald-400/80 mt-0.5">
              {t("customers.drawer.recoveryRate", "Tỷ lệ thu hồi")}
            </div>
          </div>

          {/* Card 3: Còn Phải Thu / Còn Phải Chi */}
          <div
            className={cn(
              "p-2.5 rounded-xl border flex flex-col justify-between",
              totals.totalBalance > 0
                ? "bg-amber-500/10 border-amber-500/20"
                : "bg-emerald-500/10 border-emerald-500/20",
            )}
          >
            <div className="flex items-center justify-between text-[11px] font-semibold leading-tight">
              <span
                className={
                  totals.totalBalance > 0
                    ? "text-amber-600 dark:text-amber-400"
                    : "text-emerald-600 dark:text-emerald-400"
                }
              >
                {isPayables
                  ? t("customers.drawer.totalBalancePayables", "Còn phải chi")
                  : t("customers.drawer.totalBalance", "Còn nợ (Thu)")}
              </span>
            </div>
            <div
              className={cn(
                "mt-1.5 text-sm font-bold tabular-nums",
                totals.totalBalance > 0
                  ? "text-amber-600 dark:text-amber-400"
                  : "text-emerald-600 dark:text-emerald-400",
              )}
            >
              {money(totals.totalBalance)}
            </div>
            <div className="text-[10px] text-muted-foreground font-normal mt-0.5">
              {totals.vehicleCount} {t("partners.unitVehicles", "xe")}
            </div>
          </div>

          {/* Card 4: Tuổi Nợ Cao Nhất */}
          <div
            className={cn(
              "p-2.5 rounded-xl border flex flex-col justify-between",
              totals.maxAging > 90
                ? "bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400"
                : totals.maxAging > 30
                  ? "bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400"
                  : "bg-slate-500/10 border-slate-500/20 text-foreground",
            )}
          >
            <div className="flex items-center justify-between text-[11px] font-semibold leading-tight">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 shrink-0" />
                <span>{t("customers.drawer.avgAging", "Tuổi nợ max")}</span>
              </span>
              <span className="text-[9px] uppercase font-bold tracking-wider">
                {totals.maxAging > 90
                  ? t("customers.filter.agingOver90", ">90d")
                  : totals.maxAging > 30
                    ? t("customers.filter.aging31_60", "Theo dõi")
                    : t("customers.filter.aging0_30", "Trong hạn")}
              </span>
            </div>
            <div className="mt-1.5 text-sm font-bold tabular-nums">
              {totals.maxAging} {t("common:days", "ngày")}
            </div>
            <div className="text-[10px] text-muted-foreground mt-0.5">
              {t("customers.drawer.completionDateAging", "Theo ngày HT")}
            </div>
          </div>
        </div>
      </DrawerSection>
    );
  },
);
