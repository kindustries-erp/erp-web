import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  useBackgroundExport,
  useExportPeriod,
  type ExportMode,
} from "@/shared/export-jobs";
import { useGarageBranches } from "@/modules/garage/hooks/useGarage";
import {
  branchHeaders,
  garageCasesExportScope,
  useGarageCasesExportStore,
  type GarageCasesExportPayload,
  type GarageCasesTableQuery,
} from "@/modules/garage/export/garageExportScopes";
import { useGarageExportLabels } from "@/modules/garage/export/useGarageExportLabels";
import {
  loadSavedGarageCasesExportColumns,
  saveGarageCasesExportColumns,
} from "@/modules/garage/export/garageCasesExportColumns";
import { useGarageCaseExportOptions } from "./useGarageCaseExportOptions";

export interface UseGarageCaseExportLogicOptions {
  open: boolean;
  initialBranchId?: string;
  /** Điều kiện bảng đang xem (chế độ "theo filter hiện tại"). */
  tableQuery?: GarageCasesTableQuery;
}

/** Số điều kiện lọc cột trong `filtersStr` của bảng (để hiển thị tóm tắt). */
export function countFilterKeys(filtersStr?: string): number {
  if (!filtersStr) return 0;
  try {
    return Object.keys(JSON.parse(filtersStr) as object).length;
  } catch {
    return 0;
  }
}

export function useGarageCaseExportLogic({
  open,
  initialBranchId,
  tableQuery,
}: UseGarageCaseExportLogicOptions) {
  const {
    t,
    history,
    mode: modeLabels,
    period: periodLabels,
    messages,
  } = useGarageExportLabels();
  const { data: branches } = useGarageBranches();
  const {
    branchOptions,
    classificationOptions,
    dateTypeOptions,
    statusOptions,
  } = useGarageCaseExportOptions(branches);

  const [exportMode, setExportMode] = useState<ExportMode>("by-period");
  const period = useExportPeriod({ initialUnit: "month" });
  const [dateType, setDateType] = useState<"completion_date" | "case_date">(
    "completion_date",
  );
  const [selectedBranchId, setSelectedBranchId] = useState<string>(
    initialBranchId || "",
  );
  const [selectedClassification, setSelectedClassification] =
    useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("completed");
  const [selectedColumns, setSelectedColumnsState] = useState<string[]>(
    loadSavedGarageCasesExportColumns,
  );

  const setSelectedColumns = (columns: string[]) => {
    setSelectedColumnsState(columns);
    saveGarageCasesExportColumns(columns);
  };

  const exporter = useBackgroundExport<GarageCasesExportPayload>({
    scope: garageCasesExportScope,
    useStore: useGarageCasesExportStore,
    open,
    messages,
  });

  useEffect(() => {
    if (initialBranchId && !selectedBranchId) {
      setSelectedBranchId(initialBranchId);
    }
  }, [initialBranchId, selectedBranchId]);

  const filterCount = useMemo(
    () => countFilterKeys(tableQuery?.filtersStr),
    [tableQuery?.filtersStr],
  );

  const handleStartExport = async () => {
    const branchId = selectedBranchId || undefined;

    if (exportMode === "by-current-filter") {
      // Bảng đang xem quyết định chi nhánh; không lấy từ state cũ của drawer.
      await exporter.start(
        {
          mode: "by-current-filter",
          date_from: tableQuery?.date_from,
          date_to: tableQuery?.date_to,
          q: tableQuery?.q,
          sorts: tableQuery?.sorts,
          filtersStr: tableQuery?.filtersStr,
          selectedColumns,
        },
        branchHeaders(initialBranchId || undefined),
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
      {
        mode: "by-period",
        date_from: period.dateFrom,
        date_to: period.dateTo,
        date_type: dateType,
        classification: selectedClassification || undefined,
        status: selectedStatus,
        selectedColumns,
      },
      branchHeaders(branchId),
    );
  };

  return {
    t,
    historyLabels: history,
    modeLabels,
    periodLabels,
    exportMode,
    setExportMode,
    period,
    dateType,
    setDateType,
    selectedBranchId,
    selectedClassification,
    setSelectedClassification,
    selectedStatus,
    setSelectedStatus,
    selectedColumns,
    setSelectedColumns,
    branchOptions,
    classificationOptions,
    dateTypeOptions,
    statusOptions,
    filterCount,
    exporter,
    handleStartExport,
  };
}
