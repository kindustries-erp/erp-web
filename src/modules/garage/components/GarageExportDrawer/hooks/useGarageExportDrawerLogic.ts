import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import type { GarageCasesTableQuery } from "@/modules/garage/export/garageExportScopes";
import {
  isCasesReport,
  toPeriodReportType,
  type GarageExportReportType,
} from "@/modules/garage/export/garageExportReportTypes";
import { useGarageCaseExportLogic } from "@/modules/garage/components/GarageCaseExportDrawer/hooks/useGarageCaseExportLogic";
import {
  useGarageDashboardExport,
  type GarageDashboardExportRange,
} from "@/modules/garage/components/GarageDashboardExportDrawer/useGarageDashboardExport";

export interface UseGarageExportDrawerLogicOptions {
  open: boolean;
  /** Loại báo cáo chọn sẵn mỗi lần mở (tab Hoạt động: bảng kê; tab Tổng quan: tổng hợp). */
  defaultReportType: GarageExportReportType;
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
  const [reportType, setReportType] =
    useState<GarageExportReportType>(defaultReportType);

  useEffect(() => {
    if (open) setReportType(defaultReportType);
  }, [open, defaultReportType]);

  const isCases = isCasesReport(reportType);
  const cases = useGarageCaseExportLogic({
    open: open && isCases,
    initialBranchId,
    tableQuery,
  });
  const periodReport = useGarageDashboardExport({
    open: open && !isCases,
    initialRange,
    reportType: toPeriodReportType(reportType),
  });

  // Hai nhánh có cùng bộ trường (chế độ, kỳ, exporter, nút Xuất) nên drawer dùng chung `active`
  const active = isCases ? cases : periodReport;

  return {
    t,
    reportType,
    setReportType,
    isCases,
    cases,
    active,
    exporter: active.exporter,
    historyLabels: active.historyLabels,
  };
}
