import React from "react";
import { GarageCaseViewModeCombobox } from "../../molecules/garage-case-view-mode-combobox";
import { GARAGE_CASE_STATUS_TABS } from "../../../utils/garageCaseViewPresets";
import type { GarageCasesTableProps } from "./GarageCasesTable.type";

export interface GarageCaseViewTabsProps {
  props: GarageCasesTableProps;
  t: (key: string, opts?: any) => string;
}

export function GarageCaseViewTabs({ props, t }: GarageCaseViewTabsProps) {
  return (
    <div className="w-full sm:w-auto flex items-center flex-wrap gap-2 py-0.5">
      <GarageCaseViewModeCombobox
        presets={props.columnViewPresetsHook.presets}
        activePresetKey={props.activeColumnPresetKey}
        onSelect={props.onColumnPresetChange}
        onCreateView={props.onCreateViewPreset}
        onEditView={props.onEditViewPreset}
        onDeleteView={props.onDeleteViewPreset}
        filterGroup={{
          title: t("cases.statusGroup", { defaultValue: "Trạng thái phiếu" }),
          value: props.activeStatusTab,
          onChange: props.onStatusTabChange,
          items: GARAGE_CASE_STATUS_TABS.map((tab) => ({
            value: tab.value,
            label: t(tab.labelKey, { defaultValue: tab.defaultLabel }),
          })),
        }}
      />
    </div>
  );
}
