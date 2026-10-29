import * as React from "react";
import { cn } from "@/v2/shared/utils/cn";
import { V2Combobox } from "@/v2/shared/components/molecules/v2-combobox";
import { V2DatePicker } from "@/v2/shared/components/molecules/v2-date-picker";
import { V2TabBar } from "@/v2/shared/components/molecules/v2-tab-bar";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import type { V2PeriodPickerProps, V2PeriodUnit } from "./V2PeriodPicker.type";

/**
 * Chọn kỳ dạng pill tab (Tuần / Tháng / Quý / Tùy chỉnh).
 * Ngoài "Tùy chỉnh", kỳ được chọn từ combobox và khoảng ngày bị khóa;
 * ở "Tùy chỉnh" thì ẩn combobox và mở khóa hai ô ngày.
 */
export const V2PeriodPicker: React.FC<V2PeriodPickerProps> = ({
  unit,
  onUnitChange,
  period,
  onPeriodChange,
  periodOptions,
  dateFrom,
  onDateFromChange,
  dateTo,
  onDateToChange,
  className,
}) => {
  const { t } = useV2Translation();
  const isCustom = unit === "custom";

  const tabs = [
    { key: "week", label: t("v2.periodPicker.week", "Tuần") },
    { key: "month", label: t("v2.periodPicker.month", "Tháng") },
    { key: "quarter", label: t("v2.periodPicker.quarter", "Quý") },
    { key: "custom", label: t("v2.periodPicker.custom", "Tùy chỉnh") },
  ];

  return (
    <div className={cn("space-y-3", className)}>
      <V2TabBar
        variant="sub"
        stretch
        tabs={tabs}
        activeTabKey={unit}
        onTabChange={(key) => onUnitChange(key as V2PeriodUnit)}
        ariaLabel={t("v2.periodPicker.ariaLabel", "Chọn đơn vị kỳ")}
      />

      {!isCustom && (
        <V2Combobox
          options={periodOptions}
          value={period || null}
          onValueChange={(value) => onPeriodChange(value ?? "")}
          placeholder={t("v2.periodPicker.selectPeriod", "Chọn kỳ...")}
          searchable={false}
        />
      )}

      <div className="grid grid-cols-2 gap-3">
        <V2DatePicker
          value={dateFrom || null}
          onValueChange={(value) => onDateFromChange(value ?? "")}
          placeholder={t("v2.periodPicker.dateFrom", "Từ ngày")}
          disabled={!isCustom}
          maxDate={dateTo || undefined}
        />
        <V2DatePicker
          value={dateTo || null}
          onValueChange={(value) => onDateToChange(value ?? "")}
          placeholder={t("v2.periodPicker.dateTo", "Đến ngày")}
          disabled={!isCustom}
          minDate={dateFrom || undefined}
        />
      </div>
    </div>
  );
};
