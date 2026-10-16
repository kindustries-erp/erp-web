import React from "react";
import { FileSpreadsheet } from "lucide-react";
import { StandardFormDrawer } from "@/shared/components/StandardFormDrawer";
import { GarageExportHistoryPanel } from "@/modules/garage/export/GarageExportSections";
import type { GarageCasesTableQuery } from "@/modules/garage/export/garageExportScopes";
import { useGarageCaseExportLogic } from "./hooks/useGarageCaseExportLogic";
import { GarageCaseExportFormSection } from "./components/GarageCaseExportFormSection";

export interface GarageCaseExportDrawerProps {
  open: boolean;
  onClose: () => void;
  initialBranchId?: string;
  /** Điều kiện bảng đang xem; thiếu thì ẩn chế độ "theo filter hiện tại". */
  tableQuery?: GarageCasesTableQuery;
}

export function GarageCaseExportDrawer({
  open,
  onClose,
  initialBranchId,
  tableQuery,
}: GarageCaseExportDrawerProps) {
  const logic = useGarageCaseExportLogic({ open, initialBranchId, tableQuery });
  const { exporter, t } = logic;
  const history = exporter.historyQuery.data;

  return (
    <StandardFormDrawer
      open={open}
      mode="view"
      onClose={onClose}
      title={t("cases.exportDrawer.title", "Xuất Excel bảng kê phiếu dịch vụ")}
      subtitle={t(
        "cases.exportDrawer.subtitle",
        "Tạo file bảng kê 2 sheet (Tổng quan phiếu kết thúc & Chi tiết DV/phụ tùng) theo kỳ",
      )}
      icon={<FileSpreadsheet className="w-4 h-4 text-emerald-600" />}
      layout="2-columns"
      size="lg"
      leftPanel={
        <GarageExportHistoryPanel
          tableId="garage-cases-export-history"
          labels={logic.historyLabels}
          history={history}
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
        <GarageCaseExportFormSection
          exportMode={logic.exportMode}
          onExportModeChange={logic.setExportMode}
          modeLabels={logic.modeLabels}
          allowCurrentFilter={Boolean(tableQuery)}
          period={logic.period}
          periodLabels={logic.periodLabels}
          filterSummary={{
            from: tableQuery?.date_from,
            to: tableQuery?.date_to,
            q: tableQuery?.q,
            sortCount: tableQuery?.sorts?.length,
            filterCount: logic.filterCount,
          }}
          dateType={logic.dateType}
          dateTypeOptions={logic.dateTypeOptions}
          onDateTypeChange={logic.setDateType}
          selectedBranchId={logic.selectedBranchId}
          branchOptions={logic.branchOptions}
          selectedClassification={logic.selectedClassification}
          classificationOptions={logic.classificationOptions}
          onClassificationChange={logic.setSelectedClassification}
          selectedStatus={logic.selectedStatus}
          statusOptions={logic.statusOptions}
          onStatusChange={logic.setSelectedStatus}
          exporting={exporter.starting}
          onStartExport={logic.handleStartExport}
        />
      }
    />
  );
}
