import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { FileText, Sparkles, CheckSquare, Receipt } from "lucide-react";
import { PillTabs, type PillTabItem } from "@/shared/components/PillTabs";

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
}: CaseLinePaymentPresetBarProps) {
  const { t } = useTranslation(["garage", "common"]);

  // Thứ tự: 1. Đã cấn trừ -> 2. Đang chọn -> 3. Gợi ý khớp -> 4. Tất cả
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
  );
}
