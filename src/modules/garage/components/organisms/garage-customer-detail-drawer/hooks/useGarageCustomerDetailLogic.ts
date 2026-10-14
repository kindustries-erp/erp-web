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

  const [selectedCaseCode, setSelectedCaseCode] = useState<string | null>(null);
  const [drawerEditMode, setDrawerEditMode] = useState<boolean>(false);
  const [settlementCase, setSettlementCase] = useState<any | null>(null);
  const [invoiceLinkingCase, setInvoiceLinkingCase] = useState<any | null>(
    null,
  );

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

  const completedCases = useMemo(() => {
    return allCases.filter(
      (c: any) => c.isCompleted !== false && Boolean(c.ngayHoanThanhCongViec),
    );
  }, [allCases]);

  const inProgressCases = useMemo(() => {
    return allCases.filter(
      (c: any) => c.isCompleted === false || !c.ngayHoanThanhCongViec,
    );
  }, [allCases]);

  useEffect(() => {
    setPage(1);
  }, [
    customerCode,
    activeSubTab,
    tableState.columnSearch,
    tableState.columnFilters,
    tableState.sorts,
    tableState.dateFrom,
    tableState.dateTo,
  ]);

  const totals = useMemo(
    () => calculateCustomerDebtTotals(allCases, activeDebtType),
    [allCases, activeDebtType],
  );
  const vehicleDebtStats = useMemo(
    () => calculateVehicleDebtStats(allCases, activeDebtType),
    [allCases, activeDebtType],
  );
  const agingDonutItems = useMemo(
    () => calculateAgingDonutItems(totals),
    [totals],
  );
  const monthlyTrendItems = useMemo(
    () => calculateMonthlyTrendItems(allCases, activeDebtType),
    [allCases, activeDebtType],
  );

  const filteredCompletedCases = useMemo(() => {
    return filterClientItems(completedCases, tableState, {
      dateField: "ngayHoanThanhCongViec",
    });
  }, [completedCases, tableState]);

  const paginatedCompletedCases = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredCompletedCases.slice(start, start + pageSize);
  }, [filteredCompletedCases, page, pageSize]);

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
    filteredCompletedCases,
    paginatedCompletedCases,
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
