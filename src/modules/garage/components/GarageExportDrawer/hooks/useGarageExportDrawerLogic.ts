import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import type { GarageCasesTableQuery } from "@/modules/garage/export/garageExportScopes";
import {
  applyPeriodSelection,
  defaultKindAndPeriods,
  reportTypesOf,
  toPeriodSectionKeys,
  type GarageExportDefaultReport,
  type GarageExportKind,
  type PeriodReportType,
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
 * Gộp logic xuất của bảng kê phiếu dịch vụ và báo cáo kỳ.
 * Loại báo cáo là lựa chọn đơn (`kind`); nội dung kỳ (`periodTypes`) là lựa chọn nhiều và
 * được giữ khi đổi loại. Chỉ nhánh đang chọn được bật (`open`) nên lịch sử và SSE không chạy song song.
 */
export function useGarageExportDrawerLogic({
  open,
  defaultReportType,
  initialBranchId,
  tableQuery,
  initialRange,
}: UseGarageExportDrawerLogicOptions) {
  const { t } = useTranslation("garage");
  const [initial] = useState(() => defaultKindAndPeriods(defaultReportType));
  const [kind, setKind] = useState<GarageExportKind>(initial.kind);
  const [periodTypes, setPeriodTypesState] = useState<PeriodReportType[]>(
    initial.periodTypes,
  );

  useEffect(() => {
    if (!open) return;
    const next = defaultKindAndPeriods(defaultReportType);
    setKind(next.kind);
    setPeriodTypesState(next.periodTypes);
  }, [open, defaultReportType]);

  const setPeriodSelection = (next: PeriodReportType[]) =>
    setPeriodTypesState((prev) => applyPeriodSelection(prev, next));

  const isCases = kind === "cases";
  const reportTypes = reportTypesOf(kind, periodTypes);

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
    kind,
    setKind,
    periodTypes,
    setPeriodSelection,
    reportTypes,
    isCases,
    cases,
    active,
    exporter: active.exporter,
    historyLabels: active.historyLabels,
  };
}
