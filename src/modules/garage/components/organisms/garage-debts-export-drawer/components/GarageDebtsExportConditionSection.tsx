import React from "react";
import { useTranslation } from "react-i18next";
import {
  GarageExportConditionSection,
  type GarageExportConditionSectionProps,
} from "@/modules/garage/export/GarageExportConditionSection";
import type { GarageDebtsExportKind } from "@/modules/garage/export/garageDebtsExportContext";

export interface GarageDebtsExportConditionSectionProps extends Omit<
  GarageExportConditionSectionProps,
  | "targetLabel"
  | "targetValue"
  | "onTargetChange"
  | "targetHint"
  | "radioName"
  | "children"
> {
  kind: GarageDebtsExportKind;
  onKindChange: (kind: GarageDebtsExportKind) => void;
  targetLabel?: string;
  radioName?: string;
}

/** Section điều kiện xuất công nợ: đối tượng KH/NCC/Tất cả + chế độ + kỳ + nút Xuất. */
export function GarageDebtsExportConditionSection({
  kind,
  onKindChange,
  targetLabel,
  radioName = "garageDebtsExportMode",
  ...rest
}: GarageDebtsExportConditionSectionProps) {
  const { t } = useTranslation("garage");

  return (
    <GarageExportConditionSection
      {...rest}
      targetLabel={
        targetLabel || t("exportJobs.debts.target", "Đối tượng báo cáo")
      }
      targetValue={kind}
      onTargetChange={(value) => onKindChange(value as GarageDebtsExportKind)}
      radioName={radioName}
    />
  );
}
