import React from "react";
import { Play } from "lucide-react";
import { useTranslation } from "react-i18next";
import { DrawerSection } from "@/shared/components/DrawerModal";
import { Button } from "@/shared/components/ui/Button";
import { Combobox } from "@/shared/components/Combobox";
import {
  ExportModeSelector,
  ExportPeriodPicker,
  type ExportMode,
  type ExportModeSelectorProps,
  type ExportPeriodPickerLabels,
  type ExportPeriodState,
} from "@/shared/export-jobs";
import { GarageExportFilterPreview } from "./GarageExportFilterPreview";
import type { GarageExportFilterSummary } from "./GarageExportSections";

export interface GarageExportConditionSectionProps {
  /** Nhãn trường chọn đối tượng/loại báo cáo (trường đầu tiên của section). */
  targetLabel: string;
  targetValue: string;
  targetOptions: Array<{ value: string; label: string }>;
  onTargetChange: (value: string) => void;
  /** Dòng mô tả nhỏ dưới ô chọn (vd nội dung của loại báo cáo đang chọn). */
  targetHint?: string;
  exportMode: ExportMode;
  onExportModeChange: (mode: ExportMode) => void;
  modeLabels: ExportModeSelectorProps["labels"];
  /** Có điều kiện bảng để dùng chế độ "theo filter hiện tại" hay không. */
  allowCurrentFilter: boolean;
  period: ExportPeriodState;
  periodLabels: ExportPeriodPickerLabels;
  filterSummary: GarageExportFilterSummary;
  starting: boolean;
  onStartExport: () => void;
  /** Id riêng cho nhóm radio (nhiều drawer cùng tồn tại trong DOM). */
  radioName: string;
  /** Ghi chú dưới bộ chọn kỳ (chỉ hiện ở chế độ theo kỳ). */
  baselineNote?: string;
  /** Trường riêng của từng loại, đặt giữa phần chọn kỳ và nút Xuất. */
  children?: React.ReactNode;
}

/**
 * Section "Điều kiện xuất dữ liệu" dùng chung cho các drawer xuất Excel của Garage:
 * đối tượng/loại báo cáo → chế độ xuất → kỳ (hoặc tóm tắt filter bảng) → trường riêng → nút Xuất.
 */
export function GarageExportConditionSection({
  targetLabel,
  targetValue,
  targetOptions,
  onTargetChange,
  targetHint,
  exportMode,
  onExportModeChange,
  modeLabels,
  allowCurrentFilter,
  period,
  periodLabels,
  filterSummary,
  starting,
  onStartExport,
  radioName,
  baselineNote,
  children,
}: GarageExportConditionSectionProps) {
  const { t } = useTranslation("garage");

  return (
    <DrawerSection
      title={t("exportJobs.conditionTitle", "Điều kiện xuất dữ liệu")}
      collapsible
      defaultCollapsed={false}
    >
      <div className="space-y-3.5">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-foreground">
            {targetLabel}
          </label>
          <Combobox
            options={targetOptions}
            value={targetValue}
            onChange={(v) => onTargetChange(v || targetValue)}
            placeholder={targetLabel}
            allowClear={false}
          />
          {targetHint && (
            <p className="text-[11px] text-muted-foreground">{targetHint}</p>
          )}
        </div>

        <ExportModeSelector
          mode={exportMode}
          onChange={onExportModeChange}
          labels={modeLabels}
          allowCurrentFilter={allowCurrentFilter}
          name={radioName}
        />

        {exportMode === "by-period" ? (
          <>
            <ExportPeriodPicker period={period} labels={periodLabels} />
            {baselineNote && (
              <p className="text-[11px] text-muted-foreground">
                {baselineNote}
              </p>
            )}
          </>
        ) : (
          <GarageExportFilterPreview
            dateFrom={filterSummary.from}
            dateTo={filterSummary.to}
            search={filterSummary.q}
            sortCount={filterSummary.sortCount}
            filterCount={filterSummary.filterCount}
          />
        )}

        {children}

        <div className="pt-2">
          <Button
            className="w-full justify-center"
            onClick={onStartExport}
            disabled={starting}
          >
            <Play className="w-4 h-4 mr-1.5" />
            {starting
              ? t("exportJobs.starting", "Đang khởi tạo...")
              : t("exportJobs.startExport", "Xuất Excel")}
          </Button>
        </div>
      </div>
    </DrawerSection>
  );
}
