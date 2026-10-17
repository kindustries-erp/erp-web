import React from "react";
import { money } from "@/shared/utils/format";
import type { CashflowTopRowProps } from "./CashflowTopRow.type";

export const CashflowTopRow: React.FC<CashflowTopRowProps> = ({
  item,
  type,
  index,
  onClickItem,
  onClickCase,
}) => {
  const isReceipt = type === "RECEIPT";

  return (
    <div className="flex items-center justify-between py-2.5 px-3 hover:bg-muted/50 rounded-lg transition-colors text-xs border border-transparent hover:border-border/60">
      <div className="flex items-start gap-2.5 min-w-0 flex-1 mr-3">
        <span className="font-semibold text-muted-foreground w-4 shrink-0 text-right pt-0.5">
          {index + 1}.
        </span>
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => onClickItem?.(item)}
              className="font-medium text-foreground hover:underline text-left cursor-pointer truncate"
            >
              {item.voucherCode}
            </button>
            {item.caseCode && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onClickCase?.(item.caseCode!);
                }}
                className="text-[10px] px-1.5 py-0.2 rounded bg-muted hover:bg-muted/80 text-muted-foreground transition-colors font-mono cursor-pointer"
              >
                {item.caseCode}
              </button>
            )}
            {item.licensePlate && (
              <span className="text-[10px] px-1 py-0.2 rounded bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200/80 font-mono">
                {item.licensePlate}
              </span>
            )}
          </div>
          <div className="text-[11px] text-muted-foreground truncate mt-0.5">
            {item.partnerName || item.paymentContent || "—"}
          </div>
        </div>
      </div>

      <div className="flex flex-col items-end shrink-0">
        <span
          className={
            isReceipt
              ? "font-bold text-emerald-600 dark:text-emerald-400"
              : "font-bold text-[#ea580c] dark:text-orange-400"
          }
        >
          {isReceipt ? "+" : "-"}
          {money(item.amount)}
        </span>
        <span className="text-[10px] text-muted-foreground mt-0.5">
          {item.transDate}
        </span>
      </div>
    </div>
  );
};
