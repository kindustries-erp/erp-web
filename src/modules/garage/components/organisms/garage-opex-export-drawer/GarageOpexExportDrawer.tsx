import React from "react";
import { FileSpreadsheet } from "lucide-react";

import { StandardFormDrawer } from "@/shared/components/StandardFormDrawer";
import { GarageExportHistoryPanel } from "@/modules/garage/export/GarageExportSections";
import type { GarageOpexExportDrawerProps } from "./GarageOpexExportDrawer.type";
import { useGarageOpexExportDrawer } from "./GarageOpexExportDrawer.hook";
import { GarageOpexExportForm } from "./GarageOpexExportForm";

export const GarageOpexExportDrawer: React.FC<GarageOpexExportDrawerProps> = (
  props,
) => {
  const state = useGarageOpexExportDrawer(props);
  const { t, exporter } = state;
  const query = props.query;

  return (
    <StandardFormDrawer
      open={props.open}
      mode="view"
      onClose={props.onClose}
      title={t("opex.exportDrawer.title", "Xuất Excel chi phí vận hành Garage")}
      subtitle={t(
        "opex.exportDrawer.subtitle",
        "Tạo file bảng kê 3 sheet (Dashboard phân bổ, Chi tiết chi phí & Báo cáo P&L) theo kỳ",
      )}
      icon={<FileSpreadsheet className="w-4 h-4 text-emerald-600" />}
      layout="2-columns"
      size="lg"
      leftPanel={
        <GarageExportHistoryPanel
          tableId="garage-opex-export-history"
          labels={state.historyLabels}
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
        <GarageOpexExportForm
          state={state}
          filterSummary={{
            from: query?.date_from,
            to: query?.date_to,
            sortCount: query?.sorts?.length,
            filterCount: props.filterCount ?? 0,
          }}
        />
      }
    />
  );
};
