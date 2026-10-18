import React from "react";
import { FileSpreadsheet } from "lucide-react";

import { StandardFormDrawer } from "@/shared/components/StandardFormDrawer";
import { GarageExportHistoryPanel } from "@/modules/garage/export/GarageExportSections";
import type { GarageDebtsExportDrawerProps } from "./GarageDebtsExportDrawer.type";
import { useGarageDebtsExportDrawer } from "./GarageDebtsExportDrawer.hook";
import { GarageDebtsExportForm } from "./GarageDebtsExportForm";

export const GarageDebtsExportDrawer: React.FC<GarageDebtsExportDrawerProps> = (
  props,
) => {
  const state = useGarageDebtsExportDrawer(props);
  const { t, exporter } = state;
  const query = props.context?.query;

  return (
    <StandardFormDrawer
      open={props.open}
      mode="view"
      onClose={props.onClose}
      title={t("exportJobs.debts.title", "Xuất Excel công nợ garage")}
      subtitle={t(
        "exportJobs.debts.subtitle",
        "Tạo file công nợ phải thu / phải trả và tải lại file đã tạo trong 24 tiếng",
      )}
      icon={<FileSpreadsheet className="w-4 h-4 text-emerald-600" />}
      layout="2-columns"
      size="lg"
      leftPanel={
        <GarageExportHistoryPanel
          tableId={`garage-${state.kind}-debt-export-history`}
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
        <GarageDebtsExportForm
          state={state}
          filterSummary={{
            from: query?.from,
            to: query?.to,
            q: query?.q,
            sortCount: query?.sorts?.length,
            filterCount: props.context?.filterCount ?? 0,
          }}
        />
      }
    />
  );
};
