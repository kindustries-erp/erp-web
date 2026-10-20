import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  GARAGE_EXPORT_REPORT_TYPES,
  GARAGE_EXPORT_REPORT_TYPE_KEY,
} from "@/modules/garage/export/garageExportReportTypes";

/** Lựa chọn của combobox "Loại báo cáo" (nhiều lựa chọn) và dòng hướng dẫn chung. */
export function useGarageReportTypeOptions() {
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
    hint: t(
      "exportReport.multiHint",
      "Chọn một hoặc nhiều mục. Chọn Bảng kê phiếu dịch vụ thì các mục báo cáo kỳ được bỏ chọn.",
    ),
  };
}
