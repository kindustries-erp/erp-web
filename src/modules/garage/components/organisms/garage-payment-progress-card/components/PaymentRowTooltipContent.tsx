import React from "react";
import { money } from "@/shared/utils/format";
import type { GarageTrendItem } from "@/modules/garage/api/garageDashboardApi";
import { formatMonth } from "../GaragePaymentProgressCard.helper";

interface PaymentRowTooltipContentProps {
  item: GarageTrendItem;
}

export const PaymentRowTooltipContent: React.FC<
  PaymentRowTooltipContentProps
> = ({ item }) => {
  const excludedAmount = item.excludedDebtAmount || 0;
  const excludedCases = item.excludedDebtCaseCount || 0;

  return (
    <div
      className="flex flex-col gap-1.5 min-w-[230px] py-0.5 text-xs"
      data-testid={`row-tooltip-${item.label}`}
    >
      <div className="flex items-center justify-between gap-4 border-b border-white/15 pb-1 font-semibold text-white">
        <span>{formatMonth(item.label)}</span>
        <span className="text-[11px] font-normal text-slate-300">
          {item.caseCount} phiếu
        </span>
      </div>

      <div className="flex items-center justify-between gap-4">
        <span className="text-slate-300">Doanh thu:</span>
        <span className="font-mono font-semibold text-white tabular-nums">
          {money(item.revenue || 0)}
        </span>
      </div>

      <div className="flex items-center justify-between gap-4">
        <span className="text-slate-300">Chi phí:</span>
        <span className="font-mono font-semibold text-white tabular-nums">
          {money(item.cost || 0)}
        </span>
      </div>

      <div className="flex items-center justify-between gap-4">
        <span className="text-slate-300">Lợi nhuận:</span>
        <span
          className={
            (item.profit || 0) >= 0
              ? "font-mono font-semibold text-emerald-400 tabular-nums"
              : "font-mono font-semibold text-rose-400 tabular-nums"
          }
        >
          {money(item.profit || 0)}
        </span>
      </div>

      <div className="flex items-center justify-between gap-4">
        <span className="text-slate-300">Còn phải trả:</span>
        <span className="font-mono font-semibold text-amber-300 tabular-nums">
          {(item.payableCost || 0) > 0 ? money(item.payableCost || 0) : "—"}
        </span>
      </div>

      <div className="flex items-center justify-between gap-4 border-t border-white/15 pt-1">
        <span className="text-slate-300">Không theo dõi công nợ:</span>
        <span className="font-mono font-medium text-slate-200 tabular-nums">
          {excludedAmount > 0
            ? `${money(excludedAmount)}${excludedCases > 0 ? ` (${excludedCases} phiếu)` : ""}`
            : "—"}
        </span>
      </div>
    </div>
  );
};
