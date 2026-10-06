import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { FileText, Sparkles, CheckSquare, Receipt } from "lucide-react";
import { PillTabs, type PillTabItem } from "@/shared/components/PillTabs";
import { Button } from "@/shared/components/ui/Button";
import { formatNumber } from "../../garage-case-preview/GarageCasePreview.helper";

export interface CaseLinePaymentPresetBarProps {
  viewPreset: "all" | "suggestions" | "selected" | "linked";
  onSelectPreset: (
    preset: "all" | "suggestions" | "selected" | "linked",
  ) => void;
  totalCount: number;
  suggestionsCount: number;
  selectedCount: number;
  linkedCount: number;
  selectedTotal?: number;
  onUnselectAll?: () => void;
  onSelectAllSuggestions?: () => void;
}

export function CaseLinePaymentPresetBar({
  viewPreset,
  onSelectPreset,
  totalCount,
  suggestionsCount,
  selectedCount,
  linkedCount,
  selectedTotal = 0,
  onUnselectAll,
  onSelectAllSuggestions,
}: CaseLinePaymentPresetBarProps) {
  const { t } = useTranslation(["garage", "common"]);

  // Thứ tự đảo ngược: 1. Đã cấn trừ -> 2. Đang chọn -> 3. Gợi ý khớp -> 4. Tất cả
  const presetItems: PillTabItem<
    "all" | "suggestions" | "selected" | "linked"
  >[] = useMemo(
    () => [
      {
        value: "linked",
        label: t("cases.financials.presetLinked", "Đã cấn trừ"),
        icon: Receipt,
        badgeCount: linkedCount || undefined,
      },
      {
        value: "selected",
        label: t("cases.financials.presetSelected", "Đang chọn"),
        icon: CheckSquare,
        badgeCount: selectedCount || undefined,
      },
      {
        value: "suggestions",
        label: t("cases.financials.presetSuggestions", "Gợi ý khớp"),
        icon: Sparkles,
        badgeCount: suggestionsCount || undefined,
      },
      {
        value: "all",
        label: t("cases.financials.presetAll", "Tất cả"),
        icon: FileText,
        badgeCount: totalCount || undefined,
      },
    ],
    [linkedCount, selectedCount, suggestionsCount, totalCount, t],
  );

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 p-1.5 bg-slate-50 dark:bg-slate-900/60 rounded-lg border border-slate-200/80 dark:border-slate-800">
      {/* ─── BÊN TRÁI: PILL TABS CHUẨN HOÁ ─── */}
      <div className="flex items-center">
        <PillTabs
          value={viewPreset}
          onValueChange={(val) =>
            onSelectPreset(val as "all" | "suggestions" | "selected" | "linked")
          }
          items={presetItems}
          size="sm"
          variant="pill"
        />
      </div>

      {/* ─── BÊN PHẢI: QUICK ACTIONS ─── */}
      <div className="flex items-center gap-2">
        {viewPreset === "suggestions" &&
          suggestionsCount > 0 &&
          onSelectAllSuggestions && (
            <Button
              size="sm"
              variant="outline"
              onClick={onSelectAllSuggestions}
              className="h-7 text-xs px-2.5 gap-1.5 border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 hover:bg-amber-100 font-semibold cursor-pointer"
            >
              <Sparkles className="w-3 h-3 text-amber-600 dark:text-amber-400" />
              <span>
                {t(
                  "cases.financials.selectAllSuggestions",
                  "Chọn tất cả gợi ý ({{count}})",
                  { count: suggestionsCount },
                )}
              </span>
            </Button>
          )}

        {selectedCount > 0 && (
          <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200 dark:border-slate-800">
            <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200">
              {formatNumber(selectedTotal)} ₫
            </span>
            {onUnselectAll && (
              <Button
                size="sm"
                variant="ghost"
                onClick={onUnselectAll}
                className="h-7 text-xs px-2 text-rose-600 dark:text-rose-400 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/50 cursor-pointer"
              >
                {t("cases.financials.unselect", "Bỏ chọn")}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
