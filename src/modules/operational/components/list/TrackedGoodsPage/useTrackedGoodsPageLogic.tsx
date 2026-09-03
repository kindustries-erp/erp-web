import {
  useState,
  useMemo,
  useEffect,
  useCallback,
  useRef,
  useTransition,
} from "react";
import { Eye, Pencil, FileText, PackageMinus } from "lucide-react";
import { useTableColumnState } from "@/shared/hooks/useTableColumnState";
import { extractApiError } from "@/shared/utils/apiError";
import { useT } from "@/core/i18n";
import {
  inventoryCoreApi,
  type InventorySerialRow,
} from "@/modules/inventory-core/api/inventoryCoreApi";
import type { ActionDropdownItem } from "@/shared/components/ActionDropdown";
import type { TabItem } from "@/shared/components/PageLayout";
import { ErpUrlQueryParam } from "@/shared/constants/urlParams";
import { DEFAULT_DEBOUNCE_TIME } from "@/shared/constants/timing";
import { useInventorySerialsQuery } from "@/modules/inventory-core/hooks/useInventorySerialsQuery";
import { useGiDrawer } from "@/modules/goods-issues-core/hooks/useGiDrawer";

import type { TrackedGoodsPageProps, TabStateRecord } from "./types";
import { useTrackedGoodsUrlSync } from "./hooks/useTrackedGoodsUrlSync";
import { useTrackedGoodsColumns } from "./hooks/useTrackedGoodsColumns";
import { useTrackedGoodsParallelPrefetch } from "./hooks/useTrackedGoodsParallelPrefetch";

