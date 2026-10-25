import * as React from "react";
import { V2Text } from "@/v2/shared/components/atoms";
import {
  V2Combobox,
  type V2ComboboxOption,
} from "@/v2/shared/components/molecules/v2-combobox";
import { V2DatePicker } from "@/v2/shared/components/molecules/v2-date-picker";
import { V2TabBar } from "@/v2/shared/components/molecules/v2-tab-bar";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import type { V2ExportPeriodType } from "@/v2/shared/utils/exportPeriod";

export interface V2ExportPeriodFieldsProps {
  periodType: V2ExportPeriodType;
  onPeriodTypeChange: (type: V2ExportPeriodType) => void;
  period: string;
  onPeriodChange: (period: string) => void;
  periodOptions: V2ComboboxOption[];
  quarter: string;
  onQuarterChange: (quarter: string) => void;
  quarterOptions: V2ComboboxOption[];
  dateFrom: string;
  onDateFromChange: (value: string) => void;
  dateTo: string;
  onDateToChange: (value: string) => void;
}

export const V2ExportPeriodFields: React.FC<V2ExportPeriodFieldsProps> = ({
  periodType,
  onPeriodTypeChange,
  period,
  onPeriodChange,
  periodOptions,
  quarter,
  onQuarterChange,
  quarterOptions,
  dateFrom,
  onDateFromChange,
  dateTo,
  onDateToChange,
}) => {
  const { t } = useV2Translation();

  return (
    <div className="space-y-3">
      <V2TabBar
        variant="sub"
        tabs={[
          {
            key: "month",
            label: t("v2.exportExcel.condition.periodMonth", "Theo tháng"),
          },
          {
            key: "quarter",
            label: t("v2.exportExcel.condition.periodQuarter", "Theo quý"),
          },
          {
            key: "custom",
            label: t("v2.exportExcel.condition.periodCustom", "Tùy chỉnh"),
          },
        ]}
        activeTabKey={periodType}
        onTabChange={(key) => onPeriodTypeChange(key as V2ExportPeriodType)}
      />

      {periodType === "month" && (
        <div className="space-y-1.5">
          <V2Text variant="label">
            {t("v2.exportExcel.condition.month", "Kỳ")}
          </V2Text>
          <V2Combobox
            options={periodOptions}
            value={period || null}
            onValueChange={(value) => onPeriodChange(value ?? "")}
            placeholder={t("v2.exportExcel.form.selectPeriod", "Chọn kỳ...")}
            searchable={false}
          />
        </div>
      )}

      {periodType === "quarter" && (
        <div className="space-y-1.5">
          <V2Text variant="label">
            {t("v2.exportExcel.condition.quarter", "Quý")}
          </V2Text>
          <V2Combobox
            options={quarterOptions}
            value={quarter || null}
            onValueChange={(value) => onQuarterChange(value ?? "")}
            placeholder={t(
              "v2.exportExcel.condition.selectQuarter",
              "Chọn quý...",
            )}
            searchable={false}
          />
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <V2Text variant="label">
            {t("v2.exportExcel.condition.dateFrom", "Từ ngày")}
          </V2Text>
          <V2DatePicker
            value={dateFrom || null}
            onValueChange={(value) => onDateFromChange(value ?? "")}
            maxDate={dateTo || undefined}
            placeholder="dd/mm/yyyy"
            clearable
          />
        </div>
        <div className="space-y-1.5">
          <V2Text variant="label">
            {t("v2.exportExcel.condition.dateTo", "Đến ngày")}
          </V2Text>
          <V2DatePicker
            value={dateTo || null}
            onValueChange={(value) => onDateToChange(value ?? "")}
            minDate={dateFrom || undefined}
            placeholder="dd/mm/yyyy"
            clearable
          />
        </div>
      </div>
    </div>
  );
};
