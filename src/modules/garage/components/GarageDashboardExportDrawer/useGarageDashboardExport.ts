import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  useBackgroundExport,
  useExportPeriod,
  type ExportMode,
} from "@/shared/export-jobs";
import { useGarageBranches } from "@/modules/garage/hooks/useGarage";
import { useGarageStore } from "@/modules/garage/store/garageStore";
import {
  branchHeaders,
  garageDashboardExportScope,
  useGarageDashboardExportStore,
  type GarageDashboardExportPayload,
} from "@/modules/garage/export/garageExportScopes";
import type { GaragePeriodReportSectionKey } from "@/modules/garage/export/garageExportReportTypes";
import { useGarageExportLabels } from "@/modules/garage/export/useGarageExportLabels";

/** Khoảng ngày đặt sẵn khi mở drawer từ một ngữ cảnh có kỳ (vd drawer chi tiết KPI). */
export interface GarageDashboardExportRange {
  from: string;
  to: string;
}

export interface UseGarageDashboardExportOptions {
  open: boolean;
  initialRange?: GarageDashboardExportRange;
  /** Các mục báo cáo kỳ đã chọn; thiếu thì API xuất toàn bộ. */
  reportSections?: GaragePeriodReportSectionKey[];
}

export function useGarageDashboardExport({
  open,
  initialRange,
  reportSections,
}: UseGarageDashboardExportOptions) {
  const {
    t,
    history,
    mode: modeLabels,
    period: periodLabels,
    messages,
  } = useGarageExportLabels();
  const { selectedBranchId } = useGarageStore();
  const { data: branches } = useGarageBranches();
  const branchId = selectedBranchId || branches?.[0]?.externalId || "";

  // Báo cáo kỳ chỉ có chế độ "Theo kỳ" (tab Tổng quan không có bảng để lấy filter).
  const [exportMode, setExportMode] = useState<ExportMode>("by-period");
  const period = useExportPeriod({ initialUnit: "month" });
  const { setUnit, setDateFrom, setDateTo } = period;

  const exporter = useBackgroundExport<GarageDashboardExportPayload>({
    scope: garageDashboardExportScope,
    useStore: useGarageDashboardExportStore,
    open,
    messages,
  });

  const rangeFrom = initialRange?.from;
  const rangeTo = initialRange?.to;
  useEffect(() => {
    if (!open || !rangeFrom || !rangeTo) return;
    setUnit("custom");
    setDateFrom(rangeFrom);
    setDateTo(rangeTo);
    // Chỉ áp lại khi mở drawer hoặc kỳ đặt sẵn đổi.
  }, [open, rangeFrom, rangeTo]);

  const handleStartExport = async () => {
    if (!period.dateFrom || !period.dateTo) {
      toast.error(
        t(
          "exportJobs.missingDateRange",
          "Vui lòng chọn đầy đủ ngày bắt đầu và ngày kết thúc.",
        ),
      );
      return;
    }
    await exporter.start(
      { from: period.dateFrom, to: period.dateTo, reportSections },
      branchHeaders(branchId),
    );
  };

  return {
    t,
    historyLabels: history,
    modeLabels,
    periodLabels,
    exportMode,
    setExportMode,
    period,
    exporter,
    handleStartExport,
  };
}
