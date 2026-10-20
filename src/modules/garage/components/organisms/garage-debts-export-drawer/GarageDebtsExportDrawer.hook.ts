import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import {
  toIsoDate,
  useBackgroundExport,
  useExportPeriod,
  type ExportMode,
} from "@/shared/export-jobs";
import {
  GARAGE_DEBT_BASELINE_DATE,
  type GarageDebtsExportKind,
} from "@/modules/garage/export/garageDebtsExportContext";
import {
  branchHeaders,
  garageAllDebtsExportScope,
  garageCustomersDebtExportScope,
  garageSuppliersDebtExportScope,
  useGarageAllDebtsExportStore,
  useGarageCustomersDebtExportStore,
  useGarageSuppliersDebtExportStore,
  type GarageDebtsExportPayload,
} from "@/modules/garage/export/garageExportScopes";
import { useGarageExportLabels } from "@/modules/garage/export/useGarageExportLabels";
import type { GarageDebtsExportDrawerProps } from "./GarageDebtsExportDrawer.type";

const today = () => toIsoDate(new Date());

export function useGarageDebtsExportDrawer({
  open,
  branchId,
  context,
}: GarageDebtsExportDrawerProps) {
  const {
    t,
    history,
    mode: modeLabels,
    period: periodLabels,
    messages,
  } = useGarageExportLabels();

  const [kind, setKind] = useState<GarageDebtsExportKind>(
    context?.kind ?? "all",
  );
  const [exportMode, setExportMode] = useState<ExportMode>("by-period");
  // Mặc định lấy toàn bộ công nợ từ mốc ghi nhận đến hôm nay (Tùy chỉnh).
  const period = useExportPeriod({
    initialUnit: "custom",
    initialFrom: GARAGE_DEBT_BASELINE_DATE,
    initialTo: today(),
  });

  // Mỗi lần mở từ một bảng: chọn đúng đối tượng và dùng filter của bảng đó.
  useEffect(() => {
    if (!open) return;
    setKind(context?.kind ?? "all");
    setExportMode(context?.query ? "by-current-filter" : "by-period");
  }, [open, context?.kind, context?.query]);

  const allDebts = useBackgroundExport<GarageDebtsExportPayload>({
    scope: garageAllDebtsExportScope,
    useStore: useGarageAllDebtsExportStore,
    open: open && kind === "all",
    messages,
  });
  const customers = useBackgroundExport<GarageDebtsExportPayload>({
    scope: garageCustomersDebtExportScope,
    useStore: useGarageCustomersDebtExportStore,
    open: open && kind === "customers",
    messages,
  });
  const suppliers = useBackgroundExport<GarageDebtsExportPayload>({
    scope: garageSuppliersDebtExportScope,
    useStore: useGarageSuppliersDebtExportStore,
    open: open && kind === "suppliers",
    messages,
  });
  const exporter =
    kind === "all" ? allDebts : kind === "customers" ? customers : suppliers;

  const canUseCurrentFilter = Boolean(context?.query) && context?.kind === kind;
  const effectiveMode: ExportMode = canUseCurrentFilter
    ? exportMode
    : "by-period";

  const handleStartExport = async () => {
    const headers = branchHeaders(branchId);

    if (effectiveMode === "by-current-filter" && context?.query) {
      await exporter.start(
        { mode: "by-current-filter", ...context.query },
        headers,
      );
      return;
    }

    if (!period.dateFrom || !period.dateTo) {
      toast.error(
        t(
          "exportJobs.missingDateRange",
          "Vui lòng chọn đầy đủ ngày bắt đầu và ngày kết thúc.",
        ),
      );
      return;
    }
    await exporter.start(
      { mode: "by-period", from: period.dateFrom, to: period.dateTo },
      headers,
    );
  };

  return {
    t,
    historyLabels: history,
    modeLabels,
    periodLabels,
    kind,
    setKind,
    exportMode: effectiveMode,
    setExportMode,
    canUseCurrentFilter,
    period,
    exporter,
    handleStartExport,
  };
}
