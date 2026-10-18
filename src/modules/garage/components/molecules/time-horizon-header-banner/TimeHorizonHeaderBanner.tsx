import React from "react";
import { useTranslation } from "react-i18next";
import { PillTabs } from "@/shared/components/PillTabs";
import { Badge } from "@/shared/components/ui/badge";
import { FileText, Users, BarChart2, RotateCcw } from "lucide-react";
import type {
  TimeHorizonHeaderBannerProps,
  TimeHorizonSubTab,
} from "./TimeHorizonHeaderBanner.type";

export const TimeHorizonHeaderBanner: React.FC<
  TimeHorizonHeaderBannerProps
> = ({
  activeSubTab,
  onSubTabChange,
  totalCases = 0,
  topPartnersCount = 0,
  activeFilterCount = 0,
  onResetFilters,
}) => {
  const { t } = useTranslation(["garage", "debts", "common"]);

  const tabItems = [
    {
      value: "cases" as TimeHorizonSubTab,
      label: (
        <span className="flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5 text-primary" />
          <span>{t("garage:debts.subtabs.cases", "Danh sách vụ việc")}</span>
          <Badge
            variant="outline"
            className="ml-1 text-[10px] px-1.5 py-0 h-4 bg-muted/60"
          >
            {totalCases}
          </Badge>
        </span>
      ),
    },
    {
      value: "top_partners" as TimeHorizonSubTab,
      label: (
        <span className="flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5 text-emerald-600" />
          <span>
            {t("garage:debts.subtabs.partners", "Top đối tác chi phối")}
          </span>
          <Badge
            variant="outline"
            className="ml-1 text-[10px] px-1.5 py-0 h-4 bg-muted/60"
          >
            {topPartnersCount}
          </Badge>
        </span>
      ),
    },
    {
      value: "analytics" as TimeHorizonSubTab,
      label: (
        <span className="flex items-center gap-1.5">
          <BarChart2 className="w-3.5 h-3.5 text-amber-600" />
          <span>
            {t("garage:debts.subtabs.analytics", "Phân tích chuyên sâu")}
          </span>
        </span>
      ),
    },
  ];

  return (
    <div className="flex items-center justify-between flex-wrap gap-2 p-2 rounded-lg bg-surface border border-border/70">
      <PillTabs<TimeHorizonSubTab>
        value={activeSubTab}
        onValueChange={onSubTabChange}
        items={tabItems}
        size="sm"
        className="w-auto"
      />

      <div className="flex items-center gap-2">
        {activeFilterCount > 0 && onResetFilters && (
          <button
            type="button"
            onClick={onResetFilters}
            className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground px-2 py-1 rounded border border-border/70 hover:bg-muted/40 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>
              {t("common:clearFilter", "Xóa lọc")} ({activeFilterCount})
            </span>
          </button>
        )}
      </div>
    </div>
  );
};
