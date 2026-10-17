import React, { useMemo } from "react";
import { Play } from "lucide-react";
import { DrawerSection } from "@/shared/components/DrawerModal";
import { Button } from "@/shared/components/ui/Button";
import { Combobox } from "@/shared/components/Combobox";
import { ExportModeSelector, ExportPeriodPicker } from "@/shared/export-jobs";
import { GarageExportFilterPreview } from "@/modules/garage/export/GarageExportFilterPreview";
import type { GarageExportFilterSummary } from "@/modules/garage/export/GarageExportSections";
import type { useGarageOpexExportDrawer } from "./GarageOpexExportDrawer.hook";

type DrawerState = ReturnType<typeof useGarageOpexExportDrawer>;

export interface GarageOpexExportFormProps {
  state: DrawerState;
  filterSummary: GarageExportFilterSummary;
}

export function GarageOpexExportForm({
  state,
  filterSummary,
}: GarageOpexExportFormProps) {
  const { t, exporter } = state;

  const costGroupOptions = useMemo(
    () => [
      { value: "ALL", label: t("opex.tabs.all", "Tất cả nhóm chi phí") },
      { value: "OPEX", label: t("opex.costGroups.OPEX", "CP Vận hành (OPEX)") },
      { value: "COGS", label: t("opex.costGroups.COGS", "Giá vốn (COGS)") },
      {
        value: "COMMISSION",
        label: t("opex.costGroups.COMMISSION", "Hoa hồng & Thưởng"),
      },
    ],
    [t],
  );

  return (
    <div className="space-y-4 text-xs">
      <DrawerSection
        title={t("exportJobs.conditionTitle", "Điều kiện xuất dữ liệu")}
        collapsible
        defaultCollapsed={false}
      >
        <div className="space-y-3.5">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">
              {t("opex.filterGroup", "Nhóm chi phí")}
            </label>
            <Combobox
              options={costGroupOptions}
              value={state.costGroup}
              onChange={(v) => state.setCostGroup(v || "ALL")}
              placeholder={t("opex.selectCostGroup", "Chọn nhóm chi phí")}
              allowClear={false}
            />
          </div>

          <ExportModeSelector
            mode={state.exportMode}
            onChange={state.setExportMode}
            labels={state.modeLabels}
            allowCurrentFilter={state.canUseCurrentFilter}
            name="garageOpexExportMode"
          />

          {state.exportMode === "by-period" ? (
            <ExportPeriodPicker
              period={state.period}
              labels={state.periodLabels}
            />
          ) : (
            <GarageExportFilterPreview
              dateFrom={filterSummary.from}
              dateTo={filterSummary.to}
              search={filterSummary.q}
              sortCount={filterSummary.sortCount}
              filterCount={filterSummary.filterCount}
            />
          )}

          <p className="text-[11px] text-muted-foreground leading-relaxed">
            {t(
              "opex.exportNote",
              "File xuất ra bao gồm 3 sheet: Dashboard & biểu đồ phân bổ chi phí, Bảng kê chi tiết chi phí chuẩn kế toán và Báo cáo Lợi nhuận (P&L) theo kỳ đã chọn.",
            )}
          </p>

          <div className="pt-2">
            <Button
              className="w-full justify-center"
              onClick={state.handleStartExport}
              disabled={exporter.starting}
            >
              <Play className="w-4 h-4 mr-1.5" />
              {exporter.starting
                ? t("exportJobs.starting", "Đang khởi tạo...")
                : t("exportJobs.startExport", "Xuất Excel")}
            </Button>
          </div>
        </div>
      </DrawerSection>
    </div>
  );
}
