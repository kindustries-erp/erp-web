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
import { GarageExportFilterPreview } from "@/modules/garage/export/GarageExportFilterPreview";
import type { GarageExportFilterSummary } from "@/modules/garage/export/GarageExportSections";
import type { GarageDebtsExportKind } from "@/modules/garage/export/garageDebtsExportContext";

export interface GarageDebtsExportConditionSectionProps {
  kind: GarageDebtsExportKind;
  onKindChange: (kind: GarageDebtsExportKind) => void;
  targetOptions: Array<{ value: string; label: string }>;
  targetLabel?: string;
  exportMode: ExportMode;
  onExportModeChange: (mode: ExportMode) => void;
  modeLabels: ExportModeSelectorProps["labels"];
  allowCurrentFilter: boolean;
  period: ExportPeriodState;
  periodLabels: ExportPeriodPickerLabels;
  filterSummary: GarageExportFilterSummary;
  starting: boolean;
  onStartExport: () => void;
  radioName?: string;
  baselineNote?: string;
}

export function GarageDebtsExportConditionSection({
  kind,
  onKindChange,
  targetOptions,
  targetLabel,
  exportMode,
  onExportModeChange,
  modeLabels,
  allowCurrentFilter,
  period,
  periodLabels,
  filterSummary,
  starting,
  onStartExport,
  radioName = "garageDebtsExportMode",
  baselineNote,
}: GarageDebtsExportConditionSectionProps) {
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
            {targetLabel || t("exportJobs.debts.target", "Đối tượng báo cáo")}
          </label>
          <Combobox
            options={targetOptions}
            value={kind}
            onChange={(v) =>
              onKindChange((v as GarageDebtsExportKind) || "all")
            }
            placeholder={
              targetLabel || t("exportJobs.debts.target", "Đối tượng báo cáo")
            }
            allowClear={false}
          />
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
