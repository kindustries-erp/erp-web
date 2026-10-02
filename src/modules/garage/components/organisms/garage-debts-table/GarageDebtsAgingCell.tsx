import React from "react";
import { Tooltip } from "@/core/components/ui/Tooltip";
import { cn } from "@/shared/utils";
import type { CustomerDebtItem } from "@/modules/garage/hooks/useGarageCustomersList";
import { GarageDebtsAgingTooltip } from "./GarageDebtsAgingTooltip";

interface AgingDaysCellProps {
  row: CustomerDebtItem;
  t: (key: string, fallback: string) => string;
}

export const AgingDaysCell: React.FC<AgingDaysCellProps> = ({ row, t }) => {
  const bal = Number(row.balanceAmount) || 0;
  const aging = row.maxAgingDays || 0;
  const a0_30 = Number(row.aging0_30) || 0;
  const a31_60 = Number(row.aging31_60) || 0;
  const a61_90 = Number(row.aging61_90) || 0;
  const aOver90 = Number(row.agingOver90) || 0;

  if (bal <= 0) {
    return (
      <div className="flex flex-col gap-1.5 w-full py-1 justify-center">
        <div className="flex items-center justify-between text-xs tabular-nums leading-none">
          <span className="font-mono text-xs text-muted-foreground/60">
            0 ngày
          </span>
          <span className="text-[10px] px-1.5 py-0.5 rounded font-sans border font-normal bg-slate-50 dark:bg-slate-800/40 text-muted-foreground/70 border-slate-200/60 dark:border-slate-700/40">
            {t("customers.filter.paid", "Đã tất toán")}
          </span>
        </div>
        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden" />
      </div>
    );
  }

  const p0_30 = bal > 0 ? (a0_30 / bal) * 100 : 0;
  const p31_60 = bal > 0 ? (a31_60 / bal) * 100 : 0;
  const p61_90 = bal > 0 ? (a61_90 / bal) * 100 : 0;
  const pOver90 = bal > 0 ? (aOver90 / bal) * 100 : 0;
  const activeBuckets = [a0_30, a31_60, a61_90, aOver90].filter(
    (v) => v > 0,
  ).length;

  let badgeLabel = "0-30 ngày";
  let badgeCls =
    "bg-emerald-50/90 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-200/70 dark:border-emerald-800/40";
  let mainText = `${aging} ngày`;
  let mainTextCls = "text-emerald-700 dark:text-emerald-400 font-medium";

  if (activeBuckets > 1) {
    mainText = `Max ${aging}d`;
    if (aOver90 > 0) {
      badgeLabel = "Đa tầng (>90d)";
      badgeCls =
        "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-200/80 dark:border-rose-800/50";
      mainTextCls = "text-rose-700 dark:text-rose-400 font-bold";
    } else if (a61_90 > 0) {
      badgeLabel = "Đa tầng (61-90d)";
      badgeCls =
        "bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-400 border-orange-200/80 dark:border-orange-800/50";
      mainTextCls = "text-orange-700 dark:text-orange-400 font-semibold";
    } else {
      badgeLabel = "Đa tầng (0-60d)";
      badgeCls =
        "bg-amber-50/90 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 border-amber-200/70 dark:border-amber-800/40";
      mainTextCls = "text-amber-800 dark:text-amber-300 font-semibold";
    }
  } else {
    if (aOver90 > 0 || aging > 90) {
      badgeLabel = ">90 ngày";
      badgeCls =
        "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-200/80 dark:border-rose-800/50";
      mainTextCls = "text-rose-700 dark:text-rose-400 font-bold";
    } else if (a61_90 > 0 || (aging > 60 && aging <= 90)) {
      badgeLabel = "61-90 ngày";
      badgeCls =
        "bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-400 border-orange-200/80 dark:border-orange-800/50";
      mainTextCls = "text-orange-700 dark:text-orange-400 font-semibold";
    } else if (a31_60 > 0 || (aging > 30 && aging <= 60)) {
      badgeLabel = "31-60 ngày";
      badgeCls =
        "bg-amber-50/90 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 border-amber-200/70 dark:border-amber-800/40";
      mainTextCls = "text-amber-800 dark:text-amber-300 font-semibold";
    }
  }

  return (
    <Tooltip
      content={
        <GarageDebtsAgingTooltip
          bal={bal}
          aging={aging}
          a0_30={a0_30}
          p0_30={p0_30}
          a31_60={a31_60}
          p31_60={p31_60}
          a61_90={a61_90}
          p61_90={p61_90}
          aOver90={aOver90}
          pOver90={pOver90}
        />
      }
    >
      <div className="flex flex-col gap-1.5 w-full py-1 justify-center cursor-pointer group">
        <div className="flex items-center justify-between text-xs tabular-nums leading-none">
          <span className={cn("font-mono text-xs", mainTextCls)}>
            {mainText}
          </span>
          <span
            className={cn(
              "text-[10px] px-1.5 py-0.5 rounded font-sans shrink-0 border leading-none font-medium",
              badgeCls,
            )}
          >
            {badgeLabel}
          </span>
        </div>
        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden flex">
          {p0_30 > 0 && (
            <div
              className="h-full bg-emerald-500 dark:bg-emerald-400 transition-all duration-300"
              style={{ width: `${p0_30}%` }}
            />
          )}
          {p31_60 > 0 && (
            <div
              className="h-full bg-amber-500 dark:bg-amber-400 transition-all duration-300"
              style={{ width: `${p31_60}%` }}
            />
          )}
          {p61_90 > 0 && (
            <div
              className="h-full bg-orange-500 dark:bg-orange-400 transition-all duration-300"
              style={{ width: `${p61_90}%` }}
            />
          )}
          {pOver90 > 0 && (
            <div
              className="h-full bg-rose-500 dark:bg-rose-400 transition-all duration-300"
              style={{ width: `${pOver90}%` }}
            />
          )}
        </div>
      </div>
    </Tooltip>
  );
};
