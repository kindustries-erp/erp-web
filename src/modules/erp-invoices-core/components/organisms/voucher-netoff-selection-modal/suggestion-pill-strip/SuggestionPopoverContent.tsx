import React from "react";
import { useTranslation } from "react-i18next";
import { CheckCircle2, AlertTriangle, Eye } from "lucide-react";
import { money, formatGMT7 } from "@/shared/utils/format";
import { Button } from "@/shared/components/ui/Button";
import {
  SuggestionBadgePill,
  highlightText,
} from "@/modules/erp-invoices-core/components/molecules/smart-suggestion-card";
import { BADGE_CONFIG_MAP } from "@/modules/erp-invoices-core/components/molecules/smart-suggestion-card/SmartSuggestionCard.type";
import type { SmartNetOffSuggestionItem } from "@/modules/erp-invoices-core/api/erpInvoicesCoreApi";

export interface SuggestionPopoverContentProps {
  suggestion: SmartNetOffSuggestionItem;
  currentRemaining?: number;
  onViewDetail?: (id: string) => void;
}

export function SuggestionPopoverContent({
  suggestion,
  currentRemaining,
  onViewDetail,
}: SuggestionPopoverContentProps) {
  const { t } = useTranslation("erpInvoices");
  const { txn, score, matchedKeywords = [], reasons = [] } = suggestion;
  const cfg = BADGE_CONFIG_MAP[score.badge];
  const amount = txn.debitAmount > 0 ? txn.debitAmount : txn.creditAmount;
  const source =
    txn.sourceType === "BANK"
      ? [txn.bankAccount?.bankName, txn.bankAccount?.accountNumber]
          .filter(Boolean)
          .join(" · ")
      : txn.cashBook?.name || t("selectedBankTable.cash", "Tiền mặt");

  return (
    <div className="w-[400px] max-w-[92vw] p-3 flex flex-col gap-2.5 text-xs text-foreground">
      {/* Lý do gợi ý */}
      <div className="flex items-center justify-between gap-2">
        <SuggestionBadgePill badgeType={score.badge} showShortLabel={true} />
        <span className="font-mono text-[11px] text-muted-foreground">
          {t("suggestionConfidence", "Độ tin cậy")}{" "}
          <strong className="text-foreground">{score.score}%</strong>
        </span>
      </div>

      {reasons.length > 0 ? (
        <ul className="space-y-1">
          {reasons.map((r) => (
            <li
              key={r.key}
              className="flex items-start gap-1.5 text-[11px] leading-snug"
            >
              {r.matched ? (
                <CheckCircle2 className="w-3.5 h-3.5 mt-px shrink-0 text-emerald-600" />
              ) : (
                <AlertTriangle className="w-3.5 h-3.5 mt-px shrink-0 text-amber-600" />
              )}
              <span>{r.label}</span>
            </li>
          ))}
        </ul>
      ) : (
        cfg && (
          <div className="text-[11px] leading-snug text-muted-foreground">
            {cfg.tooltipText}
            {cfg.warningText && (
              <div className="mt-1 text-amber-700 dark:text-amber-400">
                {cfg.warningText}
              </div>
            )}
          </div>
        )
      )}

      {/* Đối chiếu nhanh với số còn phải thu */}
      {currentRemaining !== undefined && (
        <div className="rounded-md bg-muted/50 px-2 py-1.5 font-mono text-[11px]">
          {t("suggestionCompare", "Số tiền GD")} {money(amount)} ·{" "}
          {t("suggestionRemaining", "còn phải thu")} {money(currentRemaining)}
          {Math.abs(amount - currentRemaining) >= 1 && (
            <span className="text-amber-700 dark:text-amber-400">
              {" "}
              (
              {t("suggestionDiff", "lệch {{diff}}", {
                diff: money(amount - currentRemaining),
              })}
              )
            </span>
          )}
        </div>
      )}

      {/* Nội dung sao kê đầy đủ */}
      <div className="rounded-md border border-border/70 bg-background p-2 space-y-1.5">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] text-muted-foreground font-mono">
            {formatGMT7(txn.transDate, "date")}
          </span>
          <span className="text-[10px] text-muted-foreground truncate">
            {source}
          </span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="font-mono font-semibold text-[11px]">
            {txn.referenceNumber || txn.seqNo || txn.id.split("-")[0]}
          </span>
          {onViewDetail && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onViewDetail(txn.id)}
              className="h-6 px-1.5 text-[11px] cursor-pointer"
            >
              <Eye className="w-3 h-3 mr-1" />
              {t("suggestionViewTxn", "Xem GD")}
            </Button>
          )}
        </div>
        {txn.correspondentName && (
          <div className="text-[11px]">
            <span className="text-muted-foreground">
              {t("smartSuggestion.partner", "Đối tác:")}{" "}
            </span>
            {highlightText(txn.correspondentName, matchedKeywords)}
          </div>
        )}
        <div className="font-mono text-[11px] font-semibold">
          {txn.debitAmount > 0 ? "+" : "−"}
          {money(amount)}
        </div>
        <div className="max-h-40 overflow-y-auto whitespace-pre-wrap break-words text-[11px] leading-snug text-slate-700 dark:text-slate-300 select-text">
          {highlightText(txn.description || "—", matchedKeywords)}
        </div>
      </div>

      <div className="text-[10px] text-muted-foreground">
        {t(
          "suggestionPillHint",
          "Nhấn chip để chọn hoặc bỏ chọn giao dịch này",
        )}
      </div>
    </div>
  );
}
