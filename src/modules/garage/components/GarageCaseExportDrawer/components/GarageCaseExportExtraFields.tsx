import React from "react";
import { useTranslation } from "react-i18next";
import { DrawerSection } from "@/shared/components/DrawerModal";
import { Combobox, type ComboboxOption } from "@/shared/components/Combobox";

export interface GarageCaseExportExtraFieldsProps {
  dateType: "completion_date" | "case_date";
  dateTypeOptions: ComboboxOption[];
  onDateTypeChange: (val: "completion_date" | "case_date") => void;
  selectedClassification: string;
  classificationOptions: ComboboxOption[];
  onClassificationChange: (val: string) => void;
  selectedStatus: string;
  statusOptions: ComboboxOption[];
  onStatusChange: (val: string) => void;
}

const LABEL = "text-xs font-medium text-muted-foreground block mb-1";

/** Điều kiện riêng của phiếu dịch vụ (chế độ "Theo kỳ"): loại ngày, phân loại, trạng thái. */
export function GarageCaseExportExtraFields(
  props: GarageCaseExportExtraFieldsProps,
) {
  const { t } = useTranslation("garage");

  return (
    <DrawerSection
      title={t("cases.exportDrawer.scopeConditions", "Phạm vi & Điều kiện lọc")}
      collapsible
      defaultCollapsed={false}
    >
      <div className="space-y-3">
        <div>
          <label className={LABEL}>
            {t("cases.exportDrawer.dateType", "Loại ngày lọc")}
          </label>
          <Combobox
            options={props.dateTypeOptions}
            value={props.dateType}
            onChange={(v) =>
              props.onDateTypeChange(
                (v as "completion_date" | "case_date") || "completion_date",
              )
            }
            allowClear={false}
          />
        </div>
        <div>
          <label className={LABEL}>
            {t("cases.exportDrawer.classification", "Phân loại vụ việc")}
          </label>
          <Combobox
            options={props.classificationOptions}
            value={props.selectedClassification}
            onChange={(v) => props.onClassificationChange(v ?? "")}
            placeholder={t(
              "cases.exportDrawer.allClassifications",
              "Tất cả phân loại",
            )}
            allowClear={true}
          />
        </div>
        <div>
          <label className={LABEL}>
            {t("cases.exportDrawer.status", "Trạng thái phiếu")}
          </label>
          <Combobox
            options={props.statusOptions}
            value={props.selectedStatus}
            onChange={(v) => props.onStatusChange(v ?? "completed")}
            allowClear={false}
          />
        </div>
      </div>
    </DrawerSection>
  );
}
