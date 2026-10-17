import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  GARAGE_EXPORT_REPORT_TYPES,
  GARAGE_EXPORT_REPORT_TYPE_KEY,
  type GarageExportReportType,
} from "@/modules/garage/export/garageExportReportTypes";

/** Option của Combobox "Loại báo cáo" và dòng mô tả nội dung file của loại đang chọn. */
export function useGarageReportTypeOptions(value: GarageExportReportType) {
  const { t } = useTranslation("garage");

  const options = useMemo(
    () =>
      GARAGE_EXPORT_REPORT_TYPES.map((type) => ({
        value: type,
        label: t(`exportReport.types.${GARAGE_EXPORT_REPORT_TYPE_KEY[type]}`),
      })),
    [t],
  );

  return {
    label: t("exportReport.typeLabel", "Loại báo cáo"),
    options,
    hint: t(`exportReport.typeDescs.${GARAGE_EXPORT_REPORT_TYPE_KEY[value]}`),
  };
}
