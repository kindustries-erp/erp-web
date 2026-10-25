import * as React from "react";
import { Play } from "lucide-react";
import { V2Button, V2Text } from "@/v2/shared/components/atoms";
import {
  V2Combobox,
  type V2ComboboxOption,
} from "@/v2/shared/components/molecules/v2-combobox";
import {
  V2DateRangePicker,
  type V2DateRangeValue,
} from "@/v2/shared/components/molecules/v2-date-picker";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";

export interface VinfastPartsStockExportConditionsProps {
  period: string;
  periodOptions: V2ComboboxOption[];
  onPeriodChange: (value?: string) => void;
  dateRange: V2DateRangeValue;
  onDateRangeChange: (value: V2DateRangeValue) => void;
  starting: boolean;
  /** Chưa chọn cột nào thì không cho xuất */
  disabled: boolean;
  onStart: () => void;
}

export const VinfastPartsStockExportConditions: React.FC<
  VinfastPartsStockExportConditionsProps
> = ({
  period,
  periodOptions,
  onPeriodChange,
  dateRange,
  onDateRangeChange,
  starting,
  disabled,
  onStart,
}) => {
  const { t } = useV2Translation();

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <V2Text variant="label">
          {t("v2.exportExcel.form.periodLabel", "Kỳ (cho sheet Chi tiết)")}
        </V2Text>
        <V2Combobox
          options={periodOptions}
          value={period}
          onValueChange={(value) => onPeriodChange(value ?? "")}
          placeholder={t("v2.exportExcel.form.selectPeriod", "Chọn kỳ...")}
          searchable={false}
        />
      </div>

      <div className="space-y-1.5">
        <V2Text variant="label">
          {t("v2.exportExcel.form.dateRange", "Khoảng ngày")}
        </V2Text>
        <V2DateRangePicker
          value={dateRange}
          onValueChange={onDateRangeChange}
          placeholder="dd/mm/yyyy"
          clearable
        />
      </div>

      <V2Button
        variant="primary"
        fullWidth
        isLoading={starting}
        loadingText={t("v2.exportExcel.form.starting", "Đang khởi tạo...")}
        disabled={disabled || starting}
        leftIcon={<Play className="h-4 w-4" />}
        onClick={onStart}
      >
        {t("v2.exportExcel.form.start", "Xuất Excel")}
      </V2Button>
    </div>
  );
};
