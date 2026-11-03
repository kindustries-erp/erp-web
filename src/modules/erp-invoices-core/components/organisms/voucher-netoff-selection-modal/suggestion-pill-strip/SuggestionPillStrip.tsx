import React from "react";
import { useTranslation } from "react-i18next";
import { Sparkles } from "lucide-react";
import { Button } from "@/shared/components/ui/Button";
import { SuggestionPill } from "./SuggestionPill";
import type { SuggestionPillStripProps } from "./SuggestionPillStrip.type";

/**
 * Dải pill gợi ý khớp, cuộn ngang. Chỉ đọc danh sách gợi ý và trạng thái chọn,
 * không đọc/ghi state của bảng (filter, phân trang, khoảng ngày).
 */
export function SuggestionPillStrip({
  suggestions,
  selectedIds,
  onToggle,
  onSelectAll,
  isLoading = false,
  currentRemaining,
  onViewDetail,
}: SuggestionPillStripProps) {
  const { t } = useTranslation("erpInvoices");

  if (!isLoading && suggestions.length === 0) return null;

  const pendingCount = suggestions.filter(
    (s) => !selectedIds.includes(s.txn.id),
  ).length;

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      e.currentTarget.scrollLeft += e.deltaY;
    }
  };

  return (
    <div className="px-3 pt-3 space-y-2">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
          <Sparkles className="w-3.5 h-3.5 text-muted-foreground" />
          <span>
            {t("suggestionStripTitle", "Gợi ý khớp")}
            {!isLoading && ` (${suggestions.length})`}
          </span>
        </div>
        {pendingCount >= 2 && (
          <Button
            size="sm"
            variant="outline"
            onClick={onSelectAll}
            className="h-6 text-[11px] px-2 cursor-pointer"
          >
            {t("selectAllSuggestionsTitle", "Chọn tất cả ({{count}})", {
              count: pendingCount,
            })}
          </Button>
        )}
      </div>

      <div
        onWheel={handleWheel}
        className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin"
      >
        {isLoading
          ? [0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-8 w-40 shrink-0 rounded-full bg-slate-100 dark:bg-slate-800 animate-pulse"
              />
            ))
          : suggestions.map((s) => (
              <SuggestionPill
                key={s.txn.id}
                suggestion={s}
                selected={selectedIds.includes(s.txn.id)}
                onToggle={onToggle}
                currentRemaining={currentRemaining}
                onViewDetail={onViewDetail}
              />
            ))}
      </div>
    </div>
  );
}
