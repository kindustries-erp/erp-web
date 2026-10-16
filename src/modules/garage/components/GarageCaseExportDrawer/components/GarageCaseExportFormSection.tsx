import React from "react";
import { useTranslation } from "react-i18next";
import { DrawerSection } from "@/shared/components/DrawerModal";
import { Combobox, type ComboboxOption } from "@/shared/components/Combobox";
import type {
  ExportMode,
  ExportModeSelectorProps,
  ExportPeriodPickerLabels,
  ExportPeriodState,
} from "@/shared/export-jobs";
import {
  GarageExportModeAndPeriod,
  GarageExportStartButton,
  type GarageExportFilterSummary,
} from "@/modules/garage/export/GarageExportSections";
import {
  GarageCaseExportExtraFields,
  type GarageCaseExportExtraFieldsProps,
} from "./GarageCaseExportExtraFields";

export interface GarageCaseExportFormSectionProps extends GarageCaseExportExtraFieldsProps {
  exportMode: ExportMode;
  onExportModeChange: (mode: ExportMode) => void;
  modeLabels: ExportModeSelectorProps["labels"];
  /** Có điều kiện bảng để dùng chế độ "theo filter hiện tại" hay không. */
  allowCurrentFilter: boolean;
  period: ExportPeriodState;
  periodLabels: ExportPeriodPickerLabels;
  filterSummary: GarageExportFilterSummary;
  selectedBranchId: string;
  branchOptions: ComboboxOption[];
  exporting: boolean;
  onStartExport: () => void;
}

export const GarageCaseExportFormSection = React.memo(
  function GarageCaseExportFormSection({
    exportMode,
    onExportModeChange,
    modeLabels,
    allowCurrentFilter,
    period,
    periodLabels,
    filterSummary,
    selectedBranchId,
    branchOptions,
    exporting,
    onStartExport,
    ...extraFields
  }: GarageCaseExportFormSectionProps) {
    const { t } = useTranslation("garage");

    return (
      <div className="space-y-4">
        <GarageExportModeAndPeriod
          exportMode={exportMode}
          onExportModeChange={onExportModeChange}
          modeLabels={modeLabels}
          allowCurrentFilter={allowCurrentFilter}
          period={period}
          periodLabels={periodLabels}
          filterSummary={filterSummary}
          radioName="garageCaseExportMode"
        />

        {exportMode === "by-period" && (
          <GarageCaseExportExtraFields {...extraFields} />
        )}

        <DrawerSection
          title={t("cases.exportDrawer.branch", "Chi nhánh")}
          collapsible
          defaultCollapsed={false}
        >
          <div className="space-y-3">
            {/* Chi nhánh chỉ xem: lấy theo chi nhánh đang chọn ở trang */}
            <Combobox
              options={branchOptions}
              value={selectedBranchId}
              onChange={() => {}}
              placeholder={t(
                "cases.exportDrawer.allBranches",
                "Tất cả chi nhánh",
              )}
              disabled={true}
              allowClear={false}
            />
            <GarageExportStartButton
              starting={exporting}
              onStart={onStartExport}
            />
          </div>
        </DrawerSection>
      </div>
    );
  },
);
