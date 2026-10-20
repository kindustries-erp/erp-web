import * as React from "react";
import { V2Button } from "@/v2/shared/components/atoms/v2-button";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { Input } from "@/v2/shared/ui";
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
            {t(`v2.table.presets.${preset}`, preset)}
          </V2Button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2">
        <label className="flex flex-col gap-1 text-[11px] text-muted-fg">
          {t("v2.table.dateFrom", "Từ ngày")}
          <Input
            type="date"
            className="h-8 text-xs"
            value={value?.from ?? ""}
            max={value?.to}
            onChange={(e) => update({ from: e.target.value || undefined })}
          />
        </label>
        <label className="flex flex-col gap-1 text-[11px] text-muted-fg">
          {t("v2.table.dateTo", "Đến ngày")}
          <Input
            type="date"
            className="h-8 text-xs"
            value={value?.to ?? ""}
            min={value?.from}
            onChange={(e) => update({ to: e.target.value || undefined })}
          />
        </label>
      </div>
      {value && (
        <V2Button variant="ghost" size="xs" onClick={() => onChange(null)}>
          {t("v2.table.clearFilter", "Xóa bộ lọc")}
        </V2Button>
      )}
    </div>
  );
};
