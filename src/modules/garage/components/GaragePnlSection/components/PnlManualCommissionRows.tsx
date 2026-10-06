import React from "react";
import { useTranslation } from "react-i18next";
import { Badge } from "@/shared/components/ui/badge";
import type { PairedPnlItem } from "../types";

interface PnlManualCommissionRowsProps {
  items: PairedPnlItem[];
  isOjOnly?: boolean;
}

export function PnlManualCommissionRows({
  items,
  isOjOnly = false,
}: PnlManualCommissionRowsProps) {
  const { t } = useTranslation("garage");

  return (
    <>
      {items.map((item, idx) => {
        const curAmount = isOjOnly ? item.curOjAmount || 0 : item.curAmount;
        const prevAmount = isOjOnly ? item.prevOjAmount : item.prevAmount;
        const prev2Amount = isOjOnly ? item.prev2OjAmount : item.prev2Amount;

        return (
          <React.Fragment key={item.key}>
            <tr className="text-muted-foreground bg-slate-50/40 dark:bg-slate-800/10 hover:bg-muted/10 transition-colors border-b border-border/20">
              <td className="py-2 px-8 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span>
                    7.{idx + 2}. {item.categoryName}
                  </span>
                  <Badge
                    variant="outline"
                    className="text-[9px] px-1 py-0 border-slate-300 dark:border-slate-700 text-muted-foreground"
                  >
                    {t("pnl.manualCommissionBadge", "Nhập tay")}
                  </Badge>
                </div>
                {item.note && (
                  <span className="text-[10px] text-muted-foreground/70 italic max-w-[200px] truncate">
                    ({item.note})
                  </span>
                )}
              </td>
              <td
                className={`py-2 px-4 text-right tabular-nums font-mono font-medium ${
                  curAmount < 0 ? "text-rose-600 dark:text-rose-400" : ""
                }`}
              >
                {curAmount !== 0
                  ? `${curAmount < 0 ? `- ${Math.abs(curAmount).toLocaleString("vi-VN")} đ` : `${curAmount.toLocaleString("vi-VN")} đ`}`
                  : "—"}
              </td>
              <td
                className={`py-2 px-4 text-right tabular-nums font-mono text-slate-700 dark:text-slate-300 ${
                  (prevAmount ?? 0) < 0
                    ? "text-rose-600/80 dark:text-rose-400/80"
                    : ""
                }`}
              >
                {prevAmount !== undefined && prevAmount !== null
                  ? `${prevAmount < 0 ? `- ${Math.abs(prevAmount).toLocaleString("vi-VN")} đ` : `${prevAmount.toLocaleString("vi-VN")} đ`}`
                  : "—"}
              </td>
              <td
                className={`py-2 px-4 text-right tabular-nums font-mono text-muted-foreground ${
                  (prev2Amount ?? 0) < 0
                    ? "text-rose-600/80 dark:text-rose-400/80"
                    : ""
                }`}
              >
                {prev2Amount !== undefined && prev2Amount !== null
                  ? `${prev2Amount < 0 ? `- ${Math.abs(prev2Amount).toLocaleString("vi-VN")} đ` : `${prev2Amount.toLocaleString("vi-VN")} đ`}`
                  : "—"}
              </td>
            </tr>

            {/* Sub-item OJ nếu có */}
            {!isOjOnly &&
              Boolean(
                (item.curOjAmount && item.curOjAmount > 0) ||
                (item.prevOjAmount && item.prevOjAmount > 0) ||
                (item.prev2OjAmount && item.prev2OjAmount > 0),
              ) && (
                <tr className="text-muted-foreground bg-slate-50/30 dark:bg-slate-800/10 hover:bg-muted/10 transition-colors border-b border-border/20">
                  <td className="py-1.5 pl-14 pr-4">
                    <span className="text-[11px] italic">
                      7.{idx + 2}.1. Trong đó: Phát sinh liên quan OJ
                    </span>
                  </td>
                  <td className="py-1.5 px-4 text-right tabular-nums font-mono text-[11px] text-muted-foreground">
                    {item.curOjAmount
                      ? `${item.curOjAmount.toLocaleString("vi-VN")} đ`
                      : "—"}
                  </td>
                  <td className="py-1.5 px-4 text-right tabular-nums font-mono text-[11px] text-muted-foreground">
                    {item.prevOjAmount
                      ? `${item.prevOjAmount.toLocaleString("vi-VN")} đ`
                      : "—"}
                  </td>
                  <td className="py-1.5 px-4 text-right tabular-nums font-mono text-[11px] text-muted-foreground">
                    {item.prev2OjAmount
                      ? `${item.prev2OjAmount.toLocaleString("vi-VN")} đ`
                      : "—"}
                  </td>
                </tr>
              )}
          </React.Fragment>
        );
      })}
    </>
  );
}
