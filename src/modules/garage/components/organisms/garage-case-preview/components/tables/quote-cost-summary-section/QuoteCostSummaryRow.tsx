import React from "react";
import { useTranslation } from "react-i18next";
import { Banknote, Wallet } from "lucide-react";
import { Tooltip } from "@/core/components/ui/Tooltip";
import { formatNumber } from "../../../GarageCasePreview.helper";
import type { QuoteCostSummaryRowProps } from "./QuoteCostSummarySection.type";

export const QuoteCostSummaryRow: React.FC<QuoteCostSummaryRowProps> = ({
  totalCostAmount,
  totalPaid,
  remainingAmount,
  canPerformPayment,
  disabledReason,
  onPaymentClick,
}) => {
  const { t } = useTranslation(["garage", "common"]);

  const payBtn = (
    <button
      type="button"
      disabled={!canPerformPayment}
      onClick={canPerformPayment ? onPaymentClick : undefined}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-amber-500 text-white shadow-xs transition-colors ${
        canPerformPayment
          ? "hover:bg-amber-600 cursor-pointer"
          : "opacity-60 cursor-not-allowed pointer-events-none"
      }`}
    >
      <Banknote className="w-3.5 h-3.5" />
      <span>{t("cases.financials.payCostBtn", "Chi tiền")}</span>
    </button>
  );

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 rounded-lg border border-border/80 bg-card/60 shadow-xs">
      <div className="flex items-center gap-2.5">
        <div className="p-2 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400">
          <Wallet className="w-4 h-4" />
        </div>
        <div>
          <div className="text-xs font-semibold text-foreground">
            {t("cases.financials.totalCostTitle", "Tổng chi phí vụ việc")}
          </div>
          <div className="text-[11px] text-muted-foreground">
            {t("cases.financials.totalCostSub", "Giá vốn vật tư & nhân công")}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4 sm:gap-6 w-full sm:w-auto justify-between sm:justify-end">
        <div className="text-right">
          <div className="text-[10px] text-muted-foreground uppercase tracking-wider">
            {t("cases.financials.targetCostLabel", "Mục tiêu")}
          </div>
          <div className="text-xs font-mono font-bold text-foreground">
            {formatNumber(totalCostAmount)} ₫
          </div>
        </div>

        <div className="text-right">
          <div className="text-[10px] text-muted-foreground uppercase tracking-wider">
            {t("cases.financials.paidCostLabel", "Đã chi")}
          </div>
          <div className="text-xs font-mono font-semibold text-emerald-600 dark:text-emerald-400">
            {formatNumber(totalPaid)} ₫
          </div>
        </div>

        <div className="text-right">
          <div className="text-[10px] text-muted-foreground uppercase tracking-wider">
            {t("cases.financials.remainingCostLabel", "Còn lại")}
          </div>
          <div className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400">
            {formatNumber(remainingAmount)} ₫
          </div>
        </div>

        {!canPerformPayment && disabledReason ? (
          <Tooltip content={disabledReason} side="top">
            <span className="inline-flex cursor-not-allowed">{payBtn}</span>
          </Tooltip>
        ) : (
          payBtn
        )}
      </div>
    </div>
  );
};
