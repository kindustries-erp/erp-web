import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import type { GarageCasesTableQuery } from "@/modules/garage/export/garageExportScopes";
import {
  applyReportSelection,
  defaultReportSelection,
  isCasesReport,
  toPeriodSectionKeys,
  type GarageExportDefaultReport,
  type GarageExportReportType,
} from "@/modules/garage/export/garageExportReportTypes";
import { useGarageCaseExportLogic } from "@/modules/garage/components/GarageCaseExportDrawer/hooks/useGarageCaseExportLogic";
import {
  useGarageDashboardExport,
  type GarageDashboardExportRange,
} from "@/modules/garage/components/GarageDashboardExportDrawer/useGarageDashboardExport";

export interface UseGarageExportDrawerLogicOptions {
  open: boolean;
  /** Loại báo cáo chọn sẵn mỗi lần mở (tab Hoạt động: bảng kê; tab Tổng quan: mọi mục kỳ). */
  defaultReportType: GarageExportDefaultReport;
  initialBranchId?: string;
  /** Điều kiện bảng đang xem; chỉ dùng cho bảng kê phiếu dịch vụ. */
  tableQuery?: GarageCasesTableQuery;
  /** Kỳ đặt sẵn cho báo cáo kỳ. */
  initialRange?: GarageDashboardExportRange;
}

/**
 * Gộp logic xuất của bảng kê phiếu dịch vụ và báo cáo kỳ sau một Combobox loại báo cáo.
 * Chỉ nhánh đang chọn được bật (`open`) nên lịch sử và SSE không chạy song song.
 */
export function useGarageExportDrawerLogic({
  open,
  defaultReportType,
  initialBranchId,
  tableQuery,
  initialRange,
}: UseGarageExportDrawerLogicOptions) {
  const { t } = useTranslation("garage");
  const [reportTypes, setReportTypesState] = useState<GarageExportReportType[]>(
    () => defaultReportSelection(defaultReportType),
  );

  useEffect(() => {
    if (open) setReportTypesState(defaultReportSelection(defaultReportType));
  }, [open, defaultReportType]);

  const setReportTypes = (next: GarageExportReportType[]) =>
    setReportTypesState((prev) => applyReportSelection(prev, next));

  const isCases = reportTypes.some(isCasesReport);
  const cases = useGarageCaseExportLogic({
    open: open && isCases,
    initialBranchId,
    tableQuery,
  });
  const periodReport = useGarageDashboardExport({
    open: open && !isCases,
    initialRange,
    reportSections: toPeriodSectionKeys(reportTypes),
  });

  // Hai nhánh có cùng bộ trường (chế độ, kỳ, exporter, nút Xuất) nên drawer dùng chung `active`
  const active = isCases ? cases : periodReport;

  return {
    t,
    reportTypes,
    setReportTypes,
    isCases,
    cases,
    active,
    exporter: active.exporter,
    historyLabels: active.historyLabels,
  };
}
