import React from "react";
import { Filter } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Badge } from "@/shared/components/ui/badge";
import { formatExportRange } from "@/shared/export-jobs";
import { describeFilterConditions } from "./garageCaseFilterSummary";

export interface GarageExportFilterPreviewProps {
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  /** Số điều kiện lọc + tìm kiếm cột đang áp dụng trên bảng (dùng khi không có chi tiết). */
  filterCount: number;
  sortCount?: number;
  /** `filtersStr` của bảng; hiển thị từng điều kiện thay cho số đếm. */
  filtersStr?: string;
}

/** Tóm tắt điều kiện bảng sẽ được giữ nguyên khi xuất "theo filter hiện tại". */
export function GarageExportFilterPreview({
  dateFrom,
  dateTo,
  search,
  filterCount,
  sortCount = 0,
  filtersStr,
}: GarageExportFilterPreviewProps) {
  const { t } = useTranslation("garage");
  const range = formatExportRange(dateFrom, dateTo);
  const conditions = describeFilterConditions(filtersStr, {
    columnLabel: (key) => t(`cases.columns.${key}`, key),
    contains: t("exportJobs.conditionContains", "chứa"),
    statusName: (tab) =>
      t(
        `exportJobs.statusTab.${tab}`,
        tab === "quotation"
          ? "Báo giá"
          : tab === "in_progress"
            ? "Đang làm"
            : "Đã kết thúc",
      ),
    empty: t("exportJobs.conditionEmpty", "(trống)"),
  });

  const row = (label: string, value: React.ReactNode, last = false) => (
    <div
      className={`flex justify-between items-center py-0.5 ${last ? "" : "border-b border-border/40"}`}
    >
      <span>{label}</span>
      <span className="font-medium text-foreground text-right">{value}</span>
    </div>
  );

  return (
    <div
      className="rounded-lg border border-border/80 bg-muted/20 p-3 space-y-2 text-xs"
      data-testid="garage-export-filter-preview"
    >
      <div className="font-medium text-foreground flex items-center gap-1.5">
        <Filter className="w-3.5 h-3.5" />
        <span>{t("exportJobs.filterSummary", "Tóm tắt bộ lọc bảng")}</span>
      </div>
      <div className="space-y-1.5 text-muted-foreground text-[11px]">
        {row(
          t("exportJobs.tableDateRange", "Khoảng ngày bảng:"),
          range ?? t("exportJobs.allRange", "Tất cả"),
        )}
        {search && row(t("exportJobs.searchKeyword", "Từ khóa:"), search)}
        {sortCount > 0 && row(t("exportJobs.sortInfo", "Sắp xếp:"), sortCount)}
        {conditions.length > 0
          ? conditions.map((c, i) =>
              row(`${c.label}:`, c.value, i === conditions.length - 1),
            )
          : row(
              t("exportJobs.filterConditions", "Điều kiện lọc:"),
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4">
                {filterCount > 0
                  ? t(
                      "exportJobs.activeFiltersCount",
                      "{{count}} điều kiện lọc",
                      { count: filterCount },
                    )
                  : t("exportJobs.noActiveFilters", "Không có bộ lọc nào")}
              </Badge>,
              true,
            )}
      </div>
    </div>
  );
}
