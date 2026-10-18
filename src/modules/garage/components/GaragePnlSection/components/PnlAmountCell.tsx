import React from "react";

export interface PnlAmountCellProps {
  amount?: number | null;
  prevAmount?: number | null;
  revenue?: number | null;
  customRate?: number | null;
  rateSuffix?: string;
  isCost?: boolean;
  isLoading?: boolean;
  isLoadingPrev?: boolean;
  hideDelta?: boolean;
  hideRate?: boolean;
  isRatioOnly?: boolean;
  tdClassName?: string;
  amountClassName?: string;
}

export function PnlAmountCell({
  amount,
  prevAmount,
  revenue,
  customRate,
  rateSuffix = "DT",
  isCost = false,
  isLoading = false,
  isLoadingPrev = false,
  hideDelta = false,
  hideRate = false,
  isRatioOnly = false,
  tdClassName = "py-2 px-4 text-right tabular-nums font-mono text-[13px]",
  amountClassName = "",
}: PnlAmountCellProps) {
  // 1. Render main amount
  const renderAmount = () => {
    if (isLoading) return <span className="text-muted-foreground/60">...</span>;
    if (amount === undefined || amount === null) {
      return <span className="text-muted-foreground/40">—</span>;
    }
    if (isRatioOnly) {
      return <span>{amount.toFixed(2)}%</span>;
    }
    return <span>{amount.toLocaleString("vi-VN")} đ</span>;
  };

  // 2. Calculate delta %
  let deltaNode: React.ReactNode = null;
  if (
    !hideDelta &&
    !isLoadingPrev &&
    prevAmount !== undefined &&
    prevAmount !== null &&
    prevAmount !== 0 &&
    amount !== undefined &&
    amount !== null
  ) {
    const diff = amount - prevAmount;
    if (diff !== 0) {
      const pct = (diff / Math.abs(prevAmount)) * 100;
      const isPositive = diff > 0;
      const isGood = isCost ? !isPositive : isPositive;
      deltaNode = (
        <span
          className={`inline-flex items-center text-[10px] font-bold px-1 py-0.2 rounded border leading-none ${
            isGood
              ? "text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
              : "text-rose-700 dark:text-rose-400 bg-rose-500/10 border-rose-500/20"
          }`}
        >
          {isPositive ? "+" : ""}
          {pct.toFixed(1)}%
        </span>
      );
    }
  }

  // 3. Calculate % Revenue
  let rateNode: React.ReactNode = null;
  if (!hideRate) {
    let rate: number | undefined;
    if (customRate !== undefined && customRate !== null) {
      rate = customRate;
    } else if (
      revenue &&
      revenue > 0 &&
      amount !== undefined &&
      amount !== null
    ) {
      rate = (amount / revenue) * 100;
    }
    if (rate !== undefined) {
      rateNode = (
        <span className="inline-flex items-center text-[10px] px-1 py-0.2 rounded border border-slate-300/80 dark:border-slate-700 text-muted-foreground/80 font-normal leading-none font-mono">
          {rate.toFixed(1)}% {rateSuffix}
        </span>
      );
    }
  }

  const hasSubText = Boolean(deltaNode || rateNode);

  return (
    <td className={tdClassName}>
      <div className={`whitespace-nowrap ${amountClassName}`}>
        {renderAmount()}
      </div>
      {hasSubText && (
        <div className="flex items-center justify-end gap-1 mt-0.5">
          {deltaNode}
          {rateNode}
        </div>
      )}
    </td>
  );
}
