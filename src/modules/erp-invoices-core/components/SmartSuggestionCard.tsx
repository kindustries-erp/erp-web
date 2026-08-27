import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/shared/components/ui/Button";
import { Check, X, AlertCircle } from "lucide-react";
import { Tooltip } from "@/core/components/ui/Tooltip";
import { money, formatGMT7 } from "@/shared/utils/format";

export interface SuggestionBadgeConfig {
  key: string;
  label: string;
  badgeClasses: string;
  glowClasses: string;
  dotClasses: string;
  isActionable: boolean;
  warningKey?: string;
  warningText?: string;
}

export const BADGE_CONFIG_MAP: Record<
  "PERFECT" | "HIGH" | "LIKELY" | "POSSIBLE" | "NOTICE_STRONG" | "NOTICE",
  SuggestionBadgeConfig
> = {
  PERFECT: {
    key: "smartSuggestion.badge.perfect",
    label: "Tiền + Số HĐ/CT + Đối tác",
    badgeClasses:
      "text-emerald-800 bg-emerald-100 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800",
    glowClasses: "bg-emerald-500",
    dotClasses: "bg-emerald-600",
    isActionable: true,
  },
  HIGH: {
    key: "smartSuggestion.badge.high",
    label: "Tiền + Số HĐ/CT",
    badgeClasses:
      "text-emerald-700 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800",
    glowClasses: "bg-emerald-400",
    dotClasses: "bg-emerald-500",
    isActionable: true,
  },
  LIKELY: {
    key: "smartSuggestion.badge.likely",
    label: "Tiền + Tên đối tác",
    badgeClasses:
      "text-blue-700 bg-blue-50 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800",
    glowClasses: "bg-blue-400",
    dotClasses: "bg-blue-500",
    isActionable: true,
  },
  POSSIBLE: {
    key: "smartSuggestion.badge.possible",
    label: "Chỉ khớp số tiền",
    badgeClasses:
      "text-amber-800 bg-amber-50 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800",
    glowClasses: "bg-amber-400",
    dotClasses: "bg-amber-500",
    isActionable: true,
    warningKey: "smartSuggestion.warning.possible",
    warningText: "Chỉ khớp số tiền, vui lòng kiểm tra kỹ",
  },
  NOTICE_STRONG: {
    key: "smartSuggestion.badge.noticeStrong",
    label: "Số HĐ/CT + Đối tác (khác tiền)",
    badgeClasses:
      "text-orange-700 bg-orange-100 border-orange-300 dark:bg-orange-950/50 dark:text-orange-300 dark:border-orange-800",
    glowClasses: "bg-orange-500",
    dotClasses: "bg-orange-600",
    isActionable: false,
  },
  NOTICE: {
    key: "smartSuggestion.badge.notice",
    label: "Khớp Số HĐ/CT (khác tiền)",
    badgeClasses:
      "text-orange-600 bg-orange-50 border-orange-200 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-800",
    glowClasses: "bg-orange-400",
    dotClasses: "bg-orange-500",
    isActionable: false,
  },
};

