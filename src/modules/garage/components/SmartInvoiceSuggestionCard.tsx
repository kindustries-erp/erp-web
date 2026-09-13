import React from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/shared/components/ui/Button";
import { Check, AlertCircle } from "lucide-react";
import { Tooltip } from "@/core/components/ui/Tooltip";
import { money, formatGMT7 } from "@/shared/utils/format";
import {
  BADGE_CONFIG_MAP,
  highlightText,
} from "@/modules/erp-invoices-core/components/SmartSuggestionCard";
import type { GarageSmartInvoiceSuggestionItem } from "../api/garageApi";
import { cn } from "@/shared/utils";

export interface SmartInvoiceSuggestionCardProps {
  suggestion: GarageSmartInvoiceSuggestionItem;
  isSelected?: boolean;
  onAccept?: () => void;
  onViewDetail?: (invoice: any) => void;
}

export function SmartInvoiceSuggestionCard({
  suggestion,
  isSelected = false,
  onAccept,
  onViewDetail,
}: SmartInvoiceSuggestionCardProps) {
  const { t } = useTranslation(["erpInvoices", "garage", "common"]);
  const { invoice, score, matchedKeywords = [] } = suggestion;

  const cfg = score?.badge ? BADGE_CONFIG_MAP[score.badge] : null;
  const partner =
    invoice.direction === "IN"
      ? invoice.sellerName || "—"
      : invoice.buyerName || "—";
  const desc = invoice.description || "—";

  return (
    <div
      className={cn(
        "flex flex-col gap-1.5 p-2.5 rounded-lg border shadow-2xs relative group text-xs transition-all",
        isSelected
          ? "bg-primary/5 border-primary/60 dark:bg-primary/10 dark:border-primary/50 ring-1 ring-primary/40"
          : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col min-w-0 flex-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] text-slate-400 font-medium font-mono">
              {invoice.invoiceDate
                ? formatGMT7(invoice.invoiceDate, "date")
                : ""}
            </span>
            {invoice.serialNo && (
              <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                {invoice.serialNo}
              </span>
            )}
          </div>
          <span
            className="text-[11px] font-mono font-bold text-slate-800 dark:text-slate-200 cursor-pointer hover:text-primary transition-colors truncate"
            onClick={() => onViewDetail && onViewDetail(invoice)}
            title={t(
              "smartSuggestion.viewDetailInvoice",
              "Nhấn để xem chi tiết hóa đơn",
            )}
          >
            Số: {invoice.invoiceNo || "---"}
          </span>
        </div>

        <div className="flex items-start gap-1.5 shrink-0">
          <div className="text-right flex flex-col items-end">
            <div className="font-bold text-xs font-mono text-slate-800 dark:text-slate-100 tabular-nums">
              {money(invoice.totalAmount)}
            </div>
            {cfg && (
              <div
                className={`mt-0.5 flex items-center px-1.5 py-0.5 rounded text-[9px] font-medium border whitespace-nowrap leading-none ${cfg.badgeClasses}`}
              >
                <span className="relative flex h-1.5 w-1.5 mr-1 shrink-0">
                  <span
                    className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${cfg.glowClasses}`}
                  ></span>
                  <span
                    className={`relative inline-flex rounded-full h-1.5 w-1.5 ${cfg.dotClasses}`}
                  ></span>
                </span>
                {t(cfg.key, cfg.label)}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Partner Name */}
      <div className="text-[10px] text-slate-500 font-medium truncate">
        {invoice.direction === "IN" ? "Bên bán:" : "Bên mua:"}{" "}
        <span className="text-slate-700 dark:text-slate-300 font-semibold">
          {highlightText(partner, matchedKeywords)}
        </span>
      </div>

      {/* License plate & Settlement order tags if present */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {invoice.licensePlate && (
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/60 font-semibold">
            🚗 {highlightText(invoice.licensePlate, matchedKeywords)}
          </span>
        )}
        {invoice.settlementOrder && (
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60 font-semibold">
            📋 {highlightText(invoice.settlementOrder, matchedKeywords)}
          </span>
        )}
      </div>

      {/* Description */}
      <Tooltip content={desc}>
        <div className="text-[11px] text-slate-600 dark:text-slate-400 whitespace-normal break-words mt-0.5 line-clamp-2">
          {highlightText(desc, matchedKeywords)}
        </div>
      </Tooltip>

      {/* Accept button */}
      {cfg && cfg.isActionable && onAccept && (
        <div className="mt-1 flex flex-col gap-1">
          <Button
            size="sm"
            variant={isSelected ? "primary" : "outline"}
            className={cn(
              "h-6 text-[11px] w-full transition-colors cursor-pointer font-medium",
              isSelected
                ? "font-semibold shadow-xs"
                : "bg-slate-50 dark:bg-slate-800 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 dark:hover:bg-emerald-950/50 dark:hover:text-emerald-300",
            )}
            onClick={onAccept}
          >
            <Check className="w-3 h-3 mr-1" />
            {isSelected
              ? t("smartSuggestion.selected", "Đang chọn")
              : t("smartSuggestion.accept", "Nhận gợi ý")}
          </Button>
          {cfg.warningText && (
            <div className="flex items-center gap-1 text-[10px] text-amber-700 dark:text-amber-400 italic">
              <AlertCircle className="w-3 h-3 shrink-0" />
              <span>
                {cfg.warningKey
                  ? t(cfg.warningKey, cfg.warningText)
                  : cfg.warningText}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
