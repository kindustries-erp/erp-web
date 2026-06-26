import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Trash2,
  ChevronRight,
  Network,
  Loader2,
  Eye,
  Copy,
  Ban,
  CheckCircle,
  FileSpreadsheet,
  FileText,
} from "lucide-react";
import toast from "react-hot-toast";
import { useUIStore } from "@/core/config/uiStore";
import { DocumentLineTable } from "@/shared/components/DocumentLineTable";
import { SearchInput } from "@/shared/components/SearchInput";
import { type DataTableColumn } from "@/shared/components/DataTable";
import { SpreadsheetPageTemplate } from "@/shared/components/SpreadsheetPageTemplate";
import { ConfirmModal } from "@/shared/components/ConfirmModal";
import {
  useFilterPanel,
  type FilterPanelConfig,
} from "@/shared/hooks/useFilterPanel";
import {
  bomCoreApi,
  type ErpBom,
  type ErpBomLine,
} from "@/modules/bom-core/api/bomCoreApi";
import { useHasPermission } from "@/shared/hooks/useHasPermission";
import { Forbidden } from "@/pages/Forbidden";
import { useBasicMasterInfinite } from "@/modules/basic-masters/hooks/useBasicMasterInfinite";
import { cn } from "@/shared/utils";
import { useT } from "@/core/i18n";
import { extractItemCodeAndName } from "@/shared/utils/format";
import { Tooltip } from "@/core/components/ui/Tooltip";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const ITEM_LOOKUP_LIMIT = 200;

import {
  BomFormDrawer,
  type BomForm,
  type BomLineForm,
  buildForm,
  emptyForm,
  emptyLine,
  toPayload,
} from "@/modules/bom-core/components/BomFormDrawer";

function fmtDate(value?: string | null) {
  if (!value) return "—";
  return value.slice(0, 10);
}

interface BomTreeProps {
  bomId: string;
  fgToBomMap: Record<string, ErpBom>;
  itemsMap: Record<string, string>;
  level?: number;
}

interface FlatNode {
  uniqueId: string;
  parentId: string | null;
  line: ErpBomLine;
  level: number;
  isExpanded: boolean;
  isLoading: boolean;
  isError: boolean;
  subBomId: string | null;
}

