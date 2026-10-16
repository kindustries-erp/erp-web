import React, { useMemo } from "react";

import type { GarageExportFilterSummary } from "@/modules/garage/export/GarageExportSections";
import type { useGarageDebtsExportDrawer } from "./GarageDebtsExportDrawer.hook";
import { GarageDebtsExportConditionSection } from "./components/GarageDebtsExportConditionSection";

type DrawerState = ReturnType<typeof useGarageDebtsExportDrawer>;

export interface GarageDebtsExportFormProps {
  state: DrawerState;
  filterSummary: GarageExportFilterSummary;
}

export function GarageDebtsExportForm({
  state,
  filterSummary,
}: GarageDebtsExportFormProps) {
  const { t, exporter } = state;

  const targetOptions = useMemo(
    () => [
      {
        value: "all",
        label: t("exportJobs.debts.targetAll", "Tất cả (Phải thu & Phải trả)"),
      },
      {
        value: "customers",
        label: t("exportJobs.debts.receivables", "Phải thu (Khách hàng)"),
      },
      {
        value: "suppliers",
        label: t("exportJobs.debts.payables", "Phải trả (Nhà cung cấp)"),
      },
    ],
    [t],
  );

  return (
    <div className="space-y-4 text-xs">
      <GarageDebtsExportConditionSection
        kind={state.kind}
        onKindChange={state.setKind}
        targetOptions={targetOptions}
        targetLabel={t("exportJobs.debts.target", "Đối tượng báo cáo")}
        exportMode={state.exportMode}
        onExportModeChange={state.setExportMode}
        modeLabels={state.modeLabels}
        allowCurrentFilter={state.canUseCurrentFilter}
        period={state.period}
        periodLabels={state.periodLabels}
        filterSummary={filterSummary}
        starting={exporter.starting}
        onStartExport={state.handleStartExport}
        radioName="garageDebtsExportMode"
        baselineNote={
          state.exportMode === "by-period"
            ? t(
                "exportJobs.debts.baselineNote",
                "Công nợ được ghi nhận từ 01/07/2026.",
              )
            : undefined
        }
      />
    </div>
  );
}
