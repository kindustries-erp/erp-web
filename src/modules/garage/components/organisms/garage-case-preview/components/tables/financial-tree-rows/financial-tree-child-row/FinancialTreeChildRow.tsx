import React from "react";
import { useTranslation } from "react-i18next";
import {
  CornerDownRight,
  FileText,
  Banknote,
  Landmark,
  Trash2,
} from "lucide-react";
import { formatNumber } from "../../../../GarageCasePreview.helper";
import { Button } from "@/shared/components/ui/Button";
import { cn } from "@/shared/utils";
import type { FinancialTreeChildRowProps } from "./FinancialTreeChildRow.type";

export function FinancialTreeChildRow({
  item,
  canRemove = false,
  disabledReason,
  onRemove,
  className,
}: FinancialTreeChildRowProps) {
  const { t } = useTranslation(["garage", "common"]);

  const renderIcon = () => {
    switch (item.iconType) {
      case "INVOICE":
        return (
          <div className="w-6 h-6 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center shrink-0">
            <FileText className="w-3.5 h-3.5" />
          </div>
        );
      case "CASH":
        return (
          <div className="w-6 h-6 rounded-full bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 flex items-center justify-center shrink-0">
            <Banknote className="w-3.5 h-3.5" />
          </div>
        );
      case "BANK":
      default:
        return (
          <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0">
            <Landmark className="w-3.5 h-3.5" />
          </div>
        );
    }
  };

  return (
    <div
      className={cn(
        "group flex items-center justify-between px-3 py-2 text-xs border-b border-border/40 hover:bg-muted/40 transition-colors",
        item.isPending && "bg-amber-50/30 dark:bg-amber-950/10",
        className,
      )}
    >
      {/* ── CỘT 1: THỤT LỀ ↳ VÀ THÔNG TIN CHỨNG TỪ ── */}
      <div className="flex items-center gap-2.5 min-w-0 flex-1 pl-6">
        <CornerDownRight className="w-3.5 h-3.5 text-muted-foreground/70 shrink-0" />
        {renderIcon()}
        <div className="flex items-center gap-2 min-w-0 flex-wrap">
          <span className="font-medium text-foreground truncate">
            {item.title}
          </span>
          {item.partnerName && (
            <span className="text-[11px] text-muted-foreground truncate max-w-[180px]">
              ({item.partnerName})
            </span>
          )}
          {item.payer === "BH" && (
            <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
              {t("cases.quotePreview.fin.payerBH", "Bảo hiểm")}
            </span>
          )}
          {item.isPending && (
            <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300/60">
              {t("cases.reconciliation.pendingBadge", "Chờ lưu")}
            </span>
          )}
        </div>
      </div>

      {/* ── CỘT 2: SỐ TIỀN ── */}
      <div className="w-36 text-right font-mono tabular-nums font-semibold text-xs text-foreground px-2">
        {formatNumber(item.amount)} ₫
      </div>

      {/* ── CỘT 3: % TỔNG ── */}
      <div className="w-20 text-right font-mono tabular-nums text-xs text-muted-foreground px-2">
        {item.percentOfTotal}%
      </div>

      {/* ── CỘT 4: THAO TÁC (GỠ / XÓA) ── */}
      <div className="w-16 flex justify-end shrink-0 pl-1">
        {onRemove && (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => onRemove(item)}
            disabled={!canRemove}
            className={cn(
              "h-6 w-6 text-muted-foreground transition-opacity",
              canRemove
                ? "hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 opacity-70 group-hover:opacity-100"
                : "opacity-30 cursor-not-allowed hover:bg-transparent text-muted-foreground/50",
            )}
            title={
              !canRemove
                ? disabledReason ||
                  t(
                    "cases.financials.disabledNoEditMode",
                    "Cần bật Chế độ chỉnh sửa để thao tác.",
                  )
                : t("common.delete", "Xóa")
            }
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        )}
      </div>
    </div>
  );
}
