import * as React from "react";

import { Play, V2Button, V2Text } from "@/v2/shared/components/atoms";
import { V2AlertBanner } from "@/v2/shared/components/molecules/v2-alert-banner";
import { DrawerSection } from "@/v2/shared/components/molecules/v2-drawer-section";
import {
  V2RadioCardGroup,
  type V2RadioCardOption,
} from "@/v2/shared/components/molecules/v2-radio-card-group";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { cn } from "@/v2/shared/utils/cn";
import { isDateRangeInvalid } from "@/v2/shared/utils/exportPeriod";
import { V2ExportFilterSummary } from "./V2ExportFilterSummary";
import { V2ExportPeriodFields } from "./V2ExportPeriodFields";
import type {
  V2ExportConditionSectionProps,
  V2ExportMode,
} from "./V2ExportConditionSection.type";

/**
 * Mục "Điều kiện xuất dữ liệu" dùng chung cho drawer xuất Excel V2:
 * chế độ xuất → kỳ/quý/khoảng ngày (hoặc tóm tắt bộ lọc) → nút xuất.
 */
export const V2ExportConditionSection: React.FC<
  V2ExportConditionSectionProps
> = ({
  exportMode,
  onExportModeChange,
  periodType,
  onPeriodTypeChange,
  period,
  onPeriodChange,
  periodOptions,
  quarter,
  onQuarterChange,
  quarterOptions,
  year,
  onYearChange,
  yearOptions,
  dateFrom,
  onDateFromChange,
  dateTo,
  onDateToChange,
  filterSummaryRows = [],
  filterCount = 0,
  starting,
  startDisabled = false,
  onStart,
  children,
  className,
}) => {
  const { t } = useV2Translation();
  const rangeInvalid =
    exportMode === "by-period" && isDateRangeInvalid(dateFrom, dateTo);

  const modeOptions: V2RadioCardOption<V2ExportMode>[] = [
    {
      value: "by-period",
      label: t("v2.exportExcel.condition.modePeriod", "Theo kỳ"),
      description: t(
        "v2.exportExcel.condition.modePeriodDesc",
        "Chọn khoảng thời gian theo kỳ hoặc ngày tùy chỉnh",
      ),
    },
    {
      value: "by-current-filter",
      label: t(
        "v2.exportExcel.condition.modeCurrentFilter",
        "Theo filter hiện tại",
      ),
      description: t(
        "v2.exportExcel.condition.modeCurrentFilterDesc",
        "Giữ nguyên toàn bộ bộ lọc đang xem trên bảng",
      ),
    },
  ];

  return (
    <DrawerSection
      title={t("v2.exportExcel.condition.title", "Điều kiện xuất dữ liệu")}
      collapsible
      defaultCollapsed={false}
      className={cn("border-transparent dark:border-transparent", className)}
    >
      <div className="space-y-4">
        <div className="space-y-1.5">
          <V2Text variant="label">
            {t("v2.exportExcel.condition.modeLabel", "Chế độ xuất dữ liệu")}
          </V2Text>
          <V2RadioCardGroup
            name="v2-export-mode"
            ariaLabel={t(
              "v2.exportExcel.condition.modeLabel",
              "Chế độ xuất dữ liệu",
            )}
            options={modeOptions}
            value={exportMode}
            onValueChange={onExportModeChange}
          />
        </div>

        {exportMode === "by-period" ? (
          <V2ExportPeriodFields
            periodType={periodType}
            onPeriodTypeChange={onPeriodTypeChange}
            period={period}
            onPeriodChange={onPeriodChange}
            periodOptions={periodOptions}
            quarter={quarter}
            onQuarterChange={onQuarterChange}
            quarterOptions={quarterOptions}
            year={year}
            onYearChange={onYearChange}
            yearOptions={yearOptions}
            dateFrom={dateFrom}
            onDateFromChange={onDateFromChange}
            dateTo={dateTo}
            onDateToChange={onDateToChange}
          />
        ) : (
          <V2ExportFilterSummary
            rows={filterSummaryRows}
            filterCount={filterCount}
          />
        )}

        {rangeInvalid && (
          <V2AlertBanner role="alert" className="text-destructive">
            {t(
              "v2.exportExcel.condition.invalidRange",
              "Từ ngày phải nhỏ hơn hoặc bằng Đến ngày",
            )}
          </V2AlertBanner>
        )}

        {children}

        <V2Button
          variant="primary"
          fullWidth
          isLoading={starting}
          loadingText={t("v2.exportExcel.form.starting", "Đang khởi tạo...")}
          disabled={startDisabled || starting || rangeInvalid}
          leftIcon={<Play className="h-4 w-4" />}
          onClick={onStart}
        >
          {t("v2.exportExcel.form.start", "Xuất Excel")}
        </V2Button>
      </div>
    </DrawerSection>
  );
};
