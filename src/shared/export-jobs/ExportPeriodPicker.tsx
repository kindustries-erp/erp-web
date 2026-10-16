import React from "react";

import { Combobox } from "@/shared/components/Combobox";
import { DatePicker } from "@/shared/components/DatePicker";
import { PillTabs } from "@/shared/components/PillTabs";
import type { ExportPeriodUnit } from "./exportPeriod";
import type { ExportPeriodState } from "./useExportPeriod";

export interface ExportPeriodPickerLabels {
  week: string;
  month: string;
  quarter: string;
  custom: string;
  selectPlaceholder: string;
  dateFrom: string;
  dateTo: string;
}

export interface ExportPeriodPickerProps {
  period: ExportPeriodState;
  labels: ExportPeriodPickerLabels;
}

/** Chọn kỳ báo cáo: tab Tuần | Tháng | Quý | Tùy chỉnh + danh sách kỳ hoặc 2 ô ngày. */
export function ExportPeriodPicker({
  period,
  labels,
}: ExportPeriodPickerProps) {
  const labelClass = "text-xs font-medium text-muted-foreground block mb-1";

  return (
    <div className="space-y-3" data-testid="export-period-picker">
      <PillTabs<ExportPeriodUnit>
        size="sm"
        variant="pill"
        className="w-full shrink-0"
        listClassName="w-full grid grid-cols-4"
        triggerClassName="justify-center flex-1"
        value={period.unit}
        onValueChange={period.setUnit}
        items={[
          { value: "week", label: labels.week },
          { value: "month", label: labels.month },
          { value: "quarter", label: labels.quarter },
          { value: "custom", label: labels.custom },
        ]}
      />

      {period.unit !== "custom" && (
        <Combobox
          options={period.options}
          value={period.value}
          onChange={(v) => period.setValue(v ?? period.value)}
          placeholder={labels.selectPlaceholder}
          allowClear={false}
        />
      )}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>{labels.dateFrom}</label>
          <DatePicker
            value={period.dateFrom}
            onChange={period.setDateFrom}
            placeholder="dd/mm/yyyy"
            disabled={period.unit !== "custom"}
          />
        </div>
        <div>
          <label className={labelClass}>{labels.dateTo}</label>
          <DatePicker
            value={period.dateTo}
            onChange={period.setDateTo}
            placeholder="dd/mm/yyyy"
            disabled={period.unit !== "custom"}
          />
        </div>
      </div>
    </div>
  );
}