function BomTree({ bomId, fgToBomMap, itemsMap }: BomTreeProps) {
  const t = useT();
  const [flatNodes, setFlatNodes] = useState<FlatNode[]>([]);
  const [initialLoading, setInitialLoading] = useState(false);
  const [initialError, setInitialError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  } | null>(null);

  useEffect(() => {
    let active = true;
    async function loadRoot() {
      setInitialLoading(true);
      try {
        const detail = await bomCoreApi.get(bomId);
        if (active) {
          const rootNodes: FlatNode[] = (detail.lines || []).map((l) => ({
            uniqueId: l.id || crypto.randomUUID(),
            parentId: null,
            line: l,
            level: 0,
            isExpanded: false,
            isLoading: false,
            isError: false,
            subBomId: l.componentItemId
              ? fgToBomMap[l.componentItemId]?.id || null
              : null,
          }));
          setFlatNodes(rootNodes);
        }
      } catch {
        if (active) setInitialError(t("Không thể tải chi tiết cấu trúc"));
      } finally {
        if (active) setInitialLoading(false);
      }
    }
    void loadRoot();
    return () => {
      active = false;
    };
  }, [bomId, fgToBomMap, t]);

  const toggleExpand = async (nodeId: string, subBomId: string) => {
    // Circular reference guard: collect ancestor bomIds of this node
    const getAncestorBomIds = (
      nodes: FlatNode[],
      startId: string,
    ): Set<string> => {
      const visited = new Set<string>();
      visited.add(bomId);
      let curr = nodes.find((n) => n.uniqueId === startId);
      curr = curr?.parentId
        ? nodes.find((n) => n.uniqueId === curr!.parentId)
        : undefined;
      while (curr) {
        if (curr.subBomId) visited.add(curr.subBomId);
        curr = curr.parentId
          ? nodes.find((n) => n.uniqueId === curr!.parentId)
          : undefined;
      }
      return visited;
    };

    // Depth guard: max 10 levels to prevent run-away recursion
    const getNodeLevel = (nodes: FlatNode[], nId: string): number =>
      nodes.find((n) => n.uniqueId === nId)?.level ?? 0;

    if (getNodeLevel(flatNodes, nodeId) >= 10) {
      console.warn("[BomTree] Max depth (10) reached, not expanding further");
      return;
    }

    const ancestorBomIds = getAncestorBomIds(flatNodes, nodeId);
    if (ancestorBomIds.has(subBomId)) {
      console.warn(
        "[BomTree] Circular BOM reference detected, stopping expansion:",
        subBomId,
      );
      return;
    }

    setFlatNodes((prev) =>
      prev.map((n) =>
        n.uniqueId === nodeId ? { ...n, isExpanded: !n.isExpanded } : n,
      ),
    );

    const node = flatNodes.find((n) => n.uniqueId === nodeId);
    if (!node?.isExpanded) {
      const hasChildren = flatNodes.some((n) => n.parentId === nodeId);
      if (!hasChildren) {
        setFlatNodes((prev) =>
          prev.map((n) =>
            n.uniqueId === nodeId ? { ...n, isLoading: true } : n,
          ),
        );
        try {
          const detail = await bomCoreApi.get(subBomId);
          setFlatNodes((prev) => {
            const idx = prev.findIndex((n) => n.uniqueId === nodeId);
            if (idx === -1) return prev;
            const newNodes: FlatNode[] = (detail.lines || []).map((l) => ({
              uniqueId: `${nodeId}_${l.id || crypto.randomUUID()}`,
              parentId: nodeId,
              line: l,
              level: prev[idx].level + 1,
              isExpanded: false,
              isLoading: false,
              isError: false,
              subBomId: l.componentItemId
                ? fgToBomMap[l.componentItemId]?.id || null
                : null,
            }));
            const next = [...prev];
            next[idx] = { ...next[idx], isLoading: false };
            next.splice(idx + 1, 0, ...newNodes);
            return next;
          });
        } catch {
          setFlatNodes((prev) =>
            prev.map((n) =>
              n.uniqueId === nodeId
                ? { ...n, isLoading: false, isError: true }
                : n,
            ),
          );
        }
      }
    }
  };

  const visibleNodes = useMemo(() => {
    return flatNodes.filter((n) => {
      if (n.parentId === null) return true;
      let curr = flatNodes.find((p) => p.uniqueId === n.parentId);
      while (curr) {
        if (!curr.isExpanded) return false;
        curr = flatNodes.find((p) => p.uniqueId === curr!.parentId);
      }
      return true;
    });
  }, [flatNodes]);

  const filteredAndSorted = useMemo(() => {
    let arr = [...visibleNodes];
    if (search) {
      const q = search.toLowerCase();
      arr = arr.filter((n) => {
        const itemId = n.line.componentItemId;
        const fallbackLabel = itemId ? itemsMap[itemId] || "" : "";
        const { code, name } = extractItemCodeAndName(
          n.line.componentItemCode,
          n.line.componentItemName,
          fallbackLabel,
        );
        return (
          code.toLowerCase().includes(q) ||
          name.toLowerCase().includes(q) ||
          String(n.line.qtyRequired || "").includes(q)
        );
      });
    }
    if (sortConfig) {
      const { key, direction } = sortConfig;
      arr.sort((a, b) => {
        let aVal: string | number = "";
        let bVal: string | number = "";
        if (key === "sku" || key === "name") {
          const fallbackLabelA = a.line.componentItemId
            ? itemsMap[a.line.componentItemId] || ""
            : "";
          const fallbackLabelB = b.line.componentItemId
            ? itemsMap[b.line.componentItemId] || ""
            : "";
          const extractedA = extractItemCodeAndName(
            a.line.componentItemCode,
            a.line.componentItemName,
            fallbackLabelA,
          );
          const extractedB = extractItemCodeAndName(
            b.line.componentItemCode,
            b.line.componentItemName,
            fallbackLabelB,
          );

          aVal = key === "sku" ? extractedA.code : extractedA.name;
          bVal = key === "sku" ? extractedB.code : extractedB.name;
        }
        if (key === "qty") {
          aVal = parseFloat(a.line.qtyRequired || "0");
          bVal = parseFloat(b.line.qtyRequired || "0");
        }
        if (aVal < bVal) return direction === "asc" ? -1 : 1;
        if (aVal > bVal) return direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return arr;
  }, [visibleNodes, search, sortConfig, itemsMap]);

  const handleSort = (key: string) => {
    let direction: "asc" | "desc" | null = "asc";
    if (sortConfig?.key === key) {
      if (sortConfig.direction === "asc") direction = "desc";
      else direction = null;
    }
    setSortConfig(direction ? { key, direction } : null);
  };

  if (initialLoading) {
    return (
      <div className="pl-4 py-4 text-xs text-muted-foreground animate-pulse">
        {t("Đang tải cấu trúc NVL...")}
      </div>
    );
  }

  if (initialError) {
    return (
      <div className="pl-4 py-4 text-xs text-red-500 font-medium">
        ⚠️ {initialError}
      </div>
    );
  }

  if (flatNodes.length === 0) {
    return (
      <div className="pl-4 py-4 text-xs text-muted-foreground italic">
        {t("Không có nguyên vật liệu bên trong.")}
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-slate-50 dark:bg-zinc-950/50 p-4 md:p-6 my-2 shadow-sm border border-border flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="font-semibold text-base text-foreground whitespace-nowrap shrink-0">
          {t("Chi tiết")} (
          {search
            ? `${filteredAndSorted.length}/${visibleNodes.length}`
            : visibleNodes.length}
          )
        </div>
        <SearchInput
          className="w-full sm:w-64"
          placeholder={t("Tìm mã/tên linh kiện, SL...")}
          value={search}
          onChange={setSearch}
        />
      </div>
      <div className="w-full overflow-auto max-h-[300px]">
        <DocumentLineTable
          columns={[
            {
              key: "index",
              header: "#",
              width: 50,
              align: "center",
              cell: (_, idx) => (
                <span className="text-muted-foreground">{idx + 1}</span>
              ),
            },
            {
              key: "sku",
              header: t("Mã linh kiện"),
              minWidth: 140,
              sortable: true,
              cell: (node: FlatNode) => {
                const itemId = node.line.componentItemId;
                const fallbackLabel = itemId ? itemsMap[itemId] || "" : "";
                const { code } = extractItemCodeAndName(
                  node.line.componentItemCode,
                  node.line.componentItemName,
                  fallbackLabel,
                );
                return (
                  <Tooltip content={code || ""}>
                    <span className="font-medium text-foreground block truncate max-w-[120px]">
                      {code || "—"}
                    </span>
                  </Tooltip>
                );
              },
            },
            {
              key: "name",
              header: t("Tên linh kiện / Tên hàng"),
              minWidth: 260,
              sortable: true,
              cell: (node: FlatNode) => {
                const itemId = node.line.componentItemId;
                const fallbackLabel = itemId ? itemsMap[itemId] || "" : "";
                const { name } = extractItemCodeAndName(
                  node.line.componentItemCode,
                  node.line.componentItemName,
                  fallbackLabel,
                );

                return (
                  <div
                    className="flex items-center gap-1.5"
                    style={{ paddingLeft: `${node.level * 1.5}rem` }}
                  >
                    {node.subBomId ? (
                      <button
                        type="button"
                        onClick={() =>
                          toggleExpand(node.uniqueId, node.subBomId!)
                        }
                        className="p-0.5 hover:bg-muted rounded text-muted-foreground transition-colors flex items-center justify-center shrink-0"
                      >
                        {node.isLoading ? (
                          <Loader2 className="h-3 w-3 animate-spin text-primary" />
                        ) : (
                          <ChevronRight
                            className={cn(
                              "h-4 w-4 transform transition-transform",
                              node.isExpanded && "rotate-90",
                            )}
                          />
                        )}
                      </button>
                    ) : (
                      <span className="w-5 h-5 flex items-center justify-center text-muted-foreground/30 text-[10px] shrink-0">
                        •
                      </span>
                    )}
                    <div className="flex flex-col min-w-[80px] max-w-[220px]">
                      <Tooltip content={name || t("Linh kiện không xác định")}>
                        <span className="font-medium text-foreground/90 block truncate">
                          {name || t("Linh kiện không xác định")}
                        </span>
                      </Tooltip>
                      {node.isError && (
                        <span className="text-[10px] text-red-500 font-medium mt-0.5">
                          {t("Lỗi tải chi tiết")}
                        </span>
                      )}
                    </div>
                  </div>
                );
              },
            },
            {
              key: "qty",
              header: t("Số lượng"),
              minWidth: 100,
              align: "center",
              sortable: true,
              cell: (node: FlatNode) => (
                <div className="font-semibold text-primary">
                  {parseFloat(node.line.qtyRequired || "0").toLocaleString(
                    "vi-VN",
                  )}
                </div>
              ),
            },
            {
              key: "uom",
              header: t("ĐVT"),
              minWidth: 80,
              align: "center",
              cell: (node: FlatNode) => (
                <span className="text-muted-foreground">{node.line.uom}</span>
              ),
            },
            {
              key: "scrap",
              header: t("Hao hụt"),
              minWidth: 100,
              align: "center",
              cell: (node: FlatNode) => {
                const hasScrap =
                  node.line.scrapRate && parseFloat(node.line.scrapRate) > 0;
                const formattedScrap = hasScrap
                  ? parseFloat(node.line.scrapRate || "0").toLocaleString(
                      "vi-VN",
                    )
                  : "";
                return hasScrap ? (
                  <span className="text-amber-700 bg-amber-50 border border-amber-200/50 px-1.5 py-0.5 rounded-full text-[10px] font-medium whitespace-nowrap">
                    {formattedScrap}%
                  </span>
                ) : (
                  <span className="text-muted-foreground/50">—</span>
                );
              },
            },
            {
              key: "notes",
              header: t("Ghi chú"),
              minWidth: 120,
              cell: (node: FlatNode) => (
                <Tooltip content={node.line.notes || ""}>
                  <span className="text-muted-foreground italic text-[11px] block truncate max-w-[120px]">
                    {node.line.notes || "—"}
                  </span>
                </Tooltip>
              ),
            },
          ]}
          data={filteredAndSorted}
          getRowKey={(node) => node.uniqueId}
          viewOnly={true}
          sortConfig={sortConfig}
          onSort={handleSort}
        />
      </div>
    </div>
  );
}

export function ErpBomPage() {
  const t = useT();
  const canRead = useHasPermission("bom", "read");
  const setGlobalLoading = useUIStore((s) => s.setGlobalLoading);
  const [items, setItems] = useState<ErpBom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerLoading, setDrawerLoading] = useState(false);
  const [editing, setEditing] = useState<ErpBom | null>(null);
  const [viewOnly, setViewOnly] = useState(false);
  const [form, setForm] = useState<BomForm>(emptyForm);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<ErpBom | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [statusTarget, setStatusTarget] = useState<ErpBom | null>(null);
  const [targetAction, setTargetAction] = useState<
    "ACTIVE" | "INACTIVE" | null
  >(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const handleExport = async (item: ErpBom, format: "xlsx" | "csv") => {
    setGlobalLoading(true);
    try {
      const blob = await bomCoreApi.export(item.id, format);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      const extension = format;
      const safeBomCode = (item.bomCode || "BOM").replace(
        /[^a-zA-Z0-9_-]/g,
        "_",
      );
      const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, "");
      link.setAttribute("download", `${safeBomCode}_${timestamp}.${extension}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      toast.error(t("Không thể xuất file"));
    } finally {
      setGlobalLoading(false);
    }
  };

  const [sortBy, setSortBy] = useState<string | undefined>(undefined);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const [itemSearch, setItemSearch] = useState("");

  const {
    data: itemsData,
    fetchNextPage: fetchNextItems,
    isFetchingNextPage: loadingItems,
  } = useBasicMasterInfinite({
    search: itemSearch,
    limit: 50,
    entities: "inventoryItems",
  });

  const { data: uomsData } = useBasicMasterInfinite({
    search: "",
    limit: 100,
    entities: "uoms",
  });

  // Persistent cache: id -> label, survives search-term changes so selected
  // items never lose their labels when the API page no longer includes them.
  const cachedItems = useRef<Record<string, string>>({});

  // Populate cache whenever new API pages arrive
  useEffect(() => {
    if (!itemsData) return;
    itemsData.pages.forEach((p) => {
      (p.items.inventoryItems || []).forEach((i) => {
        cachedItems.current[i.id] = `${i.sku} — ${i.itemName}`;
      });
    });
  }, [itemsData]);

  // Populate cache from editing BOM when it loads (edit/view mode)
  useEffect(() => {
    if (!editing) return;
    if (editing.finishedGoodItemId && editing.finishedGoodItemName) {
      cachedItems.current[editing.finishedGoodItemId] =
        editing.finishedGoodItemName;
    }
    editing.lines?.forEach((line) => {
      if (line.componentItemId && line.componentItemName) {
        cachedItems.current[line.componentItemId] = line.componentItemName;
      }
    });
  }, [editing]);

  const itemOptions = useMemo(() => {
    // Start with current search-result pages
    const map = new Map<string, string>(
      itemsData?.pages.flatMap((p) =>
        (p.items.inventoryItems || []).map(
          (i) => [i.id, `${i.sku} — ${i.itemName}`] as [string, string],
        ),
      ) || [],
    );

    // Ensure the currently selected finished good is always present
    if (form.finishedGoodItemId) {
      if (!map.has(form.finishedGoodItemId)) {
        map.set(
          form.finishedGoodItemId,
          cachedItems.current[form.finishedGoodItemId] ||
            editing?.finishedGoodItemName ||
            t("Thành phẩm hiện tại"),
        );
      }
    }

    // Ensure every selected component line item is always present
    form.lines.forEach((line) => {
      if (line.componentItemId && !map.has(line.componentItemId)) {
        map.set(
          line.componentItemId,
          cachedItems.current[line.componentItemId] || t("Linh kiện hiện tại"),
        );
      }
    });

    return Array.from(map.entries()).map(([value, label]) => ({
      value,
      label,
    }));
  }, [itemsData, form.finishedGoodItemId, form.lines, editing, t]);

  const itemUomMap = useMemo(() => {
    const map = new Map<string, string>();
    itemsData?.pages.forEach((p) => {
      (p.items.inventoryItems || []).forEach((i) => {
        if (i.uom?.name) {
          map.set(i.id, i.uom.name);
        }
      });
    });
    return map;
  }, [itemsData]);

  const uomOptions = useMemo(() => {
    const map = new Map<string, string>();
    uomsData?.pages.forEach((p) => {
      (p.items.uoms || []).forEach((u) => {
        map.set(u.id, u.name);
      });
    });
    return Array.from(map.values()).map((name) => ({
      value: name,
      label: name,
    }));
  }, [uomsData]);

  const BOM_STATUS_OPTIONS = [
    { value: "ACTIVE", label: t("Đang áp dụng") },
    { value: "INACTIVE", label: t("Ngừng áp dụng") },
    { value: "DRAFT", label: t("Bản nháp") },
  ];

  const filterConfig: FilterPanelConfig = useMemo(
    () => ({
      search: true,
      status: {
        options: BOM_STATUS_OPTIONS,
        placeholder: t("Tất cả trạng thái"),
      },
      custom: [
        {
          key: "finishedGoodItemId",
          label: t("Thành phẩm"),
          placeholder: t("Tất cả thành phẩm"),
          options: itemOptions,
          type: "combobox" as const,
          onSearch: setItemSearch,
          onLoadMore: fetchNextItems,
          loading: loadingItems,
        },
      ],
    }),
    [itemOptions, fetchNextItems, loadingItems],
  );
  const filter = useFilterPanel(filterConfig);

  // Populate cache from filter-panel selected finished-good item
  // (done after filter is declared to avoid circular dependency with itemOptions)
  useEffect(() => {
    const filterFgId = filter.state.custom?.finishedGoodItemId as
      | string
      | undefined;
    if (filterFgId && itemOptions.some((o) => o.value === filterFgId)) {
      const label = itemOptions.find((o) => o.value === filterFgId)?.label;
      if (label) cachedItems.current[filterFgId] = label;
    }
  }, [filter.state.custom?.finishedGoodItemId, itemOptions]);

  const loadBoms = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await bomCoreApi.list({
        page,
        pageSize,
        search: filter.state.search.trim() || undefined,
        sort: sortBy
          ? [`${sortOrder === "desc" ? "-" : ""}${sortBy}`]
          : undefined,
        finishedGoodItemId:
          filter.state.custom?.finishedGoodItemId || undefined,
      });
      let nextItems = res.items;
      if (filter.state.status) {
        nextItems = nextItems.filter(
          (item) => (item.status || "") === filter.state.status,
        );
      }
      if (filter.state.custom?.finishedGoodItemId) {
        nextItems = nextItems.filter(
          (item) =>
            item.finishedGoodItemId === filter.state.custom?.finishedGoodItemId,
        );
      }
      setItems(nextItems);
      setTotal(nextItems.length);
      setTotalPages(Math.ceil(nextItems.length / pageSize));
    } catch (e) {
      setError(e instanceof Error ? e.message : t("Không thể tải BOM"));
    } finally {
      setLoading(false);
    }
  }, [
    filter.state.search,
    filter.state.status,
    filter.state.custom?.finishedGoodItemId,
    page,
    pageSize,
    sortBy,
    sortOrder,
  ]);

  const [expandedBomIds, setExpandedBomIds] = useState<Record<string, boolean>>(
    {},
  );
  const [allBoms, setAllBoms] = useState<ErpBom[]>([]);

  const loadAllBoms = useCallback(async () => {
    try {
      const res = await bomCoreApi.list({ page: 1, pageSize: 1000 });
      setAllBoms(res.items);
    } catch (e) {
      console.error(t("Không thể tải danh sách BOM cho cấu trúc cây"), e);
    }
  }, []);

  useEffect(() => {
    void loadBoms();
  }, [loadBoms]);

  useEffect(() => {
    void loadAllBoms();
  }, [loadAllBoms]);

  const fgToBomMap = useMemo(() => {
    const map: Record<string, ErpBom> = {};
    allBoms.forEach((bom) => {
      if (bom.finishedGoodItemId) {
        map[bom.finishedGoodItemId] = bom;
      }
    });
    return map;
  }, [allBoms]);

  const itemsMap = useMemo(() => {
    const map: Record<string, string> = {};
    itemOptions.forEach((opt) => {
      map[opt.value] = opt.label;
    });
    return map;
  }, [itemOptions]);

  const handleSort = (key: string) => {
    if (sortBy === key) {
      if (sortOrder === "asc") setSortOrder("desc");
      else {
        setSortBy(undefined);
        setSortOrder("asc");
      }
    } else {
      setSortBy(key);
      setSortOrder("asc");
    }
    setPage(1);
  };

  function toggleExpand(id: string) {
    setExpandedBomIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  }

  function resetForm() {
    setForm(emptyForm());
    setEditing(null);
    setViewOnly(false);
    setSaveError(null);
  }

  function closeDrawer() {
    setDrawerOpen(false);
    resetForm();
  }

  function openCreate() {
    resetForm();
    setDrawerOpen(true);
  }

  async function openView(item: ErpBom) {
    setSaveError(null);
    setViewOnly(true);
    setDrawerLoading(true);
    setDrawerOpen(true);
    try {
      const detail = await bomCoreApi.get(item.id);
      setEditing(detail);
      setForm(buildForm(detail));
    } catch (e) {
      setError(
        e instanceof Error ? e.message : t("Không thể tải chi tiết BOM"),
      );
    } finally {
      setDrawerLoading(false);
    }
  }

  async function handleClone(item: ErpBom) {
    setSaveError(null);
    setViewOnly(false);
    setDrawerLoading(true);
    setDrawerOpen(true);
    setEditing(null);
    try {
      const detail = await bomCoreApi.get(item.id);
      const clonedForm = buildForm(detail);
      clonedForm.bomCode = `${clonedForm.bomCode}-COPY`;
      clonedForm.bomName = `${clonedForm.bomName} (Copy)`;
      clonedForm.status = "DRAFT";
      setForm(clonedForm);
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : t("Không thể tải chi tiết BOM để nhân bản"),
      );
    } finally {
      setDrawerLoading(false);
    }
  }

  function updateLine(index: number, patch: Partial<BomLineForm>) {
    setForm((prev) => ({
      ...prev,
      lines: prev.lines.map((line, i) =>
        i === index ? { ...line, ...patch } : line,
      ),
    }));
  }

  function addLine() {
    setForm((prev) => ({ ...prev, lines: [...prev.lines, emptyLine()] }));
  }

  function removeLine(index: number) {
    setForm((prev) => ({
      ...prev,
      lines:
        prev.lines.length === 1
          ? [emptyLine()]
          : prev.lines.filter((_, i) => i !== index),
    }));
  }

  async function handleSave(statusTarget?: string) {
    if (viewOnly) {
      closeDrawer();
      return;
    }

    if (!form.bomCode.trim() || !form.bomName.trim()) {
      setSaveError(t("Mã BOM và tên BOM là bắt buộc"));
      return;
    }

    if (
      !form.lines.length ||
      form.lines.some((line) => !line.qtyRequired.trim())
    ) {
      setSaveError(t("Mỗi dòng BOM phải có số lượng hợp lệ"));
      return;
    }

    setSaving(true);
    setSaveError(null);
    try {
      const payload = toPayload(form);
      if (statusTarget) {
        payload.status = statusTarget;
      }
      if (editing) {
        await bomCoreApi.update(editing.id, payload);
      } else {
        await bomCoreApi.create(payload);
      }
      closeDrawer();
      void loadAllBoms();
      if (!editing && page !== 1) setPage(1);
      else await loadBoms();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      setSaveError(
        e?.response?.data?.message || e?.message || t("Không thể lưu BOM"),
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await bomCoreApi.remove(deleteTarget.id);
      setDeleteTarget(null);
      await loadBoms();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      setError(
        e?.response?.data?.message || e?.message || t("Không thể xóa BOM"),
      );
    } finally {
      setDeleting(false);
    }
  }

  async function handleConfirmStatusChange() {
    if (!statusTarget || !targetAction) return;
    setUpdatingStatus(true);
    try {
      await bomCoreApi.update(statusTarget.id, { status: targetAction });
      setStatusTarget(null);
      setTargetAction(null);
      await loadBoms();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      setError(
        e?.response?.data?.message ||
          e?.message ||
          t("Không thể thay đổi trạng thái BOM"),
      );
    } finally {
      setUpdatingStatus(false);
    }
  }

  const columns: DataTableColumn<ErpBom>[] = [
    {
      key: "bomCode",
      header: t("Mã BOM"),
      sortable: true,
      sortKey: "bomCode",
      cell: (item) => (
        <div className="w-full">
          <Tooltip content={item.bomCode}>
            <span className="font-semibold text-primary block truncate max-w-[120px]">
              {item.bomCode}
            </span>
          </Tooltip>
        </div>
      ),
      skeletonClassName: "w-24",
    },
    {
      key: "__expand",
      header: "",
      className:
        "w-[40px] min-w-[40px] max-w-[40px] px-2 text-center align-middle",
      headerClassName: "w-[40px] min-w-[40px] max-w-[40px] px-2 text-center",
      size: 40,
      enableResizing: false,
      cell: (item) => {
        const isExpanded = !!expandedBomIds[item.id];
        return (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleExpand(item.id);
            }}
            className="focus:outline-none flex items-center justify-center w-full"
          >
            <ChevronRight
              className={cn(
                "h-4 w-4 transition-transform text-[color:var(--muted-fg)] shrink-0",
                isExpanded && "rotate-90",
              )}
            />
          </button>
        );
      },
    },
    {
      key: "bomName",
      header: t("Tên BOM"),
      sortable: true,
      sortKey: "bomName",
      cell: (item) => (
        <div className="w-full overflow-hidden flex">
          <Tooltip content={item.bomName}>
            <span className="block truncate max-w-[160px]">{item.bomName}</span>
          </Tooltip>
        </div>
      ),
      skeletonClassName: "w-40",
    },
    {
      key: "finishedGoodItemName",
      header: t("Thành phẩm"),
      sortable: true,
      sortKey: "finishedGoodItemName",
      cell: (item) => {
        const name =
          item.finishedGoodItemName ||
          (item.finishedGoodItemId ? itemsMap[item.finishedGoodItemId] : "—");
        return (
          <div className="flex flex-col min-w-[80px] max-w-[200px]">
            <Tooltip content={name}>
              <span className="truncate font-medium text-foreground block">
                {name}
              </span>
            </Tooltip>
            {item.notes && (
              <Tooltip content={item.notes}>
                <span className="italic text-muted-foreground text-[11px] mt-0.5 truncate block">
                  ({item.notes})
                </span>
              </Tooltip>
            )}
          </div>
        );
      },
      skeletonClassName: "w-36",
    },
    {
      key: "version",
      header: "Version",
      sortable: true,
      sortKey: "version",
      cell: (item) => <div className="w-full">{item.version || "—"}</div>,
      skeletonClassName: "w-16",
    },
    {
      key: "status",
      header: t("Trạng thái"),
      sortable: true,
      sortKey: "status",
      cell: (item) => {
        const statusMap = {
          ACTIVE: {
            label: t("Đang áp dụng"),
            cls: "bg-green-100 text-green-700",
          },
          INACTIVE: {
            label: t("Ngừng áp dụng"),
            cls: "bg-red-100 text-red-700",
          },
          DRAFT: { label: t("Bản nháp"), cls: "bg-gray-100 text-gray-700" },
        };
        const s =
          statusMap[item.status as keyof typeof statusMap] || statusMap.DRAFT;
        return (
          <div className="w-full">
            <span
              className={`px-2 py-0.5 rounded-full text-[11px] font-medium whitespace-nowrap inline-block ${s.cls}`}
            >
              {s.label}
            </span>
          </div>
        );
      },
      skeletonClassName: "w-20",
    },
    {
      key: "effectiveFrom",
      header: t("Hiệu lực từ"),
      sortable: true,
      sortKey: "effectiveFrom",
      cell: (item) => (
        <div className="w-full">{fmtDate(item.effectiveFrom)}</div>
      ),
      skeletonClassName: "w-20",
    },
    {
      key: "effectiveTo",
      header: t("Hiệu lực đến"),
      sortable: true,
      sortKey: "effectiveTo",
      cell: (item) => <div className="w-full">{fmtDate(item.effectiveTo)}</div>,
      skeletonClassName: "w-20",
    },
  ];

  if (!canRead) return <Forbidden />;

  return (
    <SpreadsheetPageTemplate
      title="BOM"
      desc={t(
        "Quản lý định mức vật tư (Bill of Materials) cho các thành phẩm.",
      )}
      icon={<Network className="h-4 w-4" />}
      tableId="erp-bom-table"
      items={items}
      columns={columns}
      getRowKey={(item) => item.id}
      loading={loading}
      error={error}
      emptyLabel={t("Chưa có BOM")}
      minWidth={980}
      loadingRows={6}
      page={page}
      pageSize={pageSize}
      total={total}
      totalPages={totalPages}
      onPage={setPage}
      onPageSize={(value) => {
        setPage(1);
        setPageSize(value);
      }}
      onRefresh={() => void loadBoms()}
      onCreate={openCreate}
      filterConfig={filterConfig}
      filter={filter}
      renderSubRow={(item) => (
        <BomTree bomId={item.id} fgToBomMap={fgToBomMap} itemsMap={itemsMap} />
      )}
      expandedRowKeys={Object.keys(expandedBomIds).filter(
        (key) => expandedBomIds[key],
      )}
      sortArray={
        sortBy ? [`${sortOrder === "desc" ? "-" : ""}${sortBy}`] : undefined
      }
      onSort={handleSort}
      rowActions={(item) => [
        {
          groupLabel: t("Tra cứu"),
          items: [
            {
              label: t("Chi tiết"),
              onClick: () => void openView(item),
              icon: <Eye className="h-[13px] w-[13px]" />,
            },
            {
              label: t("common.exportExcel"),
              onClick: () => void handleExport(item, "xlsx"),
              icon: <FileSpreadsheet className="h-[13px] w-[13px]" />,
            },
            {
              label: t("common.exportCsv"),
              onClick: () => void handleExport(item, "csv"),
              icon: <FileText className="h-[13px] w-[13px]" />,
            },
          ],
        },
        {
          groupLabel: t("Thao tác"),
          items: [
            {
              label: t("common.clone"),
              onClick: () => void handleClone(item),
              icon: <Copy className="h-[13px] w-[13px]" />,
            },
            {
              label: t("common.activate"),
              onClick: () => {
                setStatusTarget(item);
                setTargetAction("ACTIVE");
              },
              icon: <CheckCircle className="h-[13px] w-[13px]" />,
              hidden: item.status !== "INACTIVE",
            },
            {
              label: t("common.inactivate"),
              onClick: () => {
                setStatusTarget(item);
                setTargetAction("INACTIVE");
              },
              icon: <Ban className="h-[13px] w-[13px]" />,
              variant: "danger",
              hidden: item.status !== "ACTIVE",
            },
            {
              label: t("Xóa"),
              onClick: () => setDeleteTarget(item),
              icon: <Trash2 className="h-[13px] w-[13px]" />,
              variant: "danger",
              hidden: item.status === "ACTIVE",
            },
          ],
        },
      ]}
    >
      <ConfirmModal
        open={!!deleteTarget}
        title={t("Xác nhận xóa")}
        message={
          deleteTarget
            ? t(
                `Xóa BOM "${deleteTarget.bomCode}"? Hành động này không thể hoàn tác.`,
              )
            : ""
        }
        confirmLabel={t("Xóa")}
        cancelLabel={t("Hủy")}
        onConfirm={() => void handleConfirmDelete()}
        onCancel={() => {
          if (!deleting) setDeleteTarget(null);
        }}
        loading={deleting}
        danger
      />

      <ConfirmModal
        open={!!statusTarget}
        title={
          targetAction === "ACTIVE"
            ? t("Xác nhận áp dụng")
            : t("Xác nhận ngừng áp dụng")
        }
        message={
          statusTarget
            ? targetAction === "ACTIVE"
              ? t(`Áp dụng BOM "${statusTarget.bomCode}"?`)
              : t(`Ngừng áp dụng BOM "${statusTarget.bomCode}"?`)
            : ""
        }
        confirmLabel={t("Đồng ý")}
        cancelLabel={t("Hủy")}
        onConfirm={() => void handleConfirmStatusChange()}
        onCancel={() => {
          if (!updatingStatus) {
            setStatusTarget(null);
            setTargetAction(null);
          }
        }}
        loading={updatingStatus}
        danger={targetAction === "INACTIVE"}
      />

      <BomFormDrawer
        open={drawerOpen}
        onClose={closeDrawer}
        onToggleEdit={() => setViewOnly(false)}
        mode={viewOnly ? "view" : editing ? "edit" : "create"}
        editing={editing}
        form={form}
        setForm={setForm}
        drawerLoading={drawerLoading}
        saving={saving}
        saveError={saveError}
        handleSave={handleSave}
        itemOptions={itemOptions}
        setItemSearch={setItemSearch}
        fetchNextItems={fetchNextItems}
        loadingItems={loadingItems}
        addLine={addLine}
        removeLine={removeLine}
        updateLine={updateLine}
        itemUomMap={itemUomMap}
        uomOptions={uomOptions}
        onExport={(format) => editing && handleExport(editing, format)}
      />
    </SpreadsheetPageTemplate>
  );
}
