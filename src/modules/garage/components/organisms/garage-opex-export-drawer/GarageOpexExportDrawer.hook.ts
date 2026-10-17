import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import {
  useBackgroundExport,
  useExportPeriod,
  type ExportMode,
} from "@/shared/export-jobs";
import {
  garageOpexExportScope,
  useGarageOpexExportStore,
  type GarageOpexExportPayload,
} from "@/modules/garage/export/garageExportScopes";
import { useGarageExportLabels } from "@/modules/garage/export/useGarageExportLabels";
import type { GarageOpexExportDrawerProps } from "./GarageOpexExportDrawer.type";

export function useGarageOpexExportDrawer({
  open,
  query,
  initialCostGroup,
}: GarageOpexExportDrawerProps) {
  const {
    t,
    history,
    mode: modeLabels,
    period: periodLabels,
    messages,
  } = useGarageExportLabels();

  const [costGroup, setCostGroup] = useState<string>(initialCostGroup || "ALL");
  const [exportMode, setExportMode] = useState<ExportMode>(
    query ? "by-current-filter" : "by-period",
  );

  const period = useExportPeriod({
    initialUnit: "month",
  });

  useEffect(() => {
    if (!open) return;
    setExportMode(query ? "by-current-filter" : "by-period");
    if (initialCostGroup) setCostGroup(initialCostGroup);
  }, [open, query, initialCostGroup]);

  const exporter = useBackgroundExport<GarageOpexExportPayload>({
    scope: garageOpexExportScope,
    useStore: useGarageOpexExportStore,
    open,
    messages,
  });

  const canUseCurrentFilter = Boolean(query);
  const effectiveMode: ExportMode = canUseCurrentFilter
    ? exportMode
    : "by-period";

  const handleStartExport = async () => {
    if (effectiveMode === "by-current-filter" && query) {
      await exporter.start({
        mode: "by-current-filter",
        ...query,
      });
      return;
    }

    if (!period.dateFrom || !period.dateTo) {
      toast.error(
        t(
          "exportJobs.missingDateRange",
          "Vui lòng chọn đầy đủ khoảng thời gian xuất báo cáo.",
        ),
      );
      return;
    }

    await exporter.start({
      mode: "by-period",
      date_from: period.dateFrom,
      date_to: period.dateTo,
      cost_group: costGroup !== "ALL" ? costGroup : undefined,
    });
  };

  return {
    t,
    exporter,
    historyLabels: history,
    modeLabels,
    periodLabels,
    exportMode,
    setExportMode,
    costGroup,
    setCostGroup,
    period,
    canUseCurrentFilter,
    handleStartExport,
  };
}
