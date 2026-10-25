import * as React from "react";
import { V2Button, V2Text } from "@/v2/shared/components/atoms";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { V2DatePicker } from "@/v2/shared/components/molecules/v2-date-picker";
import type { V2DateRange } from "@/v2/shared/types/v2-table";
import { V2_DATE_PRESETS, getDatePreset } from "./V2ColumnHeaderFilter.date";

interface Props {
  value?: V2DateRange;
  onChange: (range: V2DateRange | null) => void;
}

export const V2DateRangeSlot: React.FC<Props> = ({ value, onChange }) => {
  const { t } = useV2Translation();

  const update = (patch: Partial<V2DateRange>) => {
    const next = { ...value, ...patch };
    onChange(next.from || next.to ? next : null);
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-1">
        {V2_DATE_PRESETS.map((preset) => (
          <V2Button
            key={preset}
            variant="outline"
            size="xs"
            onClick={() => onChange(getDatePreset(preset))}
          >
            <V2Text variant="body-sm">
              {t(`v2.table.presets.${preset}`, preset)}
            </V2Text>
          </V2Button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="flex flex-col gap-1">
          <V2Text variant="caption">{t("v2.table.dateFrom", "Từ ngày")}</V2Text>
          <V2DatePicker
            value={value?.from ?? null}
            maxDate={value?.to}
            triggerClassName="text-xs px-2 gap-1.5 h-8 font-normal"
            placeholder={t("v2.form.pickDate", "Chọn ngày")}
            clearable
            onValueChange={(date) => update({ from: date || undefined })}
            aria-label={t("v2.table.dateFrom", "Từ ngày")}
          />
        </div>
        <div className="flex flex-col gap-1">
          <V2Text variant="caption">{t("v2.table.dateTo", "Đến ngày")}</V2Text>
          <V2DatePicker
            value={value?.to ?? null}
            minDate={value?.from}
            triggerClassName="text-xs px-2 gap-1.5 h-8 font-normal"
            placeholder={t("v2.form.pickDate", "Chọn ngày")}
            clearable
            onValueChange={(date) => update({ to: date || undefined })}
            aria-label={t("v2.table.dateTo", "Đến ngày")}
          />
        </div>
      </div>
      {value && (
        <V2Button variant="ghost" size="xs" onClick={() => onChange(null)}>
          <V2Text
            variant="body-sm"
            color="inherit"
            className="text-muted-fg hover:text-foreground font-medium"
          >
            {t("v2.table.clearFilter", "Xóa bộ lọc")}
          </V2Text>
        </V2Button>
      )}
    </div>
  );
};
