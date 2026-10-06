import React from "react";
import { FileSpreadsheet } from "lucide-react";
import { StandardFormDrawer } from "@/shared/components/StandardFormDrawer";
import { useGarageCaseExportLogic } from "./hooks/useGarageCaseExportLogic";
import { useGarageCaseExportColumns } from "./hooks/useGarageCaseExportColumns";
import { GarageCaseExportHistorySection } from "./components/GarageCaseExportHistorySection";
import { GarageCaseExportFormSection } from "./components/GarageCaseExportFormSection";

export interface GarageCaseExportDrawerProps {
  open: boolean;
  onClose: () => void;
  initialBranchId?: string;
}

export function GarageCaseExportDrawer({
  open,
  onClose,
  initialBranchId,
}: GarageCaseExportDrawerProps) {
  const logic = useGarageCaseExportLogic(initialBranchId);
  const { columns, getRowActions } = useGarageCaseExportColumns(
    logic.downloadingId,
    logic.handleDownloadAgain,
  );

  return (
    <StandardFormDrawer
      open={open}
      mode="view"
      onClose={onClose}
      title={logic.t(
        "cases.exportDrawer.title",
        "Xuất Excel bảng kê phiếu dịch vụ",
      )}
      subtitle={logic.t(
        "cases.exportDrawer.subtitle",
        "Tạo file bảng kê 2 sheet (Tổng quan phiếu kết thúc & Chi tiết DV/phụ tùng) theo kỳ",
      )}
      icon={<FileSpreadsheet className="w-4 h-4 text-emerald-600" />}
      layout="2-columns"
      size="lg"
      leftPanel={
        <GarageCaseExportHistorySection
          historyItems={logic.historyItems}
          columns={columns}
          getRowActions={getRowActions}
          onClearHistory={logic.handleClearHistory}
        />
      }
      rightPanel={
        <GarageCaseExportFormSection
          period={logic.period}
          periodOptions={logic.periodOptions}
          onPeriodChange={logic.handlePeriodChange}
          dateType={logic.dateType}
          dateTypeOptions={logic.dateTypeOptions}
          onDateTypeChange={logic.setDateType}
          dateFrom={logic.dateFrom}
          onDateFromChange={logic.setDateFrom}
          dateTo={logic.dateTo}
          onDateToChange={logic.setDateTo}
          selectedBranchId={logic.selectedBranchId}
          branchOptions={logic.branchOptions}
          selectedClassification={logic.selectedClassification}
          classificationOptions={logic.classificationOptions}
          onClassificationChange={logic.setSelectedClassification}
          selectedStatus={logic.selectedStatus}
          statusOptions={logic.statusOptions}
          onStatusChange={logic.setSelectedStatus}
          exporting={logic.exporting}
          onStartExport={logic.handleStartExport}
        />
      }
    />
  );
}
