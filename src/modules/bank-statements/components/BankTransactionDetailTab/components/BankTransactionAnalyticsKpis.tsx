import React from "react";
import { useTranslation } from "react-i18next";
import { TrendingUp, TrendingDown, Scale, FileText } from "lucide-react";
import { money } from "@/shared/utils/format";
import { cn } from "@/shared/utils";

export interface BankTransactionAnalyticsKpisProps {
  totalIn: number;
  totalOut: number;
  netFlow: number;
  partnerTotal: number;
  periodsCount: number;
}

export const BankTransactionAnalyticsKpis = React.memo(
  function BankTransactionAnalyticsKpis({
    totalIn,
    totalOut,
    netFlow,
    partnerTotal,
    periodsCount,
  }: BankTransactionAnalyticsKpisProps) {
    const { t } = useTranslation();

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-2.5 w-full">
        {/* KPI 1: Tổng thu */}
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>
                {t("bankStatement.totalIncomeIn", {
                  defaultValue: "Tổng thu (Tiền vào)",
                })}
              </span>
            </span>
            <span className="text-[11px] font-medium text-muted-foreground/70">
              {periodsCount}{" "}
              {t("bankStatement.periodsUnit", { defaultValue: "kỳ" })}
            </span>
          </div>
          <div className="mt-2 text-lg font-bold text-foreground tabular-nums">
            {money(totalIn)}
          </div>
          <div className="mt-1 text-[11px] text-muted-foreground">
            {t("bankStatement.totalIncomeInDesc", {
              defaultValue: "Tổng tiền nhận từ đối tác",
            })}
          </div>
        </div>

        {/* KPI 2: Tổng chi */}
        <div className="p-3 rounded-xl bg-orange-500/10 border border-orange-500/20 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="font-semibold text-orange-600 dark:text-orange-400 flex items-center gap-1.5">
              <TrendingDown className="w-3.5 h-3.5" />
              <span>
                {t("bankStatement.totalExpenseOut", {
                  defaultValue: "Tổng chi (Tiền ra)",
                })}
              </span>
            </span>
            <span className="text-[11px] font-medium text-muted-foreground/70">
              {periodsCount}{" "}
              {t("bankStatement.periodsUnit", { defaultValue: "kỳ" })}
            </span>
          </div>
          <div className="mt-2 text-lg font-bold text-foreground tabular-nums">
            {money(totalOut)}
          </div>
          <div className="mt-1 text-[11px] text-muted-foreground">
            {t("bankStatement.totalExpenseOutDesc", {
              defaultValue: "Tổng tiền chuyển cho đối tác",
            })}
          </div>
        </div>

        {/* KPI 3: Chênh lệch ròng */}
        <div
          className={cn(
            "p-3 rounded-xl border flex flex-col justify-between",
            netFlow >= 0
              ? "bg-emerald-500/10 border-emerald-500/20"
              : "bg-amber-500/10 border-amber-500/20",
          )}
        >
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span
              className={cn(
                "font-semibold flex items-center gap-1.5",
                netFlow >= 0
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-amber-600 dark:text-amber-400",
              )}
            >
              <Scale className="w-3.5 h-3.5" />
              <span>
                {t("bankStatement.netCashflowDesc", {
                  defaultValue: "Chênh lệch Ròng (Thu - Chi)",
                })}
              </span>
            </span>
          </div>
          <div
            className={cn(
              "mt-2 text-lg font-bold tabular-nums",
              netFlow >= 0
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-amber-600 dark:text-amber-400",
            )}
          >
            {netFlow >= 0 ? "+" : ""}
            {money(netFlow)}
          </div>
          <div className="mt-1 text-[11px] text-muted-foreground">
            {netFlow >= 0
              ? t("bankStatement.positiveNet", {
                  defaultValue: "Dòng tiền dương (Thu > Chi)",
                })
              : t("bankStatement.negativeNet", {
                  defaultValue: "Dòng tiền âm (Chi > Thu)",
                })}
          </div>
        </div>

        {/* KPI 4: Tổng số GD */}
        <div className="p-3 rounded-xl bg-slate-500/10 border border-slate-500/20 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" />
              <span>
                {t("bankStatement.totalTxnCount", {
                  defaultValue: "Tổng số GD đã lưu",
                })}
              </span>
            </span>
            <span className="text-[11px] font-medium text-muted-foreground/70">
              {t("bankStatement.allTime", { defaultValue: "Toàn thời gian" })}
            </span>
          </div>
          <div className="mt-2 text-lg font-bold text-foreground tabular-nums">
            {partnerTotal}{" "}
            <span className="text-xs font-normal text-muted-foreground">
              {t("bankStatement.recordsTransactions", {
                defaultValue: "giao dịch",
              })}
            </span>
          </div>
          <div className="mt-1 text-[11px] text-muted-foreground">
            {t("bankStatement.totalTxnScope", {
              defaultValue: "Tất cả giao dịch thu & chi",
            })}
          </div>
        </div>
      </div>
    );
  },
);
