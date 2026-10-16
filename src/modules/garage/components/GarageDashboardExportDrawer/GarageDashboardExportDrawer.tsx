import React from "react";
import { FileSpreadsheet } from "lucide-react";
import { StandardFormDrawer } from "@/shared/components/StandardFormDrawer";
import {
  GarageExportHistoryPanel,
  GarageExportModeAndPeriod,
  GarageExportStartButton,
} from "@/modules/garage/export/GarageExportSections";
import {
  useGarageDashboardExport,
  type GarageDashboardExportRange,
} from "./useGarageDashboardExport";

export interface GarageDashboardExportDrawerProps {
  open: boolean;
  onClose: () => void;
  /** Kỳ đặt sẵn (tùy chỉnh) khi mở từ ngữ cảnh đã có khoảng ngày. */
  initialRange?: GarageDashboardExportRange;
}

export function GarageDashboardExportDrawer({
  open,
  onClose,
  initialRange,
}: GarageDashboardExportDrawerProps) {
  const logic = useGarageDashboardExport({ open, initialRange });
  const { exporter, t } = logic;

  return (
    <StandardFormDrawer
      open={open}
      mode="view"
      onClose={onClose}
      title={t("dashboard.exportDrawer.title", "Xuất Excel báo cáo Garage")}
      subtitle={t(
        "dashboard.exportDrawer.subtitle",
        "Báo cáo theo kỳ gồm Dashboard thu chi & công nợ (cảnh báo quá hạn), báo cáo lợi nhuận theo tháng, công nợ theo nhóm đối tượng và thu chi trong kỳ. Tải lại file đã tạo trong 24 tiếng",
      )}
      icon={<FileSpreadsheet className="w-4 h-4 text-emerald-600" />}
      layout="2-columns"
      size="lg"
      leftPanel={
        <GarageExportHistoryPanel
          tableId="garage-dashboard-export-history"
          labels={logic.historyLabels}
          history={exporter.historyQuery.data}
          loading={
            exporter.historyQuery.isLoading || exporter.historyQuery.isFetching
          }
          page={exporter.page}
          pageSize={exporter.pageSize}
          onPage={exporter.setPage}
          onPageSize={exporter.setPageSize}
          downloadingJobId={exporter.downloadingJobId}
          progress={exporter.progress}
          onDownload={exporter.handleDownload}
        />
      }
      rightPanel={
        <div className="space-y-4">
          <GarageExportModeAndPeriod
            exportMode={logic.exportMode}
            onExportModeChange={logic.setExportMode}
            modeLabels={logic.modeLabels}
            allowCurrentFilter={false}
            period={logic.period}
            periodLabels={logic.periodLabels}
            filterSummary={{ filterCount: 0 }}
            radioName="garageDashboardExportMode"
          />
          <p className="text-[11px] text-muted-foreground">
            {t(
              "dashboard.exportDrawer.note",
              "Đã thu, đã chi theo ngày giao dịch phiếu thu chi xưởng; nợ còn mở và tuổi nợ tính đến ngày xuất. Báo cáo lợi nhuận tính theo tháng chứa ngày kết thúc kỳ, chart hiển thị 12 tháng gần nhất.",
            )}
          </p>
          <GarageExportStartButton
            starting={exporter.starting}
            onStart={logic.handleStartExport}
          />
        </div>
      }
    />
  );
}
