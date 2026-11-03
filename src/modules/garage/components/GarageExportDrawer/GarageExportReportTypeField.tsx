import React from "react";
import { PillTabs } from "@/shared/components/PillTabs";
import { MultiCombobox } from "@/shared/components/MultiCombobox";
import type {
  GarageExportKind,
  PeriodReportType,
} from "@/modules/garage/export/garageExportReportTypes";
import { useGarageReportTypeOptions } from "./hooks/useGarageReportTypeOptions";

export interface GarageExportReportTypeFieldProps {
  kind: GarageExportKind;
  onKindChange: (kind: GarageExportKind) => void;
  periodTypes: PeriodReportType[];
  onPeriodChange: (types: PeriodReportType[]) => void;
}

/**
 * Ô "Loại báo cáo": tab chọn đúng một loại; với báo cáo kỳ hiện thêm ô "Nội dung báo cáo"
 * cho phép chọn nhiều mục.
 */
export function GarageExportReportTypeField({
  kind,
  onKindChange,
  periodTypes,
  onPeriodChange,
}: GarageExportReportTypeFieldProps) {
  const options = useGarageReportTypeOptions();

  return (
    <div className="space-y-2.5">
      <PillTabs
        value={kind}
        onValueChange={onKindChange}
        items={options.kindItems}
        variant="segmented"
        size="sm"
      />
      {kind === "period" ? (
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-foreground">
            {options.periodLabel}
          </label>
          <MultiCombobox
            options={options.periodOptions}
            value={periodTypes}
            onChange={(value) => onPeriodChange(value as PeriodReportType[])}
            placeholder={options.periodLabel}
          />
          <p className="text-[11px] text-muted-foreground">
            {options.periodHint}
          </p>
        </div>
      ) : (
        <p className="text-[11px] text-muted-foreground">
          {options.casesDescription}
        </p>
      )}
    </div>
  );
}
