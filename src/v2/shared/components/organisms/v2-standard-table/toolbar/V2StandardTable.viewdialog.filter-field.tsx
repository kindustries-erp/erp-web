import * as React from "react";
import { V2Text } from "@/v2/shared/components/atoms/v2-text";
import { V2Combobox } from "@/v2/shared/components/molecules/v2-combobox";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";

export interface V2ViewFilterOption {
  key: string;
  label: string;
}

export interface V2ViewFilterFieldProps {
  options: V2ViewFilterOption[];
  value: string;
  onChange: (key: string) => void;
}

/** Chọn bộ lọc có sẵn (filter group) để gắn vào chế độ xem */
export const V2ViewFilterField: React.FC<V2ViewFilterFieldProps> = ({
  options,
  value,
  onChange,
}) => {
  const { t } = useV2Translation();
  const label = t("v2.table.viewFilterLabel", "Bộ lọc có sẵn");
  return (
    <div className="flex flex-col gap-1.5">
      <V2Text variant="label">{label}</V2Text>
      <V2Combobox
        aria-label={label}
        options={options.map((option) => ({
          value: option.key,
          label: option.label,
        }))}
        value={value}
        clearable={false}
        onValueChange={(next) => {
          if (next !== null) onChange(next);
        }}
      />
    </div>
  );
};
