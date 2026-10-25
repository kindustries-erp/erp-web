import * as React from "react";
import {
  V2ExportConditionSection,
  type V2ExportConditionSectionProps,
} from "@/v2/shared/components/molecules/v2-export-condition-section";

export type VinfastPartsStockExportConditionsProps = Omit<
  V2ExportConditionSectionProps,
  "className" | "children"
> & {
  /** Chưa chọn cột nào thì không cho xuất */
  noColumnSelected: boolean;
};

/** Điều kiện xuất của Vinfast: map state của hook sang V2ExportConditionSection */
export const VinfastPartsStockExportConditions: React.FC<
  VinfastPartsStockExportConditionsProps
> = ({ noColumnSelected, ...props }) => (
  <V2ExportConditionSection {...props} startDisabled={noColumnSelected} />
);
