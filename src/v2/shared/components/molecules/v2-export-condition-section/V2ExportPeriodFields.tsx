import * as React from "react";
import { V2Text } from "@/v2/shared/components/atoms";
import {
  V2Combobox,
  type V2ComboboxOption,
} from "@/v2/shared/components/molecules/v2-combobox";
import { V2DatePicker } from "@/v2/shared/components/molecules/v2-date-picker";
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
  year?: string;
  onYearChange?: (year: string) => void;
  yearOptions?: V2ComboboxOption[];
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
  year,
  onYearChange,
  yearOptions = [],
  dateFrom,
  onDateFromChange,
  dateTo,
  onDateToChange,
}) => {
  const { t } = useV2Translation();
  // Chỉ một lịch mở tại một thời điểm: mở "Đến ngày" sẽ đóng "Từ ngày" và ngược lại
  const [openPicker, setOpenPicker] = React.useState<"from" | "to" | null>(
    null,
  );

  const periodTypeOptions: V2ComboboxOption[] = React.useMemo(
    () => [
      {
        value: "month",
        label: t("v2.exportExcel.condition.periodMonth", "Theo tháng"),
      },
      {
        value: "quarter",
        label: t("v2.exportExcel.condition.periodQuarter", "Theo quý"),
      },
      {
        value: "year",
        label: t("v2.exportExcel.condition.periodYear", "Theo năm"),
      },
      {
        value: "custom",
        label: t("v2.exportExcel.condition.periodCustom", "Tùy chỉnh"),
      },
    ],
    [t],
  );

  return (
    <div className="space-y-3">
      {/* Hàng 1: Loại kỳ (50%) & Kỳ/Quý/Năm (50%) theo tỷ lệ 1:1 */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <V2Text variant="label">
            {t("v2.exportExcel.condition.periodType", "Loại kỳ")}
          </V2Text>
          <V2Combobox
            options={periodTypeOptions}
            value={periodType}
            onValueChange={(val) =>
              onPeriodTypeChange(val as V2ExportPeriodType)
            }
            placeholder={t(
              "v2.exportExcel.condition.selectPeriodType",
              "Chọn loại kỳ...",
            )}
            searchable={false}
          />
        </div>

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

        {periodType === "year" && (
          <div className="space-y-1.5">
            <V2Text variant="label">
              {t("v2.exportExcel.condition.year", "Năm")}
            </V2Text>
            <V2Combobox
              options={yearOptions}
              value={year || null}
              onValueChange={(value) => onYearChange?.(value ?? "")}
              placeholder={t(
                "v2.exportExcel.condition.selectYear",
                "Chọn năm...",
              )}
              searchable={false}
            />
          </div>
        )}

        {periodType === "custom" && (
          <div className="space-y-1.5">
            <V2Text variant="label">
              {t("v2.exportExcel.condition.month", "Kỳ")}
            </V2Text>
            <V2Combobox
              options={[]}
              value={null}
              onValueChange={() => {}}
              disabled
              placeholder={t(
                "v2.exportExcel.condition.customPeriodHint",
                "Theo khoảng ngày bên dưới",
              )}
              searchable={false}
            />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <V2Text variant="label">
            {t("v2.exportExcel.condition.dateFrom", "Từ ngày")}
          </V2Text>
          <V2DatePicker
            value={dateFrom || null}
            onValueChange={(value) => onDateFromChange(value ?? "")}
            open={openPicker === "from"}
            onOpenChange={(next) => setOpenPicker(next ? "from" : null)}
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
            open={openPicker === "to"}
            onOpenChange={(next) => setOpenPicker(next ? "to" : null)}
            minDate={dateFrom || undefined}
            placeholder="dd/mm/yyyy"
            clearable
          />
        </div>
      </div>
    </div>
  );
};
