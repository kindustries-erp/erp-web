import { useState, useEffect, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { garageApi } from "../../../api/garageApi";
import { useSyncGarageCaseDetail } from "../../../hooks/useGarage";
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
}: GarageCustomerDetailDrawerProps) {
  const { t } = useTranslation(["garage", "common"]);
  const queryClient = useQueryClient();
  const { mutate: syncCaseDetail } = useSyncGarageCaseDetail();

  const [selectedCaseCode, setSelectedCaseCode] = useState<string | null>(null);
  const [drawerEditMode, setDrawerEditMode] = useState<boolean>(false);
  const [settlementCase, setSettlementCase] = useState<any | null>(null);
  const [invoiceLinkingCase, setInvoiceLinkingCase] = useState<any | null>(
    null,
  );

  // Sub-tabs navigation state
  const [activeSubTab, setActiveSubTab] = useState<string>("cases");

  // Client-side pagination state
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Table client filter & sorting state hook
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

  // Separate completed cases (official debt) vs in-progress cases (pipeline)
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

  // Reset pagination when table filter changes
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

  const totals = useMemo(() => {
    return calculateCustomerDebtTotals(allCases);
  }, [allCases]);

  const vehicleDebtStats = useMemo(() => {
    return calculateVehicleDebtStats(allCases);
  }, [allCases]);

  const agingDonutItems = useMemo(() => {
    return calculateAgingDonutItems(totals);
  }, [totals]);

  const monthlyTrendItems = useMemo(() => {
    return calculateMonthlyTrendItems(allCases);
  }, [allCases]);

  // Filtered completed cases for Tab 1
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
