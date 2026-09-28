import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import {
  periodFirstDay,
  periodLastDay,
  periodFromExactRange,
  initPeriod,
} from "@/modules/finance/utils/financeHelpers";
import {
  garageApi,
  type ExportCompletedCasesParams,
} from "@/modules/garage/api/garageApi";
import { useGarageBranches } from "@/modules/garage/hooks/useGarage";
import {
  useGarageCaseExportHistory,
  type GarageCaseExportHistoryItem,
} from "./useGarageCaseExportHistory";
import { useGarageCaseExportOptions } from "./useGarageCaseExportOptions";

export type { GarageCaseExportHistoryItem };

export function useGarageCaseExportLogic(initialBranchId?: string) {
  const { t } = useTranslation("garage");
  const { data: branches } = useGarageBranches();
  const { historyItems, addHistoryItem, handleClearHistory } =
    useGarageCaseExportHistory();
  const {
    branchOptions,
    classificationOptions,
    dateTypeOptions,
    statusOptions,
    periodOptions,
    createPeriodChangeHandler,
  } = useGarageCaseExportOptions(branches);

  const [period, setPeriod] = useState(initPeriod());
  const [dateFrom, setDateFrom] = useState(periodFirstDay(period));
  const [dateTo, setDateTo] = useState(periodLastDay(period));
  const [dateType, setDateType] = useState<"completion_date" | "case_date">(
    "completion_date",
  );
  const [selectedBranchId, setSelectedBranchId] = useState<string>(
    initialBranchId || "",
  );
  const [selectedClassification, setSelectedClassification] =
    useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("completed");

  const [exporting, setExporting] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    if (initialBranchId && !selectedBranchId) {
      setSelectedBranchId(initialBranchId);
    }
  }, [initialBranchId, selectedBranchId]);

  const handlePeriodChange = createPeriodChangeHandler(
    setPeriod,
    setDateFrom,
    setDateTo,
  );

  useEffect(() => {
    const nextPeriod = periodFromExactRange(dateFrom, dateTo);
    setPeriod((prev) => (prev === nextPeriod ? prev : nextPeriod));
  }, [dateFrom, dateTo]);

  const handleStartExport = async () => {
    if (!dateFrom || !dateTo) {
      toast.error(
        t(
          "cases.exportDrawer.missingDateRange",
          "Vui lòng chọn đầy đủ ngày bắt đầu và ngày kết thúc.",
        ),
      );
      return;
    }

    try {
      setExporting(true);
      const branchName = selectedBranchId
        ? branches?.find((b: any) => b.externalId === selectedBranchId)?.name
        : undefined;

      const exportParams: ExportCompletedCasesParams = {
        date_from: dateFrom,
        date_to: dateTo,
        date_type: dateType,
        branchId: selectedBranchId || undefined,
        classification: selectedClassification || undefined,
        status: selectedStatus,
      };

      const fileName = await garageApi.exportCompletedCasesExcel(exportParams);

      const newItem: GarageCaseExportHistoryItem = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        createdAt: new Date().toISOString(),
        dateFrom,
        dateTo,
        dateType,
        branchId: selectedBranchId || undefined,
        branchName,
        classification: selectedClassification || undefined,
        status: selectedStatus,
        fileName,
      };

      addHistoryItem(newItem);
      toast.success(
        t(
          "cases.exportDrawer.exportSuccess",
          "Xuất Excel bảng kê phiếu dịch vụ thành công.",
        ),
      );
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          t(
            "cases.exportDrawer.exportFailed",
            "Xuất Excel thất bại, vui lòng thử lại.",
          ),
      );
    } finally {
      setExporting(false);
    }
  };

  const handleDownloadAgain = async (item: GarageCaseExportHistoryItem) => {
    if (downloadingId) return;
    try {
      setDownloadingId(item.id);
      await garageApi.exportCompletedCasesExcel({
        date_from: item.dateFrom,
        date_to: item.dateTo,
        date_type: item.dateType,
        branchId: item.branchId,
        classification: item.classification,
        status: item.status,
        customFileName: item.fileName,
      });
      toast.success(
        t("cases.exportDrawer.downloadAgainSuccess", "Đang tải lại file XLSX."),
      );
    } catch (error: any) {
      toast.error(
        error?.message ||
          t(
            "cases.exportDrawer.downloadFailed",
            "Không thể tải file, vui lòng thử lại sau.",
          ),
      );
    } finally {
      setDownloadingId(null);
    }
  };

  return {
    t,
    period,
    setPeriod,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    dateType,
    setDateType,
    selectedBranchId,
    setSelectedBranchId,
    selectedClassification,
    setSelectedClassification,
    selectedStatus,
    setSelectedStatus,
    exporting,
    downloadingId,
    historyItems,
    branchOptions,
    classificationOptions,
    dateTypeOptions,
    statusOptions,
    periodOptions,
    handlePeriodChange,
    handleStartExport,
    handleDownloadAgain,
    handleClearHistory,
  };
}
