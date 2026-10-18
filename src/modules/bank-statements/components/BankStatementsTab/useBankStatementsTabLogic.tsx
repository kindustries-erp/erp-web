import { useState, useMemo, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useAppStore } from "@/core/config/appStore";
import { bankStatementApi } from "@/modules/bank-statements/api/bankStatementApi";
import { clearAllDropdownSearchStates } from "@/shared/components/DataTable/TableColumnHeaderFilter";
import { usePageUrlState } from "@/shared/hooks/usePageUrlState";
import { useBankStatementColumns } from "./components/BankStatementColumns";
import { useBankStatementPresets } from "./hooks/useBankStatementPresets";
import { useBankStatementFilters } from "./hooks/useBankStatementFilters";
import { useBankStatementSummary } from "./hooks/useBankStatementSummary";
import { getColumnLabel } from "./components/bank-statement-export-drawer/BankStatementExportDrawer.helper";
import type { BankStatementColumnFilterItem } from "./components/bank-statement-export-drawer/BankStatementExportDrawer.type";
import { PageKey } from "@/shared/types";

export interface UseBankStatementsTabLogicProps {
  type: "bank" | "cash";
}

export function useBankStatementsTabLogic({
  type,
}: UseBankStatementsTabLogicProps) {
  const { t } = useTranslation();
  const { openCustomFieldsDrawer } = useAppStore();
  const queryClient = useQueryClient();

  const pageKey: PageKey =
    type === "bank" ? "bank-statement" : "cash-statement";
  const tableId = `bank-statement-${type}-table-v3`;

  // 1. Pagination & URL State Management
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [activeTransactionType, setActiveTransactionType] = useState<
    "ALL" | "IN" | "OUT"
  >("ALL");

  const urlState = usePageUrlState({
    pageKey,
    filterKeys: [
      "branchId",
      "bankAccountId",
      "cashBookId",
      "txnType",
      "dateFrom",
      "dateTo",
    ],
    drawerSync: true,
    onUrlStateHydrate: (state) => {
      if (state.filters?.txnType === "IN" || state.filters?.txnType === "OUT") {
        setActiveTransactionType(state.filters.txnType);
      } else {
        setActiveTransactionType("ALL");
      }
    },
  });

  const handleTransactionTypeChange = useCallback(
    (newType: string) => {
      const validVal = newType === "IN" || newType === "OUT" ? newType : "ALL";
      setActiveTransactionType(validVal);
      setPage(1);
      urlState.setFilter("txnType", validVal === "ALL" ? "" : validVal);
    },
    [urlState, setPage],
  );

  // 2. Modal & Drawer States
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isOriginalFilesOpen, setIsOriginalFilesOpen] = useState(false);
  const [detailTransactionId, setDetailTransactionId] = useState<string | null>(
    null,
  );
  const [detailDefaultTab, setDetailDefaultTab] =
    useState<string>("txn_details");
  const [detailMode, setDetailMode] = useState<"view" | "edit">("view");
  const [partnerDrawerOpen, setPartnerDrawerOpen] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState<{
    account?: string;
    name?: string;
  } | null>(null);

  const handleOpenDetail = useCallback(
    (id: string, tab = "txn_details", mode: "view" | "edit" = "view") => {
      setDetailDefaultTab(tab);
      setDetailMode(mode);
      setDetailTransactionId(id);
    },
    [],
  );

  // 3. Sub-hooks (Presets & Filters)
  const presets = useBankStatementPresets(tableId);
  const filtersHook = useBankStatementFilters({ type, tableId, t });
  const { branches, accountsData, filter, tableState, appliedFilters } =
    filtersHook;

  // 4. Server-Side Query Transactions API (Auto sorted by backend)
  const queryParams = useMemo(() => {
    const hasColumnFilters =
      tableState.columnFilters &&
      Object.keys(tableState.columnFilters).length > 0 &&
      Object.values(tableState.columnFilters).some(
        (vals) => Array.isArray(vals) && vals.length > 0,
      );

    const hasColumnSearch =
      tableState.columnSearch &&
      Object.keys(tableState.columnSearch).length > 0 &&
      Object.values(tableState.columnSearch).some(
        (val) => typeof val === "string" && val.trim().length > 0,
      );

    const firstSort = tableState.sorts?.[0];
    const sortBy = firstSort
      ? firstSort.startsWith("-")
        ? firstSort.substring(1)
        : firstSort
      : undefined;
    const sortOrder = firstSort
      ? firstSort.startsWith("-")
        ? ("DESC" as const)
        : ("ASC" as const)
      : undefined;

    const params: any = {
      page,
      pageSize,
      sourceType: type === "bank" ? "BANK" : "CASH",
      ...appliedFilters,
      column_filters: hasColumnFilters
        ? JSON.stringify(tableState.columnFilters)
        : undefined,
      column_search: hasColumnSearch
        ? JSON.stringify(tableState.columnSearch)
        : undefined,
      sortBy,
      sortOrder,
    };

    if (activeTransactionType !== "ALL") {
      params.transactionType = activeTransactionType;
    }
    return params;
  }, [page, pageSize, type, appliedFilters, tableState, activeTransactionType]);

  const { data, isFetching, refetch } = useQuery({
    queryKey: ["bank-transactions", queryParams],
    queryFn: () => bankStatementApi.getTransactions(queryParams),
    placeholderData: (prev) => prev,
  });

  const { data: dashboardStats } = useQuery({
    queryKey: ["bank-transactions-dashboard", appliedFilters],
    queryFn: () =>
      bankStatementApi.getDashboardStats({
        ...appliedFilters,
        sourceType: type === "bank" ? "BANK" : "CASH",
      }),
  });

  // 5. Columns & Summary Subtotal
  const { columns } = useBankStatementColumns({
    type,
    page,
    pageSize,
    tableState,
    filter,
    setPage,
    setDetailTransactionId,
    setDetailDefaultTab,
    setSelectedPartner,
    setPartnerDrawerOpen,
  });

  const summaryRow = useBankStatementSummary({
    data,
    dashboardStats,
    page,
    pageSize,
    t,
  });

  const handleRefresh = useCallback(() => {
    refetch();
    queryClient.invalidateQueries({
      queryKey: [type === "bank" ? "bank-accounts" : "cash-books"],
    });
  }, [refetch, queryClient, type]);

  const handleClearAllFilters = useCallback(() => {
    filter.resetAll();
    tableState.resetFilters();
    clearAllDropdownSearchStates();
    setPage(1);
  }, [filter, tableState, setPage]);

  const buildBaseQuery = useCallback(() => {
    const hasColumnFilters =
      tableState.columnFilters &&
      Object.keys(tableState.columnFilters).length > 0 &&
      Object.values(tableState.columnFilters).some(
        (vals) => Array.isArray(vals) && vals.length > 0,
      );

    const hasColumnSearch =
      tableState.columnSearch &&
      Object.keys(tableState.columnSearch).length > 0 &&
      Object.values(tableState.columnSearch).some(
        (val) => typeof val === "string" && val.trim().length > 0,
      );

    const firstSort = tableState.sorts?.[0];
    const sortBy = firstSort
      ? firstSort.startsWith("-")
        ? firstSort.substring(1)
        : firstSort
      : undefined;
    const sortOrder = firstSort
      ? firstSort.startsWith("-")
        ? ("DESC" as const)
        : ("ASC" as const)
      : undefined;

    const params: any = {
      sourceType: type === "bank" ? "BANK" : "CASH",
      ...appliedFilters,
      column_filters: hasColumnFilters
        ? JSON.stringify(tableState.columnFilters)
        : undefined,
      column_search: hasColumnSearch
        ? JSON.stringify(tableState.columnSearch)
        : undefined,
      sortBy,
      sortOrder,
    };

    if (activeTransactionType !== "ALL") {
      params.transactionType = activeTransactionType;
    }
    if (filter.state.search) {
      params.search = filter.state.search;
    }
    return params;
  }, [
    appliedFilters,
    tableState.columnFilters,
    tableState.columnSearch,
    tableState.sorts,
    filter.state.search,
    type,
    activeTransactionType,
  ]);

  const currentFilterSummary = useMemo(() => {
    const columnFiltersSummary: BankStatementColumnFilterItem[] = [];

    if (tableState.columnFilters) {
      Object.entries(tableState.columnFilters).forEach(([colKey, vals]) => {
        if (Array.isArray(vals) && vals.length > 0) {
          columnFiltersSummary.push({
            id: `${colKey}-values`,
            columnKey: colKey,
            columnLabel: getColumnLabel(colKey),
            displayValue: vals.join(", "),
            type: "values",
          });
        }
      });
    }

    if (tableState.columnSearch) {
      Object.entries(tableState.columnSearch).forEach(([colKey, val]) => {
        if (typeof val === "string" && val.trim().length > 0) {
          columnFiltersSummary.push({
            id: `${colKey}-search`,
            columnKey: colKey,
            columnLabel: `${getColumnLabel(colKey)} (từ khóa)`,
            displayValue: `"${val.trim()}"`,
            type: "search",
          });
        }
      });
    }

    let filterCount = 0;
    if (appliedFilters.startDate || appliedFilters.endDate) filterCount++;
    if (filter.state.search) filterCount++;
    if (appliedFilters.bankAccountId || appliedFilters.cashBookId)
      filterCount++;
    if (activeTransactionType !== "ALL") filterCount++;
    if (appliedFilters.branchId) filterCount++;
    if (appliedFilters.tagIds && appliedFilters.tagIds.length > 0)
      filterCount++;
    filterCount += columnFiltersSummary.length;

    const targetAccountId =
      type === "bank"
        ? appliedFilters.bankAccountId
        : appliedFilters.cashBookId;
    const accountObj = accountsData?.find((a: any) => a.id === targetAccountId);
    const accountName = accountObj
      ? type === "bank"
        ? `${accountObj.bankCode} - ${accountObj.accountNumber}`
        : accountObj.name
      : undefined;

    const branchObj = branches?.find(
      (b: any) => b.id === appliedFilters.branchId,
    );
    const branchName = branchObj ? branchObj.name : undefined;

    return {
      dateFrom: appliedFilters.startDate,
      dateTo: appliedFilters.endDate,
      search: filter.state.search,
      accountName,
      branchName,
      transactionType:
        activeTransactionType !== "ALL" ? activeTransactionType : undefined,
      hasActiveFilters: filterCount > 0,
      filterCount,
      columnFiltersSummary,
    };
  }, [
    accountsData,
    appliedFilters,
    branches,
    type,
    filter.state.search,
    activeTransactionType,
    tableState.columnFilters,
    tableState.columnSearch,
  ]);

  return {
    t,
    tableId,
    page,
    pageSize,
    setPage,
    setPageSize,
    activeTransactionType,
    handleTransactionTypeChange,
    ...presets,
    branches,
    accountsData,
    filter,
    tableState,
    data,
    isFetching,
    columns,
    summaryRow,
    handleRefresh,
    handleClearAllFilters,
    isExportOpen,
    setIsExportOpen,
    isOriginalFilesOpen,
    setIsOriginalFilesOpen,
    isImportOpen,
    setIsImportOpen,
    isCreateOpen,
    setIsCreateOpen,
    detailTransactionId,
    setDetailTransactionId,
    detailDefaultTab,
    detailMode,
    handleOpenDetail,
    partnerDrawerOpen,
    setPartnerDrawerOpen,
    selectedPartner,
    setSelectedPartner,
    openCustomFieldsDrawer,
    buildBaseQuery,
    currentFilterSummary,
  };
}
