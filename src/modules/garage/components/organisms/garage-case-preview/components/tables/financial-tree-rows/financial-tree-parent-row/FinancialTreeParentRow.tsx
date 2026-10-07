import React from "react";
import { useTranslation } from "react-i18next";
import { Landmark, Wallet, Plus } from "lucide-react";
import { formatNumber } from "../../../../GarageCasePreview.helper";
import { Button } from "@/shared/components/ui/Button";
import { cn } from "@/shared/utils";
import type { FinancialTreeParentRowProps } from "./FinancialTreeParentRow.type";

export function FinancialTreeParentRow({
  item,
  childCount,
  canPerform = true,
  disabledReason,
  hasInsurance = false,
  onCollect,
  onCollectKH,
  onCollectBH,
  onPay,
  className,
}: FinancialTreeParentRowProps) {
  const { t } = useTranslation(["garage", "common"]);

  const isRevenue = item.direction === "REVENUE";

  const renderIcon = () => {
    if (isRevenue) {
      return (
        <div className="w-7 h-7 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center justify-center shrink-0">
          <Landmark className="w-4 h-4" />
        </div>
      );
    }
    return (
      <div className="w-7 h-7 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center justify-center shrink-0">
        <Wallet className="w-4 h-4" />
      </div>
    );
  };

  const renderActions = () => {
    if (!isRevenue) {
      return (
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={onPay}
          disabled={!canPerform}
          title={!canPerform ? disabledReason : undefined}
          className="h-6 px-2 text-xs font-medium gap-1 rounded bg-amber-50 hover:bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:hover:bg-amber-900/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800 shadow-none"
        >
          <Plus className="w-3 h-3" />
          <span>{t("cases.financials.payCostBtn", "Chi tiền")}</span>
        </Button>
      );
    }

    if (hasInsurance) {
      return (
        <div className="flex items-center gap-1.5">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={onCollectKH}
            disabled={!canPerform}
            title={!canPerform ? disabledReason : undefined}
            className="h-6 px-1.5 text-xs font-medium rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 shadow-none"
          >
            {t("cases.quotePreview.fin.btnCollectKH", "Thu KH")}
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={onCollectBH}
            disabled={!canPerform}
            title={!canPerform ? disabledReason : undefined}
            className="h-6 px-1.5 text-xs font-medium rounded bg-purple-50 hover:bg-purple-100 text-purple-800 dark:bg-purple-950/50 dark:text-purple-300 border border-purple-200 dark:border-purple-800 shadow-none"
          >
            {t("cases.quotePreview.fin.btnCollectBH", "Thu BH")}
          </Button>
        </div>
      );
    }

    return (
      <Button
        type="button"
        variant="secondary"
        size="sm"
        onClick={onCollect}
        disabled={!canPerform}
        title={!canPerform ? disabledReason : undefined}
        className="h-6 px-2 text-xs font-medium gap-1 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:hover:bg-emerald-900/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 shadow-none"
      >
        <Plus className="w-3 h-3" />
        <span>{t("cases.quotePreview.fin.btnCollect", "Thu tiền")}</span>
      </Button>
    );
  };

  return (
    <div
      className={cn(
        "flex items-center justify-between px-3 py-2.5 bg-muted/20 border-b border-border/80 font-medium transition-colors hover:bg-muted/30",
        className,
      )}
    >
      {/* ── CỘT 1: ICON VÀ TIÊU ĐỀ MỤC TIÊU ── */}
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        {renderIcon()}
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-foreground text-xs leading-none">
              {item.title}
            </span>
            <span className="text-[11px] text-muted-foreground font-normal">
              ({childCount} {t("cases.financials.itemsCountSuffix", "cấn trừ")})
            </span>
          </div>
          {item.subTitle && (
            <span className="text-[11px] text-muted-foreground mt-0.5 truncate max-w-md">
              {item.subTitle}
            </span>
          )}
        </div>
      </div>

      {/* ── CỘT 2: SỐ TIỀN VÀ TÓM TẮT ĐÃ THU/CHI ── */}
      <div className="w-36 text-right px-2">
        <div className="font-mono tabular-nums font-bold text-xs text-foreground">
          {formatNumber(item.targetAmount ?? item.amount)} ₫
        </div>
        <div className="text-[10px] text-muted-foreground font-mono tabular-nums">
          {t("cases.financials.paidPrefix", "Đã")}:{" "}
          <span className="text-emerald-600 dark:text-emerald-400 font-medium">
            {formatNumber(item.settledAmount || 0)}
          </span>{" "}
          • {t("cases.financials.remPrefix", "Còn")}:{" "}
          <span className="text-rose-600 dark:text-rose-400 font-medium">
            {formatNumber(item.remainingAmount || 0)}
          </span>
        </div>
      </div>

      {/* ── CỘT 3: % TỔNG ── */}
      <div className="w-20 text-right font-mono tabular-nums font-semibold text-xs text-foreground px-2">
        100.0%
      </div>

      {/* ── CỘT 4: THAO TÁC (NÚT THU/CHI TIỀN) ── */}
      <div className="w-24 flex justify-end shrink-0 pl-1">
        {renderActions()}
      </div>
    </div>
  );
}
