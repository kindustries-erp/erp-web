import React from "react";
import { Truck, Users } from "lucide-react";

import { DrawerSection } from "@/shared/components/DrawerModal";
import { PillTabs } from "@/shared/components/PillTabs";
import {
  GarageExportModeAndPeriod,
  GarageExportStartButton,
  type GarageExportFilterSummary,
} from "@/modules/garage/export/GarageExportSections";
import type { GarageDebtsExportKind } from "@/modules/garage/export/garageDebtsExportContext";
import type { useGarageDebtsExportDrawer } from "./GarageDebtsExportDrawer.hook";

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

  return (
    <div className="space-y-4 text-xs">
      <DrawerSection title={t("exportJobs.debts.target", "Đối tượng báo cáo")}>
        <PillTabs<GarageDebtsExportKind>
          value={state.kind}
          onValueChange={state.setKind}
          items={[
            {
              value: "customers",
              label: t("exportJobs.debts.customers", "Khách hàng (phải thu)"),
              icon: Users,
            },
            {
              value: "suppliers",
              label: t("exportJobs.debts.suppliers", "Nhà cung cấp (phải trả)"),
              icon: Truck,
            },
          ]}
        />
      </DrawerSection>

      <GarageExportModeAndPeriod
        exportMode={state.exportMode}
        onExportModeChange={state.setExportMode}
        modeLabels={state.modeLabels}
        allowCurrentFilter={state.canUseCurrentFilter}
        period={state.period}
        periodLabels={state.periodLabels}
        filterSummary={filterSummary}
        radioName="garageDebtsExportMode"
      />

      {state.exportMode === "by-period" && (
        <p className="text-[11px] text-muted-foreground">
          {t(
            "exportJobs.debts.baselineNote",
            "Công nợ được ghi nhận từ 01/07/2026.",
          )}
        </p>
      )}

      <GarageExportStartButton
        starting={exporter.starting}
        onStart={state.handleStartExport}
      />
    </div>
  );
}
