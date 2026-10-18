import React from "react";
import { money } from "@/shared/utils/format";

interface GarageDebtsAgingTooltipProps {
  bal: number;
  aging: number;
  a0_30: number;
  p0_30: number;
  a31_60: number;
  p31_60: number;
  a61_90: number;
  p61_90: number;
  aOver90: number;
  pOver90: number;
}

export const GarageDebtsAgingTooltip: React.FC<
  GarageDebtsAgingTooltipProps
> = ({
  bal,
  aging,
  a0_30,
  p0_30,
  a31_60,
  p31_60,
  a61_90,
  p61_90,
  aOver90,
  pOver90,
}) => {
  return (
    <div className="flex flex-col gap-2 p-1 text-xs min-w-[260px]">
      <div className="font-semibold text-foreground border-b border-border/50 pb-1 flex justify-between items-center">
        <span>Cơ cấu phân tầng tuổi nợ</span>
        <span className="text-[11px] font-mono font-normal text-muted-foreground">
          Tổng nợ: {money(bal)}
        </span>
      </div>
      <div className="space-y-1.5 tabular-nums">
        {a0_30 > 0 && (
          <div className="flex justify-between items-center text-emerald-600 dark:text-emerald-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block shrink-0" />
              0-30 ngày (Trong hạn):
            </span>
            <span className="font-mono font-medium">
              {money(a0_30)} • {Math.round(p0_30)}%
            </span>
          </div>
        )}
        {a31_60 > 0 && (
          <div className="flex justify-between items-center text-amber-700 dark:text-amber-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500 inline-block shrink-0" />
              31-60 ngày (Cần theo dõi):
            </span>
            <span className="font-mono font-medium">
              {money(a31_60)} • {Math.round(p31_60)}%
            </span>
          </div>
        )}
        {a61_90 > 0 && (
          <div className="flex justify-between items-center text-orange-700 dark:text-orange-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-orange-500 inline-block shrink-0" />
              61-90 ngày (Quá hạn):
            </span>
            <span className="font-mono font-medium">
              {money(a61_90)} • {Math.round(p61_90)}%
            </span>
          </div>
        )}
        {aOver90 > 0 && (
          <div className="flex justify-between items-center text-rose-700 dark:text-rose-400 font-medium">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500 inline-block shrink-0" />
              &gt;90 ngày (Quá hạn nặng):
            </span>
            <span className="font-mono font-bold">
              {money(aOver90)} • {Math.round(pOver90)}%
            </span>
          </div>
        )}
      </div>
      <div className="pt-1 border-t border-border/40 text-[10px] text-muted-foreground flex justify-between">
        <span>
          Tuổi nợ max: <b>{aging} ngày</b>
        </span>
      </div>
    </div>
  );
};
