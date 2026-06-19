import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus, Trash2, ChevronRight, Network, Loader2 } from "lucide-react";
import { PageLayout } from "@/shared/components/PageLayout";
import { DocumentLineTable } from "@/shared/components/DocumentLineTable";
import { SearchInput } from "@/shared/components/SearchInput";
import { DataTable, type DataTableColumn } from "@/shared/components/DataTable";
import { ActionDropdown } from "@/shared/components/ActionDropdown";
import { TableActionGroup } from "@/shared/components/TableActionGroup";
import { FilterPanel } from "@/shared/components/FilterPanel";
import { ConfirmModal } from "@/shared/components/ConfirmModal";
import {
  useFilterPanel,
  type FilterPanelConfig,
} from "@/shared/hooks/useFilterPanel";
import {
  DrawerAction,
  DrawerField,
  DrawerModal,
  DrawerSection,
  inputCls,
} from "@/shared/components/DrawerModal";
import { Skeleton } from "@/shared/components/Skeleton";
import { Combobox } from "@/shared/components/Combobox";
import { DatePicker } from "@/shared/components/DatePicker";
import {
  bomCoreApi,
  type CreateBomPayload,
  type ErpBom,
  type ErpBomLine,
} from "@/modules/bom-core/api/bomCoreApi";
import { useHasPermission } from "@/shared/hooks/useHasPermission";
import { Forbidden } from "@/pages/Forbidden";
import { useBasicMasterInfinite } from "@/modules/basic-masters/hooks/useBasicMasterInfinite";
import { cn } from "@/shared/utils";
import { useT } from "@/core/i18n";
import { extractItemCodeAndName } from "@/shared/utils/format";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const ITEM_LOOKUP_LIMIT = 200;

interface BomLineForm {
  componentItemId: string;
  qtyRequired: string;
  uom: string;
  scrapRate: string;
  notes: string;
}

interface BomForm {
  bomCode: string;
  bomName: string;
  finishedGoodItemId: string;
  version: string;
  status: string;
  effectiveFrom: string;
  effectiveTo: string;
  notes: string;
  lines: BomLineForm[];
}

const emptyLine = (): BomLineForm => ({
  componentItemId: "",
  qtyRequired: "1",
  uom: "PCS",
  scrapRate: "0",
  notes: "",
});

const emptyForm = (): BomForm => ({
  bomCode: "",
  bomName: "",
  finishedGoodItemId: "",
  version: "v1",
  status: "ACTIVE",
  effectiveFrom: "",
  effectiveTo: "",
  notes: "",
  lines: [emptyLine()],
});

function fmtDate(value?: string | null) {
  if (!value) return "—";
  return value.slice(0, 10);
}

function buildForm(bom: ErpBom): BomForm {
  return {
    bomCode: bom.bomCode ?? "",
    bomName: bom.bomName ?? "",
    finishedGoodItemId: bom.finishedGoodItemId ?? "",
    version: bom.version ?? "v1",
    status: bom.status ?? "ACTIVE",
    effectiveFrom: bom.effectiveFrom ? bom.effectiveFrom.slice(0, 10) : "",
    effectiveTo: bom.effectiveTo ? bom.effectiveTo.slice(0, 10) : "",
    notes: bom.notes ?? "",
    lines: bom.lines?.length
      ? bom.lines.map((line) => ({
          componentItemId: line.componentItemId ?? "",
          qtyRequired: line.qtyRequired ?? "1",
          uom: line.uom ?? "PCS",
          scrapRate: line.scrapRate ?? "0",
          notes: line.notes ?? "",
        }))
      : [emptyLine()],
  };
}

