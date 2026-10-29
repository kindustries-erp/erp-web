import * as React from "react";
import { V2Text } from "@/v2/shared/components/atoms";
import {
  V2Combobox,
  type V2ComboboxOption,
} from "@/v2/shared/components/molecules/v2-combobox";
import {
  V2ExportConditionSection,
  type V2ExportConditionSectionProps,
} from "@/v2/shared/components/molecules/v2-export-condition-section";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";

export type VinfastPartsStockExportConditionsProps = Omit<
  V2ExportConditionSectionProps,
  "className" | "children"
> & {
  /** Chưa chọn cột nào thì không cho xuất */
  noColumnSelected: boolean;
  /** Loại phụ tùng (ALL | CAR | MOTORBIKE) */
  vehicleType?: string;
  onVehicleTypeChange?: (val: string) => void;
};

/** Điều kiện xuất của Vinfast: map state của hook sang V2ExportConditionSection */
export const VinfastPartsStockExportConditions: React.FC<
  VinfastPartsStockExportConditionsProps
> = ({
  noColumnSelected,
  vehicleType = "ALL",
  onVehicleTypeChange,
  ...props
}) => {
  const { t } = useV2Translation();

  const vehicleOptions: V2ComboboxOption[] = [
    {
      value: "ALL",
      label: t("v2.vinfastParts.export.filter.vehicleAll", "Tất cả"),
    },
    {
      value: "CAR",
      label: t("v2.vinfastParts.export.filter.vehicleCar", "Phụ tùng ô tô"),
    },
    {
      value: "MOTORBIKE",
      label: t(
        "v2.vinfastParts.export.filter.vehicleMotorbike",
        "Phụ tùng xe máy",
      ),
    },
  ];

  return (
    <V2ExportConditionSection {...props} startDisabled={noColumnSelected}>
      <div className="space-y-1.5 pt-1">
        <V2Text variant="label">
          {t("v2.vinfastParts.export.filter.vehicleType", "Loại phụ tùng")}
        </V2Text>
        <V2Combobox
          options={vehicleOptions}
          value={vehicleType}
          onValueChange={(val) => onVehicleTypeChange?.(val || "ALL")}
          placeholder={t("v2.vinfastParts.export.filter.vehicleAll", "Tất cả")}
        />
      </div>
    </V2ExportConditionSection>
  );
};
