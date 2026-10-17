import React from "react";
import { FileSpreadsheet } from "lucide-react";
import { StandardFormDrawer } from "@/shared/components/StandardFormDrawer";
import { GarageExportHistoryPanel } from "@/modules/garage/export/GarageExportSections";
import { GarageExportConditionSection } from "@/modules/garage/export/GarageExportConditionSection";
import type { GarageCasesTableQuery } from "@/modules/garage/export/garageExportScopes";
import type { GarageExportReportType } from "@/modules/garage/export/garageExportReportTypes";
import { GarageCaseExportConditionFields } from "@/modules/garage/components/GarageCaseExportDrawer/components/GarageCaseExportConditionFields";
import type { GarageDashboardExportRange } from "@/modules/garage/components/GarageDashboardExportDrawer";
import { useGarageExportDrawerLogic } from "./hooks/useGarageExportDrawerLogic";
import { useGarageReportTypeOptions } from "./hooks/useGarageReportTypeOptions";

export interface GarageExportDrawerProps {
  open: boolean;
  onClose: () => void;
  /** Loại báo cáo chọn sẵn khi mở; người dùng đổi được trong drawer. */
  defaultReportType: GarageExportReportType;
  initialBranchId?: string;
  /** Điều kiện bảng đang xem; thiếu thì ẩn chế độ "theo filter hiện tại". */
  tableQuery?: GarageCasesTableQuery;
  initialRange?: GarageDashboardExportRange;
}

/** Drawer xuất Excel dùng chung cho tab Tổng quan và Hoạt động garage. */
export function GarageExportDrawer({
  open,
  onClose,
  defaultReportType,
  initialBranchId,
  tableQuery,
  initialRange,
}: GarageExportDrawerProps) {
  const logic = useGarageExportDrawerLogic({
    open,
    defaultReportType,
    initialBranchId,
    tableQuery,
    initialRange,
  });
  const { exporter, t, cases, active } = logic;
  const typeSelect = useGarageReportTypeOptions(logic.reportType);

  return (
    <StandardFormDrawer
      open={open}
      mode="view"
      onClose={onClose}
      title={t("exportReport.title", "Xuất Excel báo cáo Garage")}
      subtitle={t("exportReport.subtitle")}
      icon={<FileSpreadsheet className="w-4 h-4 text-emerald-600" />}
      layout="2-columns"
      size="lg"
      leftPanel={
        <GarageExportHistoryPanel
          tableId={
            logic.isCases
              ? "garage-cases-export-history"
              : "garage-dashboard-export-history"
          }
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
        <div className="space-y-4 text-xs">
          <GarageExportConditionSection
            targetLabel={typeSelect.label}
            targetValue={logic.reportType}
            targetOptions={typeSelect.options}
            onTargetChange={(value) =>
              logic.setReportType(value as GarageExportReportType)
            }
            targetHint={typeSelect.hint}
            exportMode={active.exportMode}
            onExportModeChange={active.setExportMode}
            modeLabels={active.modeLabels}
            allowCurrentFilter={logic.isCases && Boolean(tableQuery)}
            period={active.period}
            periodLabels={active.periodLabels}
            filterSummary={{
              from: tableQuery?.date_from,
              to: tableQuery?.date_to,
              q: tableQuery?.q,
              sortCount: tableQuery?.sorts?.length,
              filterCount: cases.filterCount,
            }}
            starting={exporter.starting}
            onStartExport={active.handleStartExport}
            radioName="garageExportMode"
            baselineNote={
              logic.isCases
                ? undefined
                : t(
                    "dashboard.exportDrawer.note",
                    "Đã thu, đã chi theo ngày giao dịch phiếu thu chi xưởng; nợ còn mở và tuổi nợ tính đến ngày xuất; kết quả kinh doanh tính theo tháng chứa ngày kết thúc kỳ.",
                  )
            }
          >
            {logic.isCases && (
              <GarageCaseExportConditionFields
                showExtraFields={cases.exportMode === "by-period"}
                dateType={cases.dateType}
                dateTypeOptions={cases.dateTypeOptions}
                onDateTypeChange={cases.setDateType}
                selectedBranchId={cases.selectedBranchId}
                branchOptions={cases.branchOptions}
                selectedClassification={cases.selectedClassification}
                classificationOptions={cases.classificationOptions}
                onClassificationChange={cases.setSelectedClassification}
                selectedStatus={cases.selectedStatus}
                statusOptions={cases.statusOptions}
                onStatusChange={cases.setSelectedStatus}
              />
            )}
          </GarageExportConditionSection>
        </div>
      }
    />
  );
}
