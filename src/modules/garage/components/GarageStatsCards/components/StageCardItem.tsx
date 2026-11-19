import React from "react";
import { money, shortMoney } from "@/shared/utils/format";
import { Tooltip } from "@/core/components/ui/Tooltip";
import type { GarageStageClassifications } from "../../../api/garageDashboardApi";

export interface StageCardItemProps {
  stageKey: string;
  stageName: string;
  count: number;
  amount?: number;
  classifications?: GarageStageClassifications;
  testId: string;
  moneyTestId?: string;
  colorScheme: {
    container: string;
    textTitle: string;
    textCount: string;
    textAmount: string;
  };
  onClick?: () => void;
}

export function StageCardItem({
  stageName,
  count,
  amount = 0,
  classifications,
  testId,
  moneyTestId,
  colorScheme,
  onClick,
}: StageCardItemProps) {
  const renderTooltip = () => {
    if (count <= 0 && (!amount || amount <= 0)) {
      return (
        <div className="text-xs p-0.5" data-testid="stage-tooltip-empty">
          <span>Giai đoạn {stageName}: 0 xe</span>
        </div>
      );
    }
    const suaChua = classifications?.suaChua || 0;
    const kyGui = classifications?.kyGui || 0;
    const oj = classifications?.oj || 0;
    const khac = classifications?.khac || 0;

    return (
      <div
        className="text-xs flex flex-col gap-1.5 p-0.5 min-w-[170px]"
        data-testid="stage-tooltip-content"
      >
        <div className="font-semibold text-foreground border-b border-border/60 pb-1 flex justify-between items-baseline">
          <span>Giai đoạn {stageName}</span>
          <span className="font-mono">{count} xe</span>
        </div>
        {amount > 0 && (
          <div className="flex items-center justify-between text-muted-foreground pb-0.5 border-b border-border/40">
            <span>Tổng phát sinh:</span>
            <span className="font-mono font-medium text-foreground">
              {money(amount)}
            </span>
          </div>
        )}
        <div className="flex flex-col gap-0.5 mt-0.5">
          {suaChua > 0 && (
            <div className="flex items-center justify-between text-indigo-600 dark:text-indigo-400">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#6366f1]" />
                Sửa chữa chung:
              </span>
              <span className="font-mono font-medium">{suaChua}</span>
            </div>
          )}
          {kyGui > 0 && (
            <div className="flex items-center justify-between text-purple-600 dark:text-purple-400">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#a855f7]" />
                Ký gửi / Nội bộ:
              </span>
              <span className="font-mono font-medium">{kyGui}</span>
            </div>
          )}
          {oj > 0 && (
            <div className="flex items-center justify-between text-amber-600 dark:text-amber-400">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b]" />
                OJ Ngoài:
              </span>
              <span className="font-mono font-medium">{oj}</span>
            </div>
          )}
          {khac > 0 && (
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#64748b]" />
                Khác:
              </span>
              <span className="font-mono font-medium">{khac}</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <Tooltip content={renderTooltip()} side="top">
      <div
        onClick={(e) => {
          e.stopPropagation();
          onClick?.();
        }}
        className={`flex flex-col items-center justify-center py-2 px-1 rounded-md transition-all cursor-pointer group/stage min-w-0 ${colorScheme.container}`}
        data-testid={testId}
      >
        <span
          className={`text-[9.5px] font-medium truncate max-w-full leading-none mb-1 ${colorScheme.textTitle}`}
        >
          {stageName}
        </span>
        <div className="flex items-baseline justify-center gap-1 flex-wrap">
          <span
            className={`text-xs font-bold font-mono leading-tight ${colorScheme.textCount}`}
          >
            {count}
          </span>
          {amount > 0 && (
            <span
              className={`text-[10px] font-normal leading-none ${colorScheme.textAmount}`}
              data-testid={moneyTestId}
            >
              ({shortMoney(amount)})
            </span>
          )}
        </div>
      </div>
    </Tooltip>
  );
}
