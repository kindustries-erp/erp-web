import React, { useMemo } from "react";
import { CheckCircle2, Clock, Wrench, XCircle, Car } from "lucide-react";
import { useTranslation } from "react-i18next";
import { DrawerSection } from "@/v2/shared/components/molecules/v2-drawer-section";
import { V2Badge } from "@/v2/shared/components/atoms/v2-badge";
import { money } from "@/shared/utils/format";
import type { GarageCaseDetailRow } from "./GarageCasesTableTab.type";
import { calculateVehicleProgressStats } from "./GarageVehicleProgressRightPanel.helper";

export interface GarageVehicleProgressRightPanelProps {
  cases?: GarageCaseDetailRow[];
}

export const GarageVehicleProgressRightPanel: React.FC<
  GarageVehicleProgressRightPanelProps
> = ({ cases = [] }) => {
  const { t } = useTranslation(["garage", "debts", "common"]);
  const stats = useMemo(() => calculateVehicleProgressStats(cases), [cases]);

  return (
    <div className="flex flex-col gap-2.5 w-full">
      {/* ── Section 1: Tiến độ dịch vụ xe ── */}
      <DrawerSection
        title={t("garage.progress.vehicleProgress", "Tiến độ Dịch vụ Xe")}
        collapsible
        defaultCollapsed={false}
      >
        <div className="flex flex-col gap-2.5 w-full text-xs">
          <div className="p-2.5 rounded-xl bg-surface/50 dark:bg-zinc-900/40 border border-border/40 dark:border-white/[0.06] flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-muted-fg uppercase">
                Tổng số xe trong kỳ
              </span>
              <div className="flex items-center gap-1.5">
                <span className="font-mono font-bold text-foreground">
                  {stats.totalVehicles} xe
                </span>
                <V2Badge
                  variant="outline"
                  className="h-5 px-1.5 text-[10px] rounded-full font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                >
                  {stats.completionRate.toFixed(1)}% Hoàn thành
                </V2Badge>
              </div>
            </div>
            <div className="w-full bg-muted/40 dark:bg-zinc-800/60 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${Math.min(stats.completionRate, 100)}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            <div className="p-2 rounded-lg bg-surface/40 dark:bg-zinc-900/30 border border-border/30 dark:border-white/[0.04] flex items-center justify-between">
              <span className="text-[11px] text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1">
                <Clock className="w-3 h-3 shrink-0" /> Báo giá
              </span>
              <span className="font-mono font-bold text-foreground">
                {stats.quotationCount}
              </span>
            </div>
            <div className="p-2 rounded-lg bg-surface/40 dark:bg-zinc-900/30 border border-border/30 dark:border-white/[0.04] flex items-center justify-between">
              <span className="text-[11px] text-orange-600 dark:text-orange-400 font-medium flex items-center gap-1">
                <Wrench className="w-3 h-3 shrink-0" /> Đang làm
              </span>
              <span className="font-mono font-bold text-foreground">
                {stats.inProgressCount}
              </span>
            </div>
            <div className="p-2 rounded-lg bg-surface/40 dark:bg-zinc-900/30 border border-border/30 dark:border-white/[0.04] flex items-center justify-between">
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 shrink-0" /> Hoàn thành
              </span>
              <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                {stats.completedCount}
              </span>
            </div>
            <div className="p-2 rounded-lg bg-surface/40 dark:bg-zinc-900/30 border border-border/30 dark:border-white/[0.04] flex items-center justify-between">
              <span className="text-[11px] text-rose-600 dark:text-rose-400 font-medium flex items-center gap-1">
                <XCircle className="w-3 h-3 shrink-0" /> Đã hủy
              </span>
              <span className="font-mono font-bold text-muted-fg">
                {stats.cancelledCount}
              </span>
            </div>
          </div>
        </div>
      </DrawerSection>

      {/* ── Section 2: Cơ cấu Top Hãng xe vào xưởng ── */}
      {stats.topBrands.length > 0 && (
        <DrawerSection
          title={t("garage.progress.carBrands", "Cơ cấu Hãng xe vào Xưởng")}
          collapsible
          defaultCollapsed={false}
        >
          <div className="flex flex-col gap-2 w-full text-xs">
            {stats.topBrands.map((b) => (
              <div
                key={b.name}
                className="flex flex-col gap-1 p-2 rounded-xl bg-surface/50 dark:bg-zinc-900/40 border border-border/40 dark:border-white/[0.06]"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-foreground truncate flex items-center gap-1">
                    <Car className="w-3 h-3 text-muted-fg shrink-0" />
                    {b.name}
                  </span>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="font-mono font-bold text-foreground">
                      {b.count} xe
                    </span>
                    <span className="text-[10px] text-muted-fg font-mono">
                      ({b.percent.toFixed(0)}%)
                    </span>
                  </div>
                </div>
                <div className="w-full bg-muted/40 dark:bg-zinc-800/60 h-1 rounded-full overflow-hidden">
                  <div
                    className="bg-primary/70 h-full rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(b.percent, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </DrawerSection>
      )}

      {/* ── Section 3: Dòng tiền Dịch vụ Xe ── */}
      <DrawerSection
        title={t("garage.progress.cashflow", "Dòng tiền Dịch vụ Xe")}
        collapsible
        defaultCollapsed={false}
      >
        <div className="flex flex-col gap-2 w-full text-xs">
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-surface/50 dark:bg-zinc-900/40 border border-border/40 dark:border-white/[0.06]">
            <span className="text-[11px] font-medium text-muted-fg uppercase">
              Phát sinh (Có VAT)
            </span>
            <span className="font-mono font-bold text-foreground tabular-nums">
              {money(stats.totalBilled)}
            </span>
          </div>

          <div className="flex flex-col gap-1 p-2.5 rounded-xl bg-surface/50 dark:bg-zinc-900/40 border border-border/40 dark:border-white/[0.06]">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 uppercase">
                Đã thu thực tế
              </span>
              <V2Badge
                variant="outline"
                className="h-4.5 px-1.5 text-[9px] rounded-full border-emerald-500/30 text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 font-bold tabular-nums"
              >
                {stats.collectionRate.toFixed(1)}%
              </V2Badge>
            </div>
            <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
              {money(stats.totalPaid)}
            </span>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-xl bg-amber-500/5 border border-amber-500/20 dark:border-amber-500/15">
            <span className="text-[11px] font-medium text-amber-700 dark:text-amber-400 uppercase">
              Còn nợ phải thu
            </span>
            <span className="font-mono font-bold text-amber-600 dark:text-amber-400 tabular-nums">
              {money(stats.totalRemaining)}
            </span>
          </div>
        </div>
      </DrawerSection>
    </div>
  );
};
