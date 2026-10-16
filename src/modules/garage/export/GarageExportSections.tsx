import React from "react";
import { Play } from "lucide-react";
import { useTranslation } from "react-i18next";

import { DrawerSection } from "@/shared/components/DrawerModal";
import { Button } from "@/shared/components/ui/Button";
import {
  ExportHistoryTable,
  ExportModeSelector,
  ExportPeriodPicker,
  type ExportHistoryLabels,
  type ExportHistoryResult,
  type ExportMode,
  type ExportModeSelectorProps,
  type ExportPeriodPickerLabels,
  type ExportPeriodState,
} from "@/shared/export-jobs";
import { GarageExportFilterPreview } from "./GarageExportFilterPreview";

export interface GarageExportFilterSummary {
  from?: string;
  to?: string;
  q?: string;
  sortCount?: number;
  filterCount: number;
}

export interface GarageExportModeAndPeriodProps {
  exportMode: ExportMode;
  onExportModeChange: (mode: ExportMode) => void;
  modeLabels: ExportModeSelectorProps["labels"];
  /** Có điều kiện bảng để dùng chế độ "theo filter hiện tại" hay không. */
  allowCurrentFilter: boolean;
  period: ExportPeriodState;
  periodLabels: ExportPeriodPickerLabels;
  filterSummary: GarageExportFilterSummary;
  /** Id riêng cho nhóm radio (nhiều drawer cùng tồn tại trong DOM). */
  radioName: string;
}

/** Chế độ xuất + (theo kỳ: Tuần/Tháng/Quý/Tùy chỉnh | theo filter: tóm tắt bảng). */
export function GarageExportModeAndPeriod({
  exportMode,
  onExportModeChange,
  modeLabels,
  allowCurrentFilter,
  period,
  periodLabels,
  filterSummary,
  radioName,
}: GarageExportModeAndPeriodProps) {
  const { t } = useTranslation("garage");

  return (
    <>
      <ExportModeSelector
        mode={exportMode}
        onChange={onExportModeChange}
        labels={modeLabels}
        allowCurrentFilter={allowCurrentFilter}
        name={radioName}
      />
      {exportMode === "by-period" ? (
        <DrawerSection
          title={t("exportJobs.period.title", "Kỳ báo cáo")}
          collapsible
          defaultCollapsed={false}
        >
          <ExportPeriodPicker period={period} labels={periodLabels} />
        </DrawerSection>
      ) : (
        <GarageExportFilterPreview
          dateFrom={filterSummary.from}
          dateTo={filterSummary.to}
          search={filterSummary.q}
          sortCount={filterSummary.sortCount}
          filterCount={filterSummary.filterCount}
        />
      )}
    </>
  );
}

export interface GarageExportStartButtonProps {
  starting: boolean;
  onStart: () => void;
}

export function GarageExportStartButton({
  starting,
  onStart,
}: GarageExportStartButtonProps) {
  const { t } = useTranslation("garage");
  return (
    <Button
      className="w-full justify-center"
      onClick={onStart}
      disabled={starting}
    >
      <Play className="w-4 h-4 mr-1.5" />
      {starting
        ? t("exportJobs.starting", "Đang khởi tạo...")
        : t("exportJobs.startExport", "Xuất Excel")}
    </Button>
  );
}

export interface GarageExportHistoryPanelProps {
  tableId: string;
  labels: ExportHistoryLabels;
  history?: ExportHistoryResult;
  loading: boolean;
  page: number;
  pageSize: number;
  onPage: (page: number) => void;
  onPageSize: (size: number) => void;
  downloadingJobId: string | null;
  progress: { jobId?: string; current: number; total: number };
  onDownload: React.ComponentProps<typeof ExportHistoryTable>["onDownload"];
}

/** Khối "Lịch sử xuất file" (cột trái của cả hai drawer). */
export function GarageExportHistoryPanel({
  tableId,
  labels,
  history,
  loading,
  page,
  pageSize,
  onPage,
  onPageSize,
  downloadingJobId,
  progress,
  onDownload,
}: GarageExportHistoryPanelProps) {
  const { t } = useTranslation("garage");
  return (
    <DrawerSection
      title={t("exportJobs.historyTitle", "Lịch sử xuất file")}
      collapsible
      defaultCollapsed={false}
    >
      <ExportHistoryTable
        tableId={tableId}
        items={history?.items ?? []}
        loading={loading}
        page={page}
        pageSize={pageSize}
        total={history?.total ?? 0}
        totalPages={history?.totalPages ?? 1}
        onPage={onPage}
        onPageSize={onPageSize}
        downloadingJobId={downloadingJobId}
        progress={progress}
        onDownload={onDownload}
        labels={labels}
      />
    </DrawerSection>
  );
}