function toPayload(form: BomForm): CreateBomPayload {
  return {
    bomCode: form.bomCode.trim(),
    bomName: form.bomName.trim(),
    finishedGoodItemId: form.finishedGoodItemId || undefined,
    version: form.version.trim() || "v1",
    status: form.status || "ACTIVE",
    effectiveFrom: form.effectiveFrom || undefined,
    effectiveTo: form.effectiveTo || undefined,
    notes: form.notes.trim() || undefined,
    lines: form.lines.map((line) => ({
      componentItemId: line.componentItemId || undefined,
      qtyRequired: line.qtyRequired,
      uom: line.uom.trim() || "PCS",
      scrapRate: line.scrapRate || undefined,
      notes: line.notes.trim() || undefined,
    })),
  };
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
      <div className="w-full overflow-y-auto max-h-[300px]">
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
                  <span className="font-medium text-foreground">
                    {code || "—"}
                  </span>
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
                    <div className="flex flex-col min-w-0">
                      <span className="font-medium text-foreground/90">
                        {name || t("Linh kiện không xác định")}
                      </span>
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
                <span className="text-muted-foreground italic text-[11px]">
                  {node.line.notes || "—"}
                </span>
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

  const itemOptions = useMemo(() => {
    const opts =
      itemsData?.pages.flatMap((p) =>
        (p.items.inventoryItems || []).map((i) => ({
          value: i.id,
          label: `${i.sku} — ${i.itemName}`,
        })),
      ) || [];

    if (editing) {
      if (
        editing.finishedGoodItemId &&
        !opts.some((o) => o.value === editing.finishedGoodItemId)
      ) {
        opts.push({
          value: editing.finishedGoodItemId,
          label: editing.finishedGoodItemName || t("Thành phẩm hiện tại"),
        });
      }

      editing.lines?.forEach((line) => {
        if (
          line.componentItemId &&
          !opts.some((o) => o.value === line.componentItemId)
        ) {
          opts.push({
            value: line.componentItemId,
            label: line.componentItemName || t("Linh kiện hiện tại"),
          });
        }
      });
    }

    return opts;
  }, [itemsData, editing, t]);

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

  async function openEdit(item: ErpBom) {
    setSaveError(null);
    setViewOnly(false);
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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

  async function handleSave() {
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

  const columns: DataTableColumn<ErpBom>[] = [
    {
      key: "stt",
      header: <div className="text-center">#</div>,
      className: "text-center font-medium text-muted-foreground",
      headerClassName: "w-[48px] text-center",
      cell: (_, index) => index,
    },
    {
      key: "bomCode",
      header: t("Mã BOM"),
      sortable: true,
      sortKey: "bomCode",
      cell: (item) => {
        const isExpanded = !!expandedBomIds[item.id];
        return (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleExpand(item.id);
            }}
            className="font-medium text-primary hover:underline focus:outline-none flex items-center gap-1.5 text-left"
          >
            <span className="font-semibold text-primary">{item.bomCode}</span>
            <ChevronRight
              className={cn(
                "h-3.5 w-3.5 transition-transform text-muted-foreground",
                isExpanded && "rotate-90 text-primary",
              )}
            />
          </button>
        );
      },
      skeletonClassName: "w-24",
    },
    {
      key: "bomName",
      header: t("Tên BOM"),
      sortable: true,
      sortKey: "bomName",
      cell: (item) => item.bomName,
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
          <div className="flex flex-col min-w-0">
            <span className="truncate font-medium text-foreground" title={name}>
              {name}
            </span>
            {item.notes && (
              <span
                className="italic text-muted-foreground text-[11px] mt-0.5 truncate"
                title={item.notes}
              >
                ({item.notes})
              </span>
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
      cell: (item) => item.version || "—",
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
          <span
            className={`px-2 py-0.5 rounded-full text-[11px] font-medium whitespace-nowrap inline-block ${s.cls}`}
          >
            {s.label}
          </span>
        );
      },
      skeletonClassName: "w-20",
    },
    {
      key: "effectiveFrom",
      header: t("Hiệu lực từ"),
      sortable: true,
      sortKey: "effectiveFrom",
      cell: (item) => fmtDate(item.effectiveFrom),
      skeletonClassName: "w-20",
    },
    {
      key: "effectiveTo",
      header: t("Hiệu lực đến"),
      sortable: true,
      sortKey: "effectiveTo",
      cell: (item) => fmtDate(item.effectiveTo),
      skeletonClassName: "w-20",
    },
  ];

  const drawerActions: DrawerAction[] = [
    {
      label: t("Hủy"),
      onClick: closeDrawer,
      variant: "outline",
      disabled: saving,
    },
    {
      label: viewOnly ? t("Đóng") : editing ? t("Cập nhật") : t("Tạo mới"),
      onClick: viewOnly ? closeDrawer : () => void handleSave(),
      primary: true,
      disabled: saving || viewOnly,
    },
  ];

  if (!canRead) return <Forbidden />;

  return (
    <PageLayout
      title="BOM"
      desc={t(
        "Quản lý định mức vật tư (Bill of Materials) cho các thành phẩm.",
      )}
      icon={<Network className="h-4 w-4" />}
      actions={
        <TableActionGroup
          onRefresh={() => void loadBoms()}
          loading={loading}
          onFilterToggle={filter.togglePanel}
          activeFilterCount={filter.activeFilterCount}
          onCreate={openCreate}
        />
      }
    >
      <div className="flex items-start">
        <div className="min-w-0 flex-1">
          <DataTable
            items={items}
            columns={columns}
            getRowKey={(item) => item.id}
            loading={loading}
            error={error}
            emptyLabel={t("Chưa có BOM")}
            minWidth={980}
            loadingRows={6}
            onRowClick={(item) => void openEdit(item)}
            actionsColumn={{
              header: "",
              className: "w-[48px]",
              cell: (item) => (
                <ActionDropdown
                  items={[
                    {
                      label: t("Xóa"),
                      onClick: () => setDeleteTarget(item),
                      icon: <Trash2 className="h-3.5 w-3.5" />,
                      variant: "danger",
                      hidden: item.status === "ACTIVE",
                    },
                  ]}
                />
              ),
            }}
            page={page}
            pageSize={pageSize}
            total={total}
            totalPages={totalPages}
            onPage={setPage}
            onPageSize={(value) => {
              setPage(1);
              setPageSize(value);
            }}
            renderSubRow={(item) => (
              <BomTree
                bomId={item.id}
                fgToBomMap={fgToBomMap}
                itemsMap={itemsMap}
              />
            )}
            expandedRowKeys={Object.keys(expandedBomIds).filter(
              (key) => expandedBomIds[key],
            )}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSort={handleSort}
          />
        </div>
        <FilterPanel config={filterConfig} filter={filter} />
      </div>

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

      <DrawerModal
        open={drawerOpen}
        onClose={closeDrawer}
        title={
          viewOnly
            ? t("Xem BOM")
            : editing
              ? t("Cập nhật BOM")
              : t("Tạo BOM mới")
        }
        subtitle={editing ? editing.bomCode : t("Định mức nguyên vật liệu")}
        actions={drawerActions}
        panelClassName="min-[1024px]:min-w-[1100px] min-[1280px]:min-w-[1280px]"
      >
        {saveError && (
          <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
            {saveError}
          </div>
        )}

        {drawerLoading ? (
          <div className="flex flex-col xl:flex-row gap-6 items-start">
            <div className="flex-1 min-w-0 order-2 xl:order-1 space-y-4">
              <DrawerSection title={t("Định mức nguyên vật liệu")}>
                <div className="space-y-3">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
              </DrawerSection>
            </div>
            <div className="shrink-0 order-1 xl:order-2 w-full xl:w-[360px] space-y-4">
              <DrawerSection title={t("Thông tin chung")}>
                <div className="flex flex-col gap-3">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </DrawerSection>
            </div>
          </div>
        ) : (
          <div className="flex flex-col xl:flex-row gap-6 items-start">
            <div className="flex-1 min-w-0 order-2 xl:order-1">
              <DrawerSection title={t("Định mức nguyên vật liệu")}>
                {!viewOnly && !editing && (
                  <div className="mb-3 flex justify-end">
                    <button
                      type="button"
                      onClick={addLine}
                      className="inline-flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium hover:bg-muted"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      {t("Thêm dòng")}
                    </button>
                  </div>
                )}
                <div className="space-y-3">
                  {form.lines.map((line, index) => (
                    <div
                      key={`${index}-${line.componentItemId}`}
                      className="rounded-xl border border-border bg-muted/20 p-3"
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <div className="text-xs font-semibold text-muted-foreground">
                          {t("NVL")} {index + 1}
                        </div>
                        {!viewOnly && !editing && (
                          <button
                            type="button"
                            onClick={() => removeLine(index)}
                            className="text-xs font-medium text-red-600 hover:text-red-700"
                          >
                            {t("Xóa dòng")}
                          </button>
                        )}
                      </div>

                      <div className="flex flex-nowrap overflow-x-auto gap-3 pb-2 scrollbar-thin">
                        <div className="min-w-[240px] flex-[2]">
                          <DrawerField label={t("Linh kiện")} required>
                            <Combobox
                              value={line.componentItemId}
                              readOnly={viewOnly || !!editing}
                              onChange={(value) =>
                                updateLine(index, { componentItemId: value })
                              }
                              options={itemOptions}
                              placeholder={t("Chọn linh kiện")}
                              searchPlaceholder={t("Tìm SKU / tên linh kiện")}
                              onSearch={setItemSearch}
                              onScrollBottom={fetchNextItems}
                              loading={loadingItems}
                            />
                          </DrawerField>
                        </div>
                        <div className="min-w-[90px] flex-1">
                          <DrawerField label={t("Số lượng")} required>
                            <input
                              value={line.qtyRequired}
                              readOnly={viewOnly || !!editing}
                              onChange={(e) =>
                                updateLine(index, {
                                  qtyRequired: e.target.value,
                                })
                              }
                              className={inputCls}
                            />
                          </DrawerField>
                        </div>
                        <div className="min-w-[80px] flex-1">
                          <DrawerField label={t("ĐVT")}>
                            <input
                              value={line.uom}
                              readOnly={viewOnly || !!editing}
                              onChange={(e) =>
                                updateLine(index, { uom: e.target.value })
                              }
                              className={inputCls}
                            />
                          </DrawerField>
                        </div>
                        <div className="min-w-[95px] flex-1">
                          <DrawerField label={t("Tỷ lệ hao hụt")}>
                            <input
                              value={line.scrapRate}
                              readOnly={viewOnly || !!editing}
                              onChange={(e) =>
                                updateLine(index, { scrapRate: e.target.value })
                              }
                              className={inputCls}
                            />
                          </DrawerField>
                        </div>
                      </div>

                      <div className="mt-2">
                        <DrawerField label={t("Ghi chú dòng")}>
                          <textarea
                            value={line.notes}
                            readOnly={viewOnly}
                            onChange={(e) =>
                              updateLine(index, { notes: e.target.value })
                            }
                            className={`${inputCls} min-h-[44px] py-1.5 resize-y`}
                          />
                        </DrawerField>
                      </div>
                    </div>
                  ))}
                </div>
              </DrawerSection>
            </div>

            <div className="xl:w-[280px] w-full shrink-0 order-1 xl:order-2">
              <DrawerSection title={t("Thông tin chung")}>
                <div className="flex flex-col gap-3">
                  <DrawerField label={t("Mã BOM")} required>
                    <input
                      value={form.bomCode}
                      readOnly={viewOnly || !!editing}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          bomCode: e.target.value,
                        }))
                      }
                      className={inputCls}
                    />
                  </DrawerField>
                  <DrawerField label={t("Version")} required>
                    <input
                      value={form.version}
                      readOnly={viewOnly || !!editing}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          version: e.target.value,
                        }))
                      }
                      className={inputCls}
                    />
                  </DrawerField>
                  <DrawerField label={t("Tên BOM")} required>
                    <input
                      value={form.bomName}
                      readOnly={viewOnly || !!editing}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          bomName: e.target.value,
                        }))
                      }
                      className={inputCls}
                    />
                  </DrawerField>
                  <DrawerField label={t("Thành phẩm")}>
                    <Combobox
                      value={form.finishedGoodItemId}
                      readOnly={viewOnly || !!editing}
                      onChange={(value) =>
                        setForm((prev) => ({
                          ...prev,
                          finishedGoodItemId: value,
                        }))
                      }
                      options={itemOptions}
                      placeholder={t("Chọn thành phẩm")}
                      searchPlaceholder={t("Tìm SKU / tên thành phẩm")}
                      onSearch={setItemSearch}
                      onScrollBottom={fetchNextItems}
                      loading={loadingItems}
                      allowClear
                    />
                  </DrawerField>
                  <DrawerField label={t("Hiệu lực từ")}>
                    <DatePicker
                      value={form.effectiveFrom}
                      disabled={viewOnly}
                      onChange={(value) =>
                        setForm((prev) => ({
                          ...prev,
                          effectiveFrom: value,
                        }))
                      }
                      className="w-full"
                      placeholder="DD/MM/YYYY"
                    />
                  </DrawerField>
                  <DrawerField label={t("Hiệu lực đến")}>
                    <DatePicker
                      value={form.effectiveTo}
                      disabled={viewOnly}
                      onChange={(value) =>
                        setForm((prev) => ({
                          ...prev,
                          effectiveTo: value,
                        }))
                      }
                      className="w-full"
                      placeholder="DD/MM/YYYY"
                    />
                  </DrawerField>
                  <DrawerField label={t("Trạng thái")}>
                    <Combobox
                      value={form.status}
                      readOnly={viewOnly}
                      allowClear={false}
                      onChange={(value) =>
                        setForm((prev) => ({
                          ...prev,
                          status: value || "ACTIVE",
                        }))
                      }
                      options={[
                        { value: "ACTIVE", label: t("Đang áp dụng") },
                        { value: "INACTIVE", label: t("Ngừng áp dụng") },
                        { value: "DRAFT", label: t("Bản nháp") },
                      ]}
                    />
                  </DrawerField>
                  <DrawerField label={t("Ghi chú")}>
                    <textarea
                      value={form.notes}
                      readOnly={viewOnly}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, notes: e.target.value }))
                      }
                      className={`${inputCls} min-h-[88px] resize-y`}
                    />
                  </DrawerField>
                </div>
              </DrawerSection>
            </div>
          </div>
        )}
      </DrawerModal>
    </PageLayout>
  );
}
