import React from "react";
import { useTranslation } from "react-i18next";
import {
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";
import { money } from "@/shared/utils/format";
import { cn } from "@/shared/utils";
import type { AdjustmentFinancialSummaryProps } from "./AdjustmentFinancialSummary.type";

export const AdjustmentFinancialSummary: React.FC<
  AdjustmentFinancialSummaryProps
> = ({ financial, role, onExecuteNetoff, isExecuting = false, className }) => {
  const { t } = useTranslation("erpInvoices");
  const isNegative = financial.adjustedDeltaAmount < 0;

  return (
    <div
      className={cn(
        "p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/50 space-y-2.5",
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
          {t("Cân đối tài chính & Dư nợ")}
        </span>
        {financial.isFullyCancelled && (
          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300">
            {t("Hủy bỏ 100%")}
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="p-2 rounded-lg bg-white dark:bg-slate-950/80 border border-slate-100 dark:border-slate-800">
          <div className="text-[10px] text-slate-400">{t("Tiền HĐ gốc")}</div>
          <div className="font-mono font-bold text-slate-800 dark:text-slate-100 mt-0.5">
            {money(financial.originalAmount)}
          </div>
        </div>

        <div className="p-2 rounded-lg bg-white dark:bg-slate-950/80 border border-slate-100 dark:border-slate-800">
          <div className="text-[10px] text-slate-400 flex items-center gap-1">
            {isNegative ? (
              <ArrowDownRight className="w-3 h-3 text-rose-500" />
            ) : (
              <ArrowUpRight className="w-3 h-3 text-emerald-500" />
            )}
            {t("Chênh lệch ĐC")}
          </div>
          <div
            className={cn(
              "font-mono font-bold mt-0.5",
              isNegative
                ? "text-rose-600 dark:text-rose-400"
                : "text-emerald-600 dark:text-emerald-400",
            )}
          >
            {financial.adjustedDeltaAmount > 0 ? "+" : ""}
            {money(financial.adjustedDeltaAmount)}
          </div>
        </div>
      </div>

      <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-xs">
        <div>
          <span className="text-slate-500 text-[11px] block">
            {t("Dư nợ thực tế:")}
          </span>
          <span className="font-mono font-bold text-sm text-slate-900 dark:text-slate-100">
            {money(financial.remainingDebt)}
          </span>
        </div>

        {financial.netoffOffsetAmount > 0 ? (
          <div className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>
              {t("Đã cấn trừ {{amount}}", {
                amount: money(financial.netoffOffsetAmount),
              })}
            </span>
          </div>
        ) : onExecuteNetoff && role === "ADJUSTING" ? (
          <button
            type="button"
            onClick={onExecuteNetoff}
            disabled={isExecuting}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 active:scale-95 transition-all shadow-2xs cursor-pointer disabled:opacity-60"
          >
            <RefreshCw
              className={cn("w-3 h-3", isExecuting && "animate-spin")}
            />
            {t("Cấn trừ ngay")}
          </button>
        ) : null}
      </div>
    </div>
  );
};

export default AdjustmentFinancialSummary;
