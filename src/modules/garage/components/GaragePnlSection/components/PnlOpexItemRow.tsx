import React from "react";
import type { PairedPnlItem } from "../types";
import { PnlAmountCell } from "./PnlAmountCell";

export interface PnlOpexItemRowProps {
  item: PairedPnlItem;
  index: number;
  isOjOnly?: boolean;
  isLoadingPrev: boolean;
  isLoadingPrev2?: boolean;
}

export function PnlOpexItemRow({
  item,
  index,
  isOjOnly = false,
  isLoadingPrev,
  isLoadingPrev2 = false,
}: PnlOpexItemRowProps) {
  const curVal = isOjOnly ? item.curOjAmount : item.curAmount;
  const prevVal = isOjOnly ? item.prevOjAmount : item.prevAmount;
  const prev2Val = isOjOnly ? item.prev2OjAmount : item.prev2Amount;

  const subCell =
    "py-1.5 px-4 text-right tabular-nums font-mono text-[11px] text-muted-foreground";

  const hasOjSub =
    !isOjOnly &&
    Boolean(
      (item.curOjAmount && item.curOjAmount > 0) ||
      (item.prevOjAmount && item.prevOjAmount > 0) ||
      (item.prev2OjAmount && item.prev2OjAmount > 0),
    );

  return (
    <React.Fragment key={item.key}>
      <tr className="text-muted-foreground hover:bg-muted/10 transition-colors">
        <td className="py-2 px-8 flex items-center justify-between">
          <span>
            5.{index + 1}. {item.categoryName}
          </span>
          {item.note && (
            <span className="text-[10px] text-muted-foreground/70 italic max-w-[200px] truncate">
              ({item.note})
            </span>
          )}
        </td>
        <PnlAmountCell
          amount={curVal && curVal > 0 ? curVal : null}
          hideDelta
          hideRate
          tdClassName="py-2 px-4 text-right tabular-nums font-mono font-medium"
        />
        <PnlAmountCell
          amount={prevVal && prevVal > 0 ? prevVal : null}
          isLoading={isLoadingPrev}
          hideDelta
          hideRate
          tdClassName="py-2 px-4 text-right tabular-nums font-mono text-slate-700 dark:text-slate-300"
        />
        <PnlAmountCell
          amount={prev2Val && prev2Val > 0 ? prev2Val : null}
          isLoading={isLoadingPrev2}
          hideDelta
          hideRate
          tdClassName="py-2 px-4 text-right tabular-nums font-mono text-muted-foreground"
        />
      </tr>

      {/* Sub-item Level 3 nếu có ojAmount > 0 (Chỉ hiện khi xem Toàn bộ) */}
      {hasOjSub && (
        <tr className="text-muted-foreground bg-slate-50/30 dark:bg-slate-800/10 hover:bg-muted/10 transition-colors border-b border-border/20">
          <td className="py-1.5 pl-14 pr-4">
            <span className="text-[11px] italic">
              5.{index + 1}.1. Trong đó: Phát sinh liên quan OJ
            </span>
          </td>
          <PnlAmountCell
            amount={item.curOjAmount || null}
            hideDelta
            hideRate
            tdClassName={subCell}
          />
          <PnlAmountCell
            amount={item.prevOjAmount || null}
            isLoading={isLoadingPrev}
            hideDelta
            hideRate
            tdClassName={subCell}
          />
          <PnlAmountCell
            amount={item.prev2OjAmount || null}
            isLoading={isLoadingPrev2}
            hideDelta
            hideRate
            tdClassName={subCell}
          />
        </tr>
      )}
    </React.Fragment>
  );
}
