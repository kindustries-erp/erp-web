import React from "react";
import { useTranslation } from "react-i18next";
import { GarageCaseSyncDrawer } from "../GarageCaseSyncDrawer";
import { GarageExportDrawer } from "../GarageExportDrawer";
import { GarageWorkflowDrawer } from "../GarageWorkflowDrawer";
import type { GarageExportDefaultReport } from "../../export/garageExportReportTypes";
import type { GarageDashboardExportRange } from "../GarageDashboardExportDrawer";
import type { GarageHeaderActionsState } from "./useGarageHeaderActions";

export interface GarageHeaderActionDrawersProps {
  actions: GarageHeaderActionsState;
  /** Loại báo cáo chọn sẵn của drawer xuất ở tab đang mở. */
  defaultReportType: GarageExportDefaultReport;
  branchId?: string;
  initialRange?: GarageDashboardExportRange;
  onSyncSuccess: () => void;
}

/** Drawer đồng bộ + drawer xuất Excel mà nút chính "Đồng bộ" của cả 2 tab mở ra. */
export function GarageHeaderActionDrawers({
  actions,
  defaultReportType,
  branchId,
  initialRange,
  onSyncSuccess,
}: GarageHeaderActionDrawersProps) {
  const { t } = useTranslation("garage");
  const isGrossProfit = actions.syncMode === "gross-profit";

  return (
    <>
      <GarageCaseSyncDrawer
        open={actions.syncDrawerOpen}
        mode={actions.syncMode}
        title={
          isGrossProfit
            ? t("cases.syncDrawer.titleGrossProfit", "Đồng bộ Lợi nhuận gộp")
            : t("cases.syncDrawer.titleCases", "Đồng bộ Sổ báo giá")
        }
        description={
          isGrossProfit
            ? t(
                "cases.syncDrawer.descGrossProfit",
                "Cập nhật lại dữ liệu Doanh thu - Chi phí - Lợi nhuận gộp.",
              )
            : t(
                "cases.syncDrawer.descCases",
                "Đồng bộ phiếu dịch vụ và doanh thu chi phí từ hệ thống Garage về ERP.",
              )
        }
        onClose={actions.closeSync}
        onSuccess={onSyncSuccess}
      />
      <GarageExportDrawer
        open={actions.exportDrawerOpen}
        onClose={actions.closeExport}
        defaultReportType={defaultReportType}
        initialBranchId={branchId}
        tableQuery={actions.exportTableQuery}
        initialRange={initialRange}
      />
      <GarageWorkflowDrawer
        open={actions.workflowDrawerOpen}
        onClose={actions.closeWorkflow}
      />
    </>
  );
}
