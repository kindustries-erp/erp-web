import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { FileText, Sparkles, Receipt } from "lucide-react";
import { PillTabs, type PillTabItem } from "@/shared/components/PillTabs";

export interface CaseLinePaymentPresetBarProps {
  viewPreset: "all" | "suggestions" | "selected" | "linked";
  onSelectPreset: (preset: "all" | "suggestions" | "linked") => void;
  totalCount: number;
  suggestionsCount: number;
  linkedCount: number;
  selectedCount?: number;
  selectedTotal?: number;
  onUnselectAll?: () => void;
  onSelectAllSuggestions?: () => void;
}

export function CaseLinePaymentPresetBar({
  viewPreset,
  onSelectPreset,
  totalCount,
  suggestionsCount,
  linkedCount,
}: CaseLinePaymentPresetBarProps) {
  const { t } = useTranslation(["garage", "common"]);

  // Thứ tự: 1. Đã cấn trừ -> 2. Gợi ý khớp -> 3. Tất cả
  const presetItems: PillTabItem<"all" | "suggestions" | "linked">[] = useMemo(
    () => [
      {
        value: "linked",
        label: t("cases.financials.presetLinked", "Đã cấn trừ"),
        icon: Receipt,
        badgeCount: linkedCount || undefined,
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
    [linkedCount, suggestionsCount, totalCount, t],
  );

  return (
    <div className="flex items-center">
      <PillTabs
        value={viewPreset === "selected" ? "" : viewPreset}
        onValueChange={(val) =>
          onSelectPreset(val as "all" | "suggestions" | "linked")
        }
        items={presetItems}
        size="sm"
        variant="pill"
      />
    </div>
  );
}