export function highlightText(
  text: string,
  patterns?: string | string[],
): React.ReactNode {
  if (!text || !patterns) return text;
  const list = (Array.isArray(patterns) ? patterns : [patterns]).filter(
    (p) => p && p.trim().length > 0,
  );
  if (list.length === 0) return text;

  const escaped = list.map((p) => p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const regex = new RegExp(`(${escaped.join("|")})`, "gi");
  const parts = text.split(regex);

  return parts.map((part, i) =>
    regex.test(part) ? (
      <mark
        key={i}
        className="bg-amber-200 text-amber-900 rounded-sm px-0.5 not-italic dark:bg-amber-900/60 dark:text-amber-200"
      >
        {part}
      </mark>
    ) : (
      part
    ),
  );
}

export interface SmartSuggestionCardProps {
  txn?: {
    id: string;
    transDate?: string;
    referenceNumber?: string;
    seqNo?: string;
    description?: string;
    debitAmount?: number;
    creditAmount?: number;
    sourceType?: string;
    correspondentName?: string;
    bankAccount?: {
      bankName?: string;
      accountNumber?: string;
    };
    cashBook?: {
      name?: string;
    };
    remainingAmount?: number;
    alreadySettledForThisCase?: boolean;
  };
  amount: number;
  isSuggestion?: boolean;
  badgeType?:
    | "PERFECT"
    | "HIGH"
    | "LIKELY"
    | "POSSIBLE"
    | "NOTICE_STRONG"
    | "NOTICE";
  matchedKeywords?: string[];
  onAccept?: () => void;
  netOffProps?: {
    value: number;
    maxValue?: number;
    onChange: (val: number) => void;
    onRemove: () => void;
  };
  onViewDetail?: (txnId: string) => void;
}

export function SmartSuggestionCard({
  txn,
  amount,
  isSuggestion = false,
  badgeType,
  matchedKeywords = [],
  onAccept,
  netOffProps,
  onViewDetail,
}: SmartSuggestionCardProps) {
  const { t } = useTranslation("erpInvoices");
  const [localVal, setLocalVal] = useState<string>(
    netOffProps
      ? netOffProps.value === 0
        ? ""
        : String(netOffProps.value)
      : "",
  );

  useEffect(() => {
    if (netOffProps) {
      setLocalVal(netOffProps.value === 0 ? "" : String(netOffProps.value));
    }
  }, [netOffProps?.value]);

  const handleBlur = () => {
    if (!netOffProps) return;
    const val = parseFloat(localVal) || 0;
    const safeVal = netOffProps.maxValue
      ? Math.min(val, netOffProps.maxValue)
      : val;
    setLocalVal(safeVal === 0 ? "" : String(safeVal));
    netOffProps.onChange(safeVal);
  };

  const refText =
    txn?.referenceNumber || txn?.seqNo || txn?.id?.split("-")[0] || "---";

  const cfg = badgeType ? BADGE_CONFIG_MAP[badgeType] : null;

  const desc = txn?.description || "—";

  return (
    <div className="flex flex-col gap-1.5 p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs relative group text-xs">
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col min-w-0 flex-1">
          <span className="text-[10px] text-slate-400 font-medium">
            {txn?.transDate ? formatGMT7(txn.transDate, "date") : ""}
          </span>
          <span
            className="text-[11px] font-mono font-semibold text-slate-800 dark:text-slate-200 cursor-pointer hover:text-primary transition-colors truncate"
            onClick={() => txn?.id && onViewDetail && onViewDetail(txn.id)}
            title={t(
              "smartSuggestion.viewDetail",
              "Nhấn để xem chi tiết sao kê",
            )}
          >
            {refText}
          </span>
        </div>

        <div className="flex items-start gap-1.5 shrink-0">
          <div className="text-right flex flex-col items-end">
            <div className="font-bold text-xs font-mono text-slate-800 dark:text-slate-100">
              {money(amount)}
            </div>
            {isSuggestion && (
              <div className="flex flex-wrap items-center justify-end gap-1 mt-0.5">
                {txn?.alreadySettledForThisCase && (
                  <div
                    className="flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold border whitespace-nowrap leading-none bg-violet-100 text-violet-800 border-violet-300 dark:bg-violet-950/60 dark:text-violet-300 dark:border-violet-800"
                    title="Giao dịch này đã được cấn trừ vào vụ việc hiện tại"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-violet-600 mr-1 shrink-0" />
                    ĐÃ CẤN TRỪ
                  </div>
                )}
                {cfg && (
                  <div
                    className={`flex items-center px-1.5 py-0.5 rounded text-[9px] font-medium border whitespace-nowrap leading-none ${cfg.badgeClasses}`}
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
            )}
          </div>
          {!isSuggestion && netOffProps && (
            <button
              type="button"
              className="text-slate-400 hover:text-red-500 transition-colors p-0.5 rounded hover:bg-red-50 dark:hover:bg-red-950/40 cursor-pointer"
              onClick={netOffProps.onRemove}
              title={t("smartSuggestion.deleteTxn", "Xóa giao dịch này")}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      <Tooltip content={desc}>
        <div className="text-[11px] text-slate-600 dark:text-slate-400 whitespace-normal break-words mt-0.5 line-clamp-2">
          {highlightText(desc, matchedKeywords)}
        </div>
      </Tooltip>

      {txn?.correspondentName && (
        <div className="text-[10px] text-slate-500 font-medium truncate">
          {t("smartSuggestion.partner", "Đối tác:")}{" "}
          {highlightText(txn.correspondentName, matchedKeywords)}
        </div>
      )}

      {isSuggestion && cfg && cfg.isActionable && onAccept && (
        <div className="mt-1 flex flex-col gap-1">
          <Button
            size="sm"
            variant="outline"
            className="h-6 text-[11px] w-full bg-slate-50 dark:bg-slate-800 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 dark:hover:bg-emerald-950/50 dark:hover:text-emerald-300 transition-colors cursor-pointer font-medium"
            onClick={onAccept}
          >
            <Check className="w-3 h-3 mr-1 text-emerald-600" />
            {txn?.alreadySettledForThisCase
              ? t("smartSuggestion.reselect", "Chọn lại cấn trừ")
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

      {!isSuggestion && netOffProps && (
        <div className="mt-1 pt-1.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
          <span className="text-[10px] text-slate-500 font-medium whitespace-nowrap">
            {t("smartSuggestion.netOffLabel", "Cấn trừ:")}
          </span>
          <input
            type="number"
            className="w-full text-right h-6 px-1.5 text-xs font-mono font-semibold rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 focus:ring-1 focus:ring-primary focus:outline-none"
            value={localVal}
            min={0}
            max={netOffProps.maxValue || undefined}
            onChange={(e) => setLocalVal(e.target.value)}
            onBlur={handleBlur}
            title={
              netOffProps.maxValue
                ? `Tối đa: ${money(netOffProps.maxValue)}`
                : undefined
            }
          />
        </div>
      )}
    </div>
  );
}
