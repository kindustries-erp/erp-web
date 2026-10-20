import { useState, useEffect, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { garageApi } from "@/modules/garage/api/garageApi";
import { useSyncGarageCaseDetail } from "@/modules/garage/hooks/useGarage";
import { useTableColumnState } from "@/shared/hooks/useTableColumnState";
import { filterClientItems } from "@/shared/components/DataTable";
import { toast } from "react-hot-toast";
import type { GarageCustomerDetailDrawerProps } from "../types";
import {
  calculateCustomerDebtTotals,
  calculateVehicleDebtStats,
  calculateAgingDonutItems,
  calculateMonthlyTrendItems,
} from "../utils/customerDebtCalculators";

export function useGarageCustomerDetailLogic({
  open,
  customerCode,
  branchId,
  licensePlate,
  debtType = "receivables",
  onDebtTypeChange,
}: GarageCustomerDetailDrawerProps) {
  const { t } = useTranslation(["garage", "common"]);
  const queryClient = useQueryClient();
  const { mutate: syncCaseDetail } = useSyncGarageCaseDetail();

  const [activeDebtType, setActiveDebtType] = useState<
    "receivables" | "payables"
  >(debtType);
  useEffect(() => {
    if (debtType) setActiveDebtType(debtType);
  }, [debtType]);

  const handleDebtTypeChange = useCallback(
    (newType: "receivables" | "payables") => {
      setActiveDebtType(newType);
      onDebtTypeChange?.(newType);
    },
    [onDebtTypeChange],
  );

  const [selectedLicensePlate, setSelectedLicensePlate] = useState<
    string | null
  >(licensePlate ? licensePlate.trim() : null);

  useEffect(() => {
    if (open) {
      setSelectedLicensePlate(licensePlate ? licensePlate.trim() : null);
    }
  }, [open, licensePlate, customerCode]);

  const [selectedCaseCode, setSelectedCaseCode] = useState<string | null>(null);
  const [drawerEditMode, setDrawerEditMode] = useState<boolean>(false);
  const [settlementCase, setSettlementCase] = useState<any | null>(null);
  const [invoiceLinkingCase, setInvoiceLinkingCase] = useState<any | null>(
    null,
  );

  const [selectedCaseStatus, setSelectedCaseStatus] = useState<
    "ALL" | "COMPLETED" | "IN_PROGRESS"
  >("ALL");

  const [activeSubTab, setActiveSubTab] = useState<string>("cases");
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  const tableState = useTableColumnState(
    `garage-customer-cases-detail-${customerCode || "unknown"}`,
  );

  const {
    data: allCases = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["garage-cases-by-customer", branchId, customerCode],
    queryFn: () => {
      if (!customerCode) return Promise.resolve([]);
      return garageApi.getCasesByCustomer(branchId || "", customerCode);
    },
    enabled: open && Boolean(customerCode),
  });

  const isMatchingVehicle = useCallback(
    (caseItem: any, targetPlate: string | null) => {
      if (!targetPlate || targetPlate === "ALL") return true;
      const lp = (caseItem.bienSoXe || "").trim().toUpperCase();
      const target = targetPlate.trim().toUpperCase();
      if (target === "CHƯA CÓ BKS" || target === "NO_BKS") {
        return !lp || lp === "CHƯA CÓ BKS" || lp === "NO_BKS";
      }
      return lp === target;
    },
    [],
  );

  const availableVehicles = useMemo(() => {
    const map = new Map<
      string,
      { licensePlate: string; count: number; balance: number }
    >();
    allCases.forEach((c: any) => {
      const lp = (c.bienSoXe || "").trim() || "Chưa có BKS";
      const isComp =
        c.isCompleted !== false && Boolean(c.ngayHoanThanhCongViec);
      const bal =
        activeDebtType === "payables"
          ? (Number(c.chiPhi) || 0) - (Number(c.tienDaChi) || 0)
          : (Number(c.tienCoThue) || 0) - (Number(c.tienDaThanhToan) || 0);

      if (!map.has(lp)) {
        map.set(lp, { licensePlate: lp, count: 0, balance: 0 });
      }
      const cur = map.get(lp)!;
      if (isComp) {
        cur.count += 1;
        cur.balance += Math.max(0, bal);
      }
    });
    return Array.from(map.values()).sort((a, b) => b.balance - a.balance);
  }, [allCases, activeDebtType]);

  const vehicleFilteredCases = useMemo(() => {
    return allCases.filter((c: any) =>
      isMatchingVehicle(c, selectedLicensePlate),
    );
  }, [allCases, selectedLicensePlate, isMatchingVehicle]);

  const statusCounts = useMemo(() => {
    let completed = 0;
    let inProgress = 0;
    vehicleFilteredCases.forEach((c: any) => {
      if (c.isCompleted !== false && Boolean(c.ngayHoanThanhCongViec)) {
        completed += 1;
      } else {
        inProgress += 1;
      }
    });
    return {
      all: vehicleFilteredCases.length,
      completed,
      inProgress,
    };
  }, [vehicleFilteredCases]);

  const statusFilteredCases = useMemo(() => {
    if (selectedCaseStatus === "COMPLETED") {
      return vehicleFilteredCases.filter(
        (c: any) => c.isCompleted !== false && Boolean(c.ngayHoanThanhCongViec),
      );
    }
    if (selectedCaseStatus === "IN_PROGRESS") {
      return vehicleFilteredCases.filter(
        (c: any) => c.isCompleted === false || !c.ngayHoanThanhCongViec,
      );
    }
    return vehicleFilteredCases;
  }, [vehicleFilteredCases, selectedCaseStatus]);

  const completedCases = useMemo(() => {
    return allCases.filter(
      (c: any) =>
        c.isCompleted !== false &&
        Boolean(c.ngayHoanThanhCongViec) &&
        isMatchingVehicle(c, selectedLicensePlate),
    );
  }, [allCases, selectedLicensePlate, isMatchingVehicle]);

  const inProgressCases = useMemo(() => {
    return allCases.filter(
      (c: any) =>
        (c.isCompleted === false || !c.ngayHoanThanhCongViec) &&
        isMatchingVehicle(c, selectedLicensePlate),
    );
  }, [allCases, selectedLicensePlate, isMatchingVehicle]);

  useEffect(() => {
    setPage(1);
  }, [
    customerCode,
    selectedLicensePlate,
    selectedCaseStatus,
    activeSubTab,
    tableState.columnSearch,
    tableState.columnFilters,
    tableState.sorts,
    tableState.dateFrom,
    tableState.dateTo,
  ]);

  const customerOverallTotals = useMemo(
    () => calculateCustomerDebtTotals(allCases, activeDebtType),
    [allCases, activeDebtType],
  );

  const activeCases = useMemo(() => {
    if (!selectedLicensePlate || selectedLicensePlate === "ALL")
      return allCases;
    return allCases.filter((c: any) =>
      isMatchingVehicle(c, selectedLicensePlate),
    );
  }, [allCases, selectedLicensePlate, isMatchingVehicle]);

  const activeTotals = useMemo(
    () => calculateCustomerDebtTotals(activeCases, activeDebtType),
    [activeCases, activeDebtType],
  );

  const totals = activeTotals;

  const vehicleDebtStats = useMemo(
    () => calculateVehicleDebtStats(allCases, activeDebtType),
    [allCases, activeDebtType],
  );
  const agingDonutItems = useMemo(
    () => calculateAgingDonutItems(totals),
    [totals],
  );
  const monthlyTrendItems = useMemo(
    () => calculateMonthlyTrendItems(activeCases, activeDebtType),
    [activeCases, activeDebtType],
  );

  const filteredCases = useMemo(() => {
    return filterClientItems(statusFilteredCases, tableState, {
      dateField: "ngayHoanThanhCongViec",
    });
  }, [statusFilteredCases, tableState]);

  const paginatedCases = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredCases.slice(start, start + pageSize);
  }, [filteredCases, page, pageSize]);

  const filteredCompletedCases = filteredCases;
  const paginatedCompletedCases = paginatedCases;

  const handleSyncFromKgara = useCallback(
    (caseId: string) => {
      if (!caseId) return;
      toast.loading(
        t("cases.syncingCase", "Đang đồng bộ dữ liệu vụ việc từ KGara..."),
        { id: `sync-case-${caseId}` },
      );
      syncCaseDetail(
        { branchId: branchId || "", caseId },
        {
          onSuccess: () => {
            toast.success(
              t("cases.syncSuccess", "Đã cập nhật dữ liệu mới nhất từ KGara!"),
              { id: `sync-case-${caseId}` },
            );
            refetch();
            queryClient.invalidateQueries({
              queryKey: ["garage-customers-debt"],
            });
          },
          onError: (err: any) => {
            toast.error(
              err?.message ||
                t("cases.syncFailed", "Đồng bộ thất bại, vui lòng thử lại."),
              { id: `sync-case-${caseId}` },
            );
          },
        },
      );
    },
    [branchId, queryClient, refetch, syncCaseDetail, t],
  );

  return {
    t,
    isLoading,
    refetch,
    allCases,
    completedCases,
    inProgressCases,
    filteredCases,
    paginatedCases,
    filteredCompletedCases,
    paginatedCompletedCases,
    selectedLicensePlate,
    setSelectedLicensePlate,
    selectedCaseStatus,
    setSelectedCaseStatus,
    statusCounts,
    availableVehicles,
    activeTotals,
    customerOverallTotals,
    totals,
    vehicleDebtStats,
    agingDonutItems,
    monthlyTrendItems,
    activeSubTab,
    setActiveSubTab,
    activeDebtType,
    setActiveDebtType: handleDebtTypeChange,
    page,
    setPage,
    pageSize,
    setPageSize,
    tableState,
    selectedCaseCode,
    setSelectedCaseCode,
    drawerEditMode,
    setDrawerEditMode,
    settlementCase,
    setSettlementCase,
    invoiceLinkingCase,
    setInvoiceLinkingCase,
    handleSyncFromKgara,
  };
}
