import { useTranslation } from "react-i18next";
import { Scale, Lock, Wallet } from "lucide-react";
import { money } from "@/shared/utils/format";
import { cn } from "@/shared/utils";

interface SettlementProgressCardProps {
  direction?: "IN" | "OUT";
  editMode: boolean;
  invoiceNo?: string;
  totalInvoiceAmount: number;
  totalNetOff: number;
  remainingDebt: number;
  paymentPercent: number;
  isPaidFull: boolean;
}

export function SettlementProgressCard({
  direction = "OUT",
  editMode,
  invoiceNo,
  totalInvoiceAmount,
  totalNetOff,
  remainingDebt,
  paymentPercent,
  isPaidFull,
}: SettlementProgressCardProps) {
  const { t } = useTranslation(["erpInvoices", "common"]);

  return (
    <div className="space-y-3">
      {/* Header Chế độ xem & Tiêu đề Tab */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
            <Scale className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
            <span>
              {t(
                "settlementTabTitle",
                "Theo dõi Tiến độ Thanh toán & Cấn trừ Hóa đơn",
              )}
            </span>
          </h4>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            {direction === "IN"
              ? t(
                  "settlementProgressIn",
                  "Đối soát tiến độ thanh toán cho Nhà cung cấp",
                )
              : t(
                  "settlementProgressOut",
                  "Đối soát tiến độ thu tiền từ Khách hàng",
                )}
          </p>
        </div>

        {!editMode && (
          <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-[11px] bg-slate-100 dark:bg-slate-800/80 px-2.5 py-1 rounded-md border border-slate-200/60 dark:border-slate-700/60 font-medium">
            <Lock className="w-3 h-3 text-slate-400" />
            <span>{t("viewModeBadge", "Chế độ xem")}</span>
          </div>
        )}
      </div>

      {/* Thẻ KPI tổng quan */}
      <div className="p-3.5 rounded-lg border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs space-y-2.5">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-md bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              <Wallet className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide">
                {direction === "IN"
                  ? t("purchaseDebtCard", "Công nợ Hóa đơn Mua vào")
                  : t("saleDebtCard", "Công nợ Hóa đơn Bán ra")}
              </div>
              <div className="text-[10px] text-slate-400">
                {t("invoiceNoLabel", "HĐ số:")} {invoiceNo || "—"}
              </div>
            </div>
          </div>

          <span
            className={cn(
              "px-2 py-0.5 rounded text-[10px] font-mono font-bold border",
              isPaidFull
                ? "bg-slate-50 text-emerald-700 border-emerald-300 dark:bg-slate-800 dark:text-emerald-300 dark:border-emerald-800"
                : totalNetOff > 0
                  ? "bg-slate-50 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700"
                  : "bg-slate-50 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700",
            )}
          >
            {isPaidFull
              ? t("paidFullBadge", "✓ ĐÃ THANH TOÁN ĐỦ (100%)")
              : totalNetOff > 0
                ? t("paidPartialBadge", "ĐÃ THANH TOÁN ({{percent}}%)", {
                    percent: paymentPercent,
                  })
                : t("unpaidBadge", "CHƯA THANH TOÁN (0%)")}
          </span>
        </div>

        {/* Dòng số liệu & Progress bar */}
        <div className="space-y-1">
          <div className="flex items-baseline justify-between text-xs">
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              {direction === "IN"
                ? t("paidAmountLabel", "Đã thanh toán:")
                : t("collectedAmountLabel", "Đã thu tiền:")}
            </span>
            <div className="text-right">
              <span className="text-base font-bold font-mono text-slate-900 dark:text-slate-100 tabular-nums">
                {money(totalNetOff)}
              </span>
              <span className="text-xs text-slate-400 font-mono ml-1">
                / {money(totalInvoiceAmount)}
              </span>
            </div>
          </div>

          {/* Progress bar Neutral */}
          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden my-1">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500",
                isPaidFull
                  ? "bg-emerald-600"
                  : "bg-slate-600 dark:bg-slate-400",
              )}
              style={{ width: `${Math.min(paymentPercent, 100)}%` }}
            />
          </div>
        </div>

        {/* Chi tiết nợ còn lại */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] font-mono">
          <span className="text-slate-500 dark:text-slate-400">
            {direction === "IN"
              ? t("remainingToPayLabel", "Còn phải thanh toán:")
              : t("remainingToCollectLabel", "Còn phải thu:")}
          </span>
          <span
            className={cn(
              "font-bold",
              remainingDebt === 0 && totalInvoiceAmount > 0
                ? "text-slate-700 dark:text-slate-300"
                : "text-rose-600 dark:text-rose-400",
            )}
          >
            {money(remainingDebt)}
          </span>
        </div>
      </div>
    </div>
  );
}