export function useTrackedGoodsPageLogic({
  fixedTrackingPolicy,
  initialTab,
  title,
  desc,
}: TrackedGoodsPageProps = {}) {
  const t = useT();
  const [isPending, startTransition] = useTransition();

  const pageTabs: TabItem[] = useMemo(
    () => [
      {
        value: "parts",
        label: t("inventoryTracking.tabParts", "Phụ tùng / Serial"),
      },
      {
        value: "lot",
        label: t("inventoryTracking.tabLot", "Lô (Lot)"),
      },
      {
        value: "custom",
        label: t("inventoryTracking.tabCustom", "Tùy chỉnh (Custom)"),
      },
    ],
    [t],
  );

  const [currentTab, setCurrentTab] = useState<string>(() => {
    if (initialTab) return initialTab;
    if (fixedTrackingPolicy) {
      const p = fixedTrackingPolicy.toLowerCase();
      if (p === "serial") return "parts";
      return p;
    }
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get(ErpUrlQueryParam.TAB);
      if (
        tabParam &&
        ["parts", "lot", "custom", "vehicle"].includes(tabParam)
      ) {
        return tabParam;
      }
    }
    return "parts";
  });

  const activeTrackingPolicy = useMemo(() => {
    if (fixedTrackingPolicy) return fixedTrackingPolicy;
    switch (currentTab) {
      case "vehicle":
        return "VEHICLE";
      case "parts":
        return "SERIAL";
      case "lot":
        return "LOT";
      case "custom":
        return "CUSTOM";
      default:
        return "SERIAL";
    }
  }, [fixedTrackingPolicy, currentTab]);

  const tableId = useMemo(() => {
    if (fixedTrackingPolicy) {
      return `inventory-tracked-goods-${fixedTrackingPolicy.toLowerCase()}-table`;
    }
    return `inventory-tracked-goods-${currentTab}-table`;
  }, [fixedTrackingPolicy, currentTab]);

  const [page, setPage] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const p = params.get(ErpUrlQueryParam.PAGE);
      if (p) return Math.max(1, parseInt(p, 10) || 1);
    }
    return 1;
  });
  const [pageSize, setPageSize] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const ps =
        params.get(ErpUrlQueryParam.PAGE_SIZE) ||
        params.get(ErpUrlQueryParam.LIMIT);
      if (ps) return parseInt(ps, 10) || 50;
    }
    return 50;
  });
  const [searchInput, setSearchInput] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      return params.get(ErpUrlQueryParam.SEARCH) || "";
    }
    return "";
  });
  const [search, setSearch] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      return params.get(ErpUrlQueryParam.SEARCH) || "";
    }
    return "";
  });
  const [itemTypeFilter, setItemTypeFilter] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      return params.get(ErpUrlQueryParam.ITEM_TYPE) || "";
    }
    return "";
  });
  const [trackingPolicyFilter, setTrackingPolicyFilter] = useState<string>(
    () => {
      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        return params.get(ErpUrlQueryParam.TRACKING_POLICY) || "";
      }
      return "";
    },
  );
  const [statusFilter, setStatusFilter] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      return params.get(ErpUrlQueryParam.STATUS) || "";
    }
    return "";
  });
  const [missingSerialFilter, setMissingSerialFilter] = useState<boolean>(
    () => {
      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        return params.get(ErpUrlQueryParam.MISSING_SERIAL) === "true";
      }
      return false;
    },
  );
  const [sortField] = useState("-created_at");
  const [selectedItem, setSelectedItem] = useState<InventorySerialRow | null>(
    () => {
      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        const detailParam = params.get(ErpUrlQueryParam.DETAIL);
        if (detailParam) {
          return {
            id: detailParam,
            serialNo: detailParam,
          } as unknown as InventorySerialRow;
        }
      }
      return null;
    },
  );
  const [drawerOpen, setDrawerOpen] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      return Boolean(params.get(ErpUrlQueryParam.DETAIL));
    }
    return false;
  });
  const [drawerMode, setDrawerMode] = useState<"view" | "edit">(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      return (
        (params.get(ErpUrlQueryParam.DRAWER_MODE) as "view" | "edit") || "view"
      );
    }
    return "view";
  });
  const [previewSoNo, setPreviewSoNo] = useState<string | null>(null);
  const giDrawer = useGiDrawer();

  const tableState = useTableColumnState(tableId);
  const tabStatesRef = useRef<Record<string, TabStateRecord>>({});

  useTrackedGoodsUrlSync({
    fixedTrackingPolicy,
    currentTab,
    setCurrentTab,
    search,
    itemTypeFilter,
    trackingPolicyFilter,
    statusFilter,
    missingSerialFilter,
    page,
    setPage,
    pageSize,
    setPageSize,
    tableState,
    drawerOpen,
    setDrawerOpen,
    drawerMode,
    setDrawerMode,
    selectedItem,
    setSelectedItem,
  });

  // Kích hoạt Micro-Priority Parallel Prefetch cho các tab còn lại sau 50ms
  useTrackedGoodsParallelPrefetch({
    currentTab,
    fixedTrackingPolicy,
    tabStatesRef,
  });

  const handleTabChange = useCallback(
    (nextTab: string) => {
      tabStatesRef.current[currentTab] = {
        page,
        pageSize,
        search,
        searchInput,
        itemTypeFilter,
        trackingPolicyFilter,
        statusFilter,
        missingSerialFilter,
      };

      const nextState = tabStatesRef.current[nextTab] || {
        page: 1,
        pageSize: 50,
        search: "",
        searchInput: "",
        itemTypeFilter: "",
        trackingPolicyFilter: "",
        statusFilter: "",
        missingSerialFilter: false,
      };

      setCurrentTab(nextTab);

      startTransition(() => {
        setPage(nextState.page);
        setPageSize(nextState.pageSize);
        setSearch(nextState.search);
        setSearchInput(nextState.searchInput);
        setItemTypeFilter(nextState.itemTypeFilter);
        setTrackingPolicyFilter(nextState.trackingPolicyFilter);
        setStatusFilter(nextState.statusFilter);
        setMissingSerialFilter(nextState.missingSerialFilter);
      });
    },
    [
      currentTab,
      page,
      pageSize,
      search,
      searchInput,
      itemTypeFilter,
      trackingPolicyFilter,
      statusFilter,
      missingSerialFilter,
    ],
  );

  useEffect(() => {
    const id = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, DEFAULT_DEBOUNCE_TIME);
    return () => clearTimeout(id);
  }, [searchInput]);

  const query = useInventorySerialsQuery({
    page,
    pageSize,
    search: search || undefined,
    itemType: itemTypeFilter || undefined,
    trackingPolicy: activeTrackingPolicy || trackingPolicyFilter || undefined,
    status: statusFilter || undefined,
    missingSerial: missingSerialFilter || undefined,
    sort:
      tableState.sorts.length > 0
        ? tableState.sorts
        : sortField
          ? [sortField]
          : undefined,
    column_search: JSON.stringify(tableState.columnSearch),
    column_filters: JSON.stringify(tableState.columnFilters),
  });

  const refetchRef = useRef(query.refetch);
  refetchRef.current = query.refetch;

  useEffect(() => {
    const handleRefresh = () => {
      refetchRef.current();
    };
    window.addEventListener("refresh_erp_data", handleRefresh);
    return () => window.removeEventListener("refresh_erp_data", handleRefresh);
  }, []);

  const loading = query.isLoading || query.isFetching;
  const error = query.error
    ? extractApiError(query.error, t("apiError.loadFailed", "Lỗi tải dữ liệu"))
    : null;
  const items = query.data?.items || [];
  const total = query.data?.total || 0;
  const totalPages = query.data?.totalPages || 0;

  const fetchSerialOptions = useCallback(
    async ({
      columnKey,
      search,
      pageParam,
      filtersStr,
    }: {
      columnKey: string;
      search: string;
      pageParam: number;
      filtersStr?: string;
    }) => {
      const res = await inventoryCoreApi.getSerialColumnOptions(
        columnKey,
        search,
        pageParam,
        20,
        filtersStr ? JSON.parse(filtersStr) : undefined,
        activeTrackingPolicy,
      );
      return {
        items: res.items.map((i: any) => ({
          label: String(i),
          value: String(i),
        })),
        total: res.total,
        next: res.page < res.totalPages ? res.page + 1 : null,
      };
    },
    [activeTrackingPolicy],
  );

  const getSortState = useCallback(
    (key: string) => {
      if (tableState.sorts.includes(key)) return "asc";
      if (tableState.sorts.includes(`-${key}`)) return "desc";
      return "none";
    },
    [tableState.sorts],
  );

  const handleSortChange = useCallback(
    (key: string, state: "asc" | "desc" | "none") => {
      tableState.setSort(key, state);
      setPage(1);
    },
    [tableState],
  );

  const handleSearchChange = useCallback(
    (key: string, val: string) => {
      tableState.setColumnSearch(key, val);
      setPage(1);
    },
    [tableState],
  );

  const handleFilterChange = useCallback(
    (key: string, vals: string[]) => {
      tableState.setColumnFilter(key, vals);
      setPage(1);
    },
    [tableState],
  );

  const columns = useTrackedGoodsColumns({
    currentTab,
    tableState,
    getSortState,
    handleSortChange,
    handleSearchChange,
    handleFilterChange,
    fetchSerialOptions,
    setSelectedItem,
    setDrawerOpen,
    setPage,
  });

  const resetAllFilters = useCallback(() => {
    setSearchInput("");
    setSearch("");
    setItemTypeFilter("");
    setTrackingPolicyFilter("");
    setStatusFilter("");
    setMissingSerialFilter(false);
    tableState.resetFilters();
    setPage(1);
    if (tabStatesRef.current[currentTab]) {
      tabStatesRef.current[currentTab] = {
        page: 1,
        pageSize: 50,
        search: "",
        searchInput: "",
        itemTypeFilter: "",
        trackingPolicyFilter: "",
        statusFilter: "",
        missingSerialFilter: false,
      };
    }
  }, [tableState, currentTab]);

  const rowActions = useCallback(
    (row: InventorySerialRow): ActionDropdownItem[] => [
      {
        groupLabel: t("common.groupSearch", "Tra cứu"),
        items: [
          {
            label: t("common.detail", "Xem chi tiết"),
            icon: <Eye className="w-3.5 h-3.5" />,
            onClick: () => {
              setSelectedItem(row);
              setDrawerMode("view");
              setDrawerOpen(true);
            },
          },
          ...(row.lifecycle?.goodsIssueId || row.lifecycle?.goodsIssueNo
            ? [
                {
                  label: t("inventory.viewGoodsIssue", "Xem phiếu xuất kho"),
                  icon: <PackageMinus className="w-3.5 h-3.5" />,
                  onClick: () => {
                    if (row.lifecycle?.goodsIssueId) {
                      giDrawer.openDetail(row.lifecycle.goodsIssueId);
                    }
                  },
                },
              ]
            : []),
          ...(row.soNo
            ? [
                {
                  label: t("sales.viewSo", "Xem đơn hàng"),
                  icon: <FileText className="w-3.5 h-3.5" />,
                  onClick: () => {
                    setPreviewSoNo(row.soNo || null);
                  },
                },
              ]
            : []),
        ],
      },
      {
        groupLabel: t("common.groupActions", "Thao tác"),
        items: [
          {
            label: t("common.edit", "Chỉnh sửa"),
            icon: <Pencil className="w-3.5 h-3.5" />,
            onClick: () => {
              setSelectedItem(row);
              setDrawerMode("edit");
              setDrawerOpen(true);
            },
          },
        ],
      },
    ],
    [t, giDrawer],
  );

  return {
    fixedTrackingPolicy,
    title,
    desc,
    t,
    pageTabs,
    currentTab,
    handleTabChange,
    tableId,
    items,
    columns,
    rowActions,
    loading,
    isPending,
    error,
    tableState,
    sortField,
    getSortState,
    handleSortChange,
    page,
    setPage,
    pageSize,
    setPageSize,
    total,
    totalPages,
    resetAllFilters,
    query,
    drawerOpen,
    setDrawerOpen,
    selectedItem,
    drawerMode,
    previewSoNo,
    setPreviewSoNo,
    giDrawer,
  };
}
