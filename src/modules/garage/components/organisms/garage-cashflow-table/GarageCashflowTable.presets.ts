import { useState, useMemo } from "react";
import { usePageViewPresets } from "@/shared/hooks/usePageViewPresets";
import {
  useUserPreferencesStore,
  type TableViewPreset,
} from "@/shared/hooks/useUserPreferences";
import type { ViewModeFilterItem } from "@/shared/components/ViewModeCombobox";
import {
  GARAGE_CASHFLOW_COLUMN_VIEW_PRESETS,
  DEFAULT_GARAGE_CASHFLOW_COLUMN_VISIBILITY,
} from "../../../utils/garageViewPresets";

export function useGarageCashflowPresets(
  tabKey: "vouchers" | "forecast" = "vouchers",
) {
  const actualTableId =
    tabKey === "forecast"
      ? "garage-cashflow-forecast-list"
      : "garage-cashflow-list";
  const columnPresetsTableId =
    tabKey === "forecast"
      ? "garage-cashflow-forecast-column-views"
      : "garage-cashflow-column-views";

  const columnViewPresetsHook = usePageViewPresets({
    tableId: columnPresetsTableId,
    defaultPresets: GARAGE_CASHFLOW_COLUMN_VIEW_PRESETS,
  });

  const [activeColumnPresetKey, setActiveColumnPresetKey] = useState<string>(
    () => {
      const stored = useUserPreferencesStore
        .getState()
        .getTablePreference(actualTableId);
      return stored?.activeView || "overview";
    },
  );

  const handleColumnPresetChange = (preset: TableViewPreset) => {
    setActiveColumnPresetKey(preset.key);
    const currentPref = useUserPreferencesStore
      .getState()
      .getTablePreference(actualTableId) || {
      columnOrder: [],
      columnVisibility: {},
    };
    useUserPreferencesStore.getState().setTablePreferences(actualTableId, {
      ...currentPref,
      columnOrder: [],
      columnVisibility:
        preset.columnVisibility || DEFAULT_GARAGE_CASHFLOW_COLUMN_VISIBILITY,
      activeView: preset.key,
    });
  };

  return {
    actualTableId,
    columnPresetsTableId,
    columnViewPresetsHook,
    activeColumnPresetKey,
    handleColumnPresetChange,
  };
}

export function useGarageCashflowFilterItems(
  tabKey: "vouchers" | "forecast" = "vouchers",
  t: (key: string, def?: string) => string,
): ViewModeFilterItem<string>[] {
  return useMemo<ViewModeFilterItem<string>[]>(() => {
    if (tabKey === "forecast") {
      return [
        {
          value: "ALL",
          label: t("garage.cashflow.filterAllForecast", "Tất cả dự thu/chi"),
        },
        {
          value: "RECEIPT",
          label: t("garage.cashflow.filterForecastThu", "Phiếu dự thu"),
          dotColor: "amber",
        },
        {
          value: "PAYMENT",
          label: t("garage.cashflow.filterForecastChi", "Phiếu dự chi"),
          dotColor: "rose",
        },
      ];
    }
    return [
      {
        value: "ALL",
        label: t("garage.cashflow.filterAll", "Tất cả"),
      },
      {
        value: "RECEIPT",
        label: t("garage.cashflow.filterReceipt", "Phiếu thu (Tiền vào)"),
        dotColor: "emerald",
      },
      {
        value: "PAYMENT",
        label: t("garage.cashflow.filterPayment", "Phiếu chi (Tiền ra)"),
        dotColor: "rose",
      },
    ];
  }, [tabKey, t]);
}
