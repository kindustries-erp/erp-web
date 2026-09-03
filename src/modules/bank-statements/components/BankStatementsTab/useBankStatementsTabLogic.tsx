import React, { useState, useMemo, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useAppStore } from "@/core/config/appStore";
import { bankStatementApi } from "@/modules/bank-statements/api/bankStatementApi";
import { getBranchesApi } from "@/modules/branches/api/branchApi";
import { getTags } from "@/modules/tags/api/tagsApi";
import { useFilterPanel } from "@/shared/hooks/useFilterPanel";
import { useTableColumnState } from "@/shared/hooks/useTableColumnState";
import { clearAllDropdownSearchStates } from "@/shared/components/DataTable/TableColumnHeaderFilter";
import { usePageViewPresets } from "@/shared/hooks/usePageViewPresets";
import { usePageUrlState } from "@/shared/hooks/usePageUrlState";
import {
  useUserPreferencesStore,
  type TableViewPreset,
} from "@/shared/hooks/useUserPreferences";
import { money } from "@/shared/utils/format";
import {
  BANK_STATEMENT_COLUMN_VIEW_PRESETS,
  DEFAULT_BANK_COLUMN_VISIBILITY,
} from "./utils";
import { useBankStatementColumns } from "./components/BankStatementColumns";
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

  // 1. Pagination & Modal States
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);

  // 2. URL State Management & Tab Switcher (ALL / IN / OUT)
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

  // 3. Modal States
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isOriginalFilesOpen, setIsOriginalFilesOpen] = useState(false);
  const [detailTransactionId, setDetailTransactionId] = useState<string | null>(
    null,
  );
  const [detailDefaultTab, setDetailDefaultTab] =
    useState<string>("txn_details");
  const [partnerDrawerOpen, setPartnerDrawerOpen] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState<{
    account?: string;
    name?: string;
  } | null>(null);

  const handleOpenDetail = useCallback(
    (id: string, tab: string = "txn_details") => {
      setDetailDefaultTab(tab);
      setDetailTransactionId(id);
    },
    [],
  );

  // 3. View Mode Presets & Column Preferences
  const columnViewPresetsHook = usePageViewPresets({
    tableId,
    defaultPresets: BANK_STATEMENT_COLUMN_VIEW_PRESETS,
  });

  const currentTablePref = useUserPreferencesStore((s) => s.tables[tableId]);
  const currentColumnVisibility = currentTablePref?.columnVisibility;

  const [activeColumnPresetKey, setActiveColumnPresetKey] = useState<string>(
    () => {
      const stored = useUserPreferencesStore
        .getState()
        .getTablePreference(tableId);
      return stored?.activeView || "overview";
    },
  );

  const [viewConfigDrawerOpen, setViewConfigDrawerOpen] = useState(false);
  const [editingViewPreset, setEditingViewPreset] =
    useState<TableViewPreset | null>(null);

  const handleColumnPresetChange = (preset: TableViewPreset) => {
    setActiveColumnPresetKey(preset.key);

    const currentPref = useUserPreferencesStore
      .getState()
      .getTablePreference(tableId) || {
      columnOrder: [],
      columnVisibility: {},
    };

    useUserPreferencesStore.getState().setTablePreferences(tableId, {
      ...currentPref,
      columnVisibility:
        preset.columnVisibility || DEFAULT_BANK_COLUMN_VISIBILITY,
      activeView: preset.key,
    });
  };

  const handleOpenCreateView = () => {
    setEditingViewPreset(null);
    setViewConfigDrawerOpen(true);
  };

  const handleOpenEditView = (preset: TableViewPreset) => {
    setEditingViewPreset(preset);
    setViewConfigDrawerOpen(true);
  };

  const handleSaveViewPreset = (data: {
    key?: string;
    label: string;
    columnVisibility: Record<string, boolean>;
  }) => {
    columnViewPresetsHook.saveView(
      data.label,
      {},
      {},
      {},
      data.columnVisibility,
      data.key,
    );

    if (data.key) {
      setActiveColumnPresetKey(data.key);
      const currentPref = useUserPreferencesStore
        .getState()
        .getTablePreference(tableId) || {
        columnOrder: [],
        columnVisibility: {},
      };
      useUserPreferencesStore.getState().setTablePreferences(tableId, {
        ...currentPref,
        columnVisibility: data.columnVisibility,
        activeView: data.key,
      });
    }
  };

  const handleResetViewPreset = (key: string) => {
    columnViewPresetsHook.resetView(key);
    const factoryPreset = BANK_STATEMENT_COLUMN_VIEW_PRESETS.find(
      (p) => p.key === key,
    );
    if (factoryPreset) {
      handleColumnPresetChange(factoryPreset);
    }
  };

  const handleDeleteViewPreset = (key: string) => {
    columnViewPresetsHook.deleteView(key);
    if (activeColumnPresetKey === key) {
      const defaultPreset = BANK_STATEMENT_COLUMN_VIEW_PRESETS[0];
      handleColumnPresetChange(defaultPreset);
    }
  };

  // 4. Remote Master Data
  const { data: branches = [] } = useQuery({
    queryKey: ["branches:list"],
    queryFn: getBranchesApi,
  });

  const { data: accountsData = [] } = useQuery<any[]>({
    queryKey: [type === "bank" ? "bank-accounts" : "cash-books"],
    queryFn: async () => {
      const data =
        type === "bank"
          ? await bankStatementApi.getBankAccounts()
          : await bankStatementApi.getCashBooks();
      return data as any[];
    },
  });

  const { data: tags = [] } = useQuery({
    queryKey: ["sys-tags"],
    queryFn: getTags,
  });

  // 5. Filter Panel & Table Column State
  const filterConfig = useMemo(() => {
    const custom: any[] = [
      {
        key: "branchId",
        label: t("bankStatement.filters.branch", { defaultValue: "Chi nhánh" }),
        placeholder: t("bankStatement.filters.allBranches", {
          defaultValue: "Tất cả chi nhánh",
        }),
        options: branches.map((b) => ({ value: b.id, label: b.name })),
      },
    ];

    if (accountsData && accountsData.length > 0) {
      custom.push({
        key: type === "bank" ? "bankAccountId" : "cashBookId",
        label:
          type === "bank"
            ? t("bankStatement.filters.bank", { defaultValue: "Ngân hàng" })
            : t("bankStatement.filters.cashBook", { defaultValue: "Sổ quỹ" }),
        placeholder:
          type === "bank"
            ? t("bankStatement.filters.allBanks", {
                defaultValue: "Tất cả ngân hàng",
              })
            : t("bankStatement.filters.allCashBooks", {
                defaultValue: "Tất cả sổ quỹ",
              }),
        options: accountsData.map((a: any) => ({
          value: a.id,
          label:
            type === "bank" ? `${a.bankCode} - ${a.accountNumber}` : a.name,
        })),
      });
    }

    custom.push({
      key: "tagIds",
      label: t("bankStatement.filters.tags", {
        defaultValue: "Danh mục (Tags)",
      }),
      placeholder: t("bankStatement.filters.selectTags", {
        defaultValue: "Chọn danh mục",
      }),
      options: tags.map((t) => ({ value: t.id, label: t.name })),
      multiple: true,
    });

    return {
      search: false,
      period: true,
      noDefaultPeriod: true,
      custom,
    };
  }, [branches, accountsData, type, tags, t]);

  const filter = useFilterPanel(filterConfig, () => setPage(1));
  const tableState = useTableColumnState(tableId);

  const sortBy = tableState.sorts[0]
    ? tableState.sorts[0].replace("-", "")
    : undefined;
  const sortOrder = tableState.sorts[0]
    ? tableState.sorts[0].startsWith("-")
      ? "DESC"
      : "ASC"
    : undefined;

  // 6. Query Transactions Data
  const effectiveTransactionType =
    activeTransactionType === "ALL" ? undefined : activeTransactionType;

  const { data, isFetching, refetch } = useQuery({
    queryKey: [
      "bank-transactions",
      type,
      page,
      pageSize,
      filter.state,
      tableState.sorts,
      tableState.columnFilters,
      tableState.columnSearch,
      effectiveTransactionType,
    ],
    queryFn: () =>
      bankStatementApi.getTransactions({
        sourceType: type === "bank" ? "BANK" : "CASH",
        page,
        pageSize,
        sortBy,
        sortOrder,
        search: filter.state.search || undefined,
        startDate: filter.state.dateFrom || undefined,
        endDate: filter.state.dateTo || undefined,
        branchId: filter.state.custom.branchId || undefined,
        bankAccountId: filter.state.custom.bankAccountId || undefined,
        cashBookId: filter.state.custom.cashBookId || undefined,
        transactionType: effectiveTransactionType,
        tagIds: filter.state.custom.tagIds as unknown as string[] | undefined,
        column_search:
          Object.keys(tableState.columnSearch).length > 0
            ? JSON.stringify(tableState.columnSearch)
            : undefined,
        column_filters:
          Object.keys(tableState.columnFilters).length > 0
            ? JSON.stringify(tableState.columnFilters)
            : undefined,
      }),
  });

  // 7. Columns Definition
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

  // 8. Summary Row Calculation
  const summaryRow = useMemo(() => {
    if (!data?.items || data.items.length === 0) return undefined;

    const totalDebit = data.items.reduce(
      (acc: number, curr: any) => acc + (parseFloat(curr.debitAmount) || 0),
      0,
    );
    const totalCredit = data.items.reduce(
      (acc: number, curr: any) => acc + (parseFloat(curr.creditAmount) || 0),
      0,
    );
    const totalNetOff = data.items.reduce(
      (acc: number, curr: any) => acc + (parseFloat(curr.netOffAmount) || 0),
      0,
    );
    const totalRemaining = data.items.reduce(
      (acc: number, curr: any) =>
        acc +
        (Math.max(
          parseFloat(curr.creditAmount) || 0,
          parseFloat(curr.debitAmount) || 0,
        ) -
          (parseFloat(curr.netOffAmount) || 0)),
      0,
    );

    return {
      transDate: null,
      thu:
        totalCredit > 0 ? (
          <span className="text-emerald-600 font-medium">
            {money(totalCredit)}
          </span>
        ) : (
          money(0)
        ),
      chi:
        totalDebit > 0 ? (
          <span className="text-[#ea580c] font-medium">
            {money(totalDebit)}
          </span>
        ) : (
          money(0)
        ),
      netOffAmount:
        totalNetOff === 0 ? (
          "--"
        ) : (
          <span className="text-blue-600 dark:text-blue-400 font-medium">
            {money(totalNetOff)}
          </span>
        ),
      remainingAmount:
        totalRemaining === 0 ? (
          <span className="text-emerald-600 font-medium">0</span>
        ) : (
          <span className="text-slate-700 dark:text-slate-300 font-medium">
            {money(totalRemaining)}
          </span>
        ),
    };
  }, [data]);

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

  return {
    t,
    tableId,
    page,
    pageSize,
    setPage,
    setPageSize,
    activeTransactionType,
    handleTransactionTypeChange,
    columnViewPresetsHook,
    activeColumnPresetKey,
    handleColumnPresetChange,
    viewConfigDrawerOpen,
    setViewConfigDrawerOpen,
    editingViewPreset,
    handleOpenCreateView,
    handleOpenEditView,
    handleSaveViewPreset,
    handleResetViewPreset,
    handleDeleteViewPreset,
    currentColumnVisibility,
    branches,
    accountsData,
    filterConfig,
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
    setDetailDefaultTab,
    handleOpenDetail,
    partnerDrawerOpen,
    setPartnerDrawerOpen,
    selectedPartner,
    openCustomFieldsDrawer,
  };
}
