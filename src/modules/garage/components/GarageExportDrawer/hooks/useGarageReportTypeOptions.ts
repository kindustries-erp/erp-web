import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  GARAGE_EXPORT_REPORT_TYPE_KEY,
  PERIOD_REPORT_TYPES,
} from "@/modules/garage/export/garageExportReportTypes";

/**
 * Hai bước của ô "Loại báo cáo": chọn đúng một loại (tab), rồi với báo cáo kỳ thì chọn
 * nhiều nội dung. Tách rõ để người dùng không nhầm checkbox với lựa chọn đơn.
 */
export function useGarageReportTypeOptions() {
  const { t } = useTranslation("garage");

  const kindItems = useMemo(
    () => [
      {
        value: "period" as const,
        label: t("exportReport.kinds.period", "Báo cáo theo kỳ"),
      },
      {
        value: "cases" as const,
        label: t("exportReport.kinds.cases", "Bảng kê phiếu dịch vụ"),
      },
    ],
    [t],
  );

  const periodDescription = useMemo(
    () =>
      t(
        "exportReport.typeDescs.periodDesc",
        "Xuất bảng tổng hợp số liệu xưởng, kết quả kinh doanh, doanh thu, công nợ & dòng tiền theo khoảng thời gian.",
      ),
    [t],
  );

  const periodOptions = useMemo(
    () =>
      PERIOD_REPORT_TYPES.map((type) => ({
        value: type,
        label: t(`exportReport.types.${GARAGE_EXPORT_REPORT_TYPE_KEY[type]}`),
      })),
    [t],
  );

  return {
    kindLabel: t("exportReport.typeLabel", "Loại báo cáo"),
    kindItems,
    periodDescription,
    periodLabel: t("exportReport.periodItemsLabel", "Nội dung báo cáo"),
    periodOptions,
    periodHint: t(
      "exportReport.multiHint",
      "Chọn một hoặc nhiều mục báo cáo kỳ.",
    ),
    casesDescription: t(
      "exportReport.typeDescs.casesList",
      "Bảng kê phiếu kết thúc, theo dõi lãi lỗ, chi tiết dịch vụ & phụ tùng theo kỳ hoặc theo bộ lọc hiện tại.",
    ),
  };
}
