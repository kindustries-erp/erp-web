/**
 * ErpWarehousePage — unified warehouse voucher list.
 * Shows both Goods Receipts (Nhập kho) and Goods Issues (Xuất kho) in one table.
 * Filter tabs: Tất cả / Nhập kho / Xuất kho
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Boxes,
  PackageOpen,
  PackagePlus,
  PackageMinus,
  Pencil,
  Plus,
  ReceiptText,
  Trash2,
  XCircle,
  RefreshCcw,
  ClipboardList,
  Eye,
  BookCheck,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { cn } from "@/shared/utils";
import { Button } from "@/shared/components/ui/Button";
import { PageLayout } from "@/shared/components/PageLayout";
import { useHasPermission } from "@/shared/hooks/useHasPermission";
import { Forbidden } from "@/pages/Forbidden";
import { DataTable, type DataTableColumn } from "@/shared/components/DataTable";
import { ActionDropdown } from "@/shared/components/ActionDropdown";
import { FilterButton, FilterPanel } from "@/shared/components/FilterPanel";
import {
  type FilterPanelConfig,
  type FilterPanelReturn,
} from "@/shared/hooks/useFilterPanel";

import {
  type DrawerAction,
  DrawerField,
  DrawerModal,
  DrawerSection,
  inputCls,
} from "@/shared/components/DrawerModal";
import { Skeleton } from "@/shared/components/Skeleton";
import { Combobox } from "@/shared/components/Combobox";
import { ConfirmModal } from "@/shared/components/ConfirmModal";
import {
  goodsReceiptsCoreApi,
  type CreateGrPayload,
  type ErpGoodsReceipt,
} from "@/modules/goods-receipts-core/api/goodsReceiptsCoreApi";
import {
  goodsIssuesCoreApi,
  type CreateGiPayload,
  type ErpGoodsIssue,
} from "@/modules/goods-issues-core/api/goodsIssuesCoreApi";
import {
  purchaseOrdersCoreApi,
  type ErpPurchaseOrder,
} from "@/modules/purchase-orders-core/api/purchaseOrdersCoreApi";
import {
  inventoryCoreApi,
  type ErpInventoryItem,
} from "@/modules/inventory-core/api/inventoryCoreApi";
import { manufacturingApi } from "@/modules/manufacturing/api/manufacturingApi";
import { useBasicMasterInfinite } from "@/modules/basic-masters/hooks/useBasicMasterInfinite";
import { useUIStore } from "@/core/config/uiStore";
import {
  useWarehouseIssuesQuery,
  useWarehouseReceiptsQuery,
} from "@/modules/inventory-core/hooks/useWarehouseVoucherQueries";
import {
  createWarehouseIssuesKey,
  createWarehouseReceiptsKey,
} from "@/shared/lib/queryKeys";

const LOOKUP_LIMIT = 200;
const ISSUE_TYPE_OPTIONS = [
  { value: "SALE", label: "SALE — Xuất bán" },
  { value: "OTHER", label: "OTHER — Xuất khác" },
];
const STATUS_OPTIONS = [
  { value: "DRAFT", label: "DRAFT" },
  { value: "POSTED", label: "POSTED" },
];

// ─── Combined row type ────────────────────────────────────────────────────────

type VoucherKind = "receipt" | "issue";

interface WarehouseRow {
  kind: VoucherKind;
  id: string;
  voucherNo: string;
  date: string;
  status: string | null | undefined;
  partnerName: string | null | undefined;
  lineCount: number;
  remarks: string | null | undefined;
  _gr?: ErpGoodsReceipt;
  _gi?: ErpGoodsIssue;
}

function toWarehouseRow(
  item: ErpGoodsReceipt | ErpGoodsIssue,
  kind: VoucherKind,
): WarehouseRow {
  if (kind === "receipt") {
    const gr = item as ErpGoodsReceipt;
    return {
      kind,
      id: gr.id,
      voucherNo: gr.receiptNo,
      date: gr.receiptDate,
      status: gr.status,
      partnerName: gr.supplierName,
      lineCount: gr.lines?.length ?? 0,
      remarks: gr.remarks,
      _gr: gr,
    };
  }
  const gi = item as ErpGoodsIssue;
  return {
    kind,
    id: gi.id,
    voucherNo: gi.issueNo,
    date: gi.issueDate,
    status: gi.status,
    partnerName: gi.customerName,
    lineCount: gi.lines?.length ?? 0,
    remarks: gi.remarks,
    _gi: gi,
  };
}

// ─── GR Form types ────────────────────────────────────────────────────────────

interface GrLineForm {
  purchaseOrderLineId: string;
  itemId: string;
  itemName: string;
  qtyReceived: string;
  unitCost: string;
}
interface GrForm {
  receiptNo: string;
  purchaseOrderId: string;
  supplierId: string;
  receiptDate: string;
  remarks: string;
  lines: GrLineForm[];
}
const emptyGrForm = (): GrForm => ({
  receiptNo: "",
  purchaseOrderId: "",
  supplierId: "",
  receiptDate: new Date().toISOString().slice(0, 10),
  remarks: "",
  lines: [],
});
function buildGrForm(gr: ErpGoodsReceipt): GrForm {
  return {
    receiptNo: gr.receiptNo ?? "",
    purchaseOrderId: gr.purchaseOrderId ?? "",
    supplierId: gr.supplierId ?? "",
    receiptDate: gr.receiptDate ? gr.receiptDate.slice(0, 10) : "",
    remarks: gr.remarks ?? "",
    lines:
      gr.lines?.map((line) => ({
        purchaseOrderLineId: line.purchaseOrderLineId ?? "",
        itemId: line.itemId ?? "",
        itemName: line.itemName ?? "",
        qtyReceived: line.qtyReceived ?? "0",
        unitCost: line.unitCost ?? "",
      })) ?? [],
  };
}
function buildGrPayload(form: GrForm): CreateGrPayload {
  return {
    receiptNo: form.receiptNo.trim(),
    purchaseOrderId: form.purchaseOrderId || undefined,
    supplierId: form.supplierId || undefined,
    receiptDate: form.receiptDate,
    remarks: form.remarks.trim() || undefined,
    lines: form.lines.map((line) => ({
      purchaseOrderLineId: line.purchaseOrderLineId || undefined,
      itemId: line.itemId || undefined,
      qtyReceived: line.qtyReceived,
      unitCost: line.unitCost || undefined,
    })),
  };
}

// ─── GI Form types ────────────────────────────────────────────────────────────

interface GiLineForm {
  salesOrderLineId: string;
  itemId: string;
  itemName: string;
  serialId: string;
  vehicleId: string;
  qtyIssued: string;
  unitCost: string;
}
interface GiForm {
  issueNo: string;
  issueDate: string;
  issueType: string;
  customerId: string;
  status: string;
  remarks: string;
  lines: GiLineForm[];
}
const emptyGiLine = (): GiLineForm => ({
  salesOrderLineId: "",
  itemId: "",
  itemName: "",
  serialId: "",
  vehicleId: "",
  qtyIssued: "1",
  unitCost: "",
});
const emptyGiForm = (): GiForm => ({
  issueNo: "",
  issueDate: new Date().toISOString().slice(0, 10),
  issueType: "SALE",
  customerId: "",
  status: "DRAFT",
  remarks: "",
  lines: [emptyGiLine()],
});
function buildGiForm(gi: ErpGoodsIssue): GiForm {
  return {
    issueNo: gi.issueNo ?? "",
    issueDate: gi.issueDate ? gi.issueDate.slice(0, 10) : "",
    issueType: gi.issueType ?? "SALE",
    customerId: gi.customerId ?? "",
    status: gi.status ?? "DRAFT",
    remarks: gi.remarks ?? "",
    lines: gi.lines?.length
      ? gi.lines.map((line) => ({
          salesOrderLineId: line.salesOrderLineId ?? "",
          itemId: line.itemId ?? "",
          itemName: line.itemName ?? "",
          serialId: line.serialId ?? "",
          vehicleId: line.vehicleId ?? "",
          qtyIssued: line.qtyIssued ?? "1",
          unitCost: line.unitCost ?? "",
        }))
      : [emptyGiLine()],
  };
}
function buildGiPayload(form: GiForm): CreateGiPayload {
  return {
    issueNo: form.issueNo.trim(),
    issueDate: form.issueDate,
    issueType: form.issueType || "SALE",
    customerId: form.customerId || undefined,
    status: form.status || "DRAFT",
    remarks: form.remarks.trim() || undefined,
    lines: form.lines.map((line) => ({
      salesOrderLineId: line.salesOrderLineId || undefined,
      itemId: line.itemId || undefined,
      itemName: line.itemName || undefined,
      serialId: line.serialId || undefined,
      vehicleId: line.vehicleId || undefined,
      qtyIssued: line.qtyIssued,
      unitCost: line.unitCost || undefined,
    })),
  };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmtDate(value?: string | null) {
  if (!value) return "—";
  return value.slice(0, 10);
}
function fmtQty(value?: string | null) {
  if (!value) return "0";
  const n = Number(value);
  if (Number.isNaN(n)) return value;
  return new Intl.NumberFormat("vi-VN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 3,
  }).format(n);
}

function StatusBadge({ status }: { status?: string | null }) {
  const s = status ?? "DRAFT";
  let cls =
    "inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ";
  if (s === "POSTED") cls += "bg-emerald-50 text-emerald-700 ring-emerald-200";
  else if (s === "VOIDED" || s === "CANCELLED")
    cls += "bg-red-50 text-red-600 ring-red-200";
  else cls += "bg-amber-50 text-amber-700 ring-amber-200";
  return <span className={cls}>{s}</span>;
}

function KindBadge({ kind }: { kind: VoucherKind }) {
  return kind === "receipt" ? (
    <span className="inline-flex rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700 ring-1 ring-blue-200">
      Nhập kho
    </span>
  ) : (
    <span className="inline-flex rounded-full bg-orange-50 px-2 py-0.5 text-[10px] font-semibold text-orange-700 ring-1 ring-orange-200">
      Xuất kho
    </span>
  );
}

type TabFilter = "all" | "receipt" | "issue";

// ─── Main page ────────────────────────────────────────────────────────────────

export function ErpWarehousePage() {
  const canReadReceipts = useHasPermission("goods_receipts", "read");
  const canReadIssues = useHasPermission("goods_issues", "read");
  const showToast = useUIStore((s) => s.showToast);
  const queryClient = useQueryClient();

  // ── filter state (same pattern as page mua hàng)
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  const [tabFilter, setTabFilter] = useState<TabFilter>("all");
  const [showGrGeneralInfo, setShowGrGeneralInfo] = useState(true);

  // ── list state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(40);
  const [searchInputs, setSearchInputs] = useState<Record<TabFilter, string>>({
    all: "",
    receipt: "",
    issue: "",
  });
  const [searches, setSearches] = useState<Record<TabFilter, string>>({
    all: "",
    receipt: "",
    issue: "",
  });
  const searchInput = searchInputs[tabFilter];
  const search = searches[tabFilter];
  const [loadError, setLoadError] = useState<string | null>(null);

  // ── GR drawer state
  const [grDrawerOpen, setGrDrawerOpen] = useState(false);
  const [grDrawerLoading, setGrDrawerLoading] = useState(false);
  const [grEditing, setGrEditing] = useState<ErpGoodsReceipt | null>(null);
  const [grViewOnly, setGrViewOnly] = useState(false);
  const [grForm, setGrForm] = useState<GrForm>(emptyGrForm);
  const [grSaveError, setGrSaveError] = useState<string | null>(null);
  const [grSaving, setGrSaving] = useState(false);
  const [grPostingId, setGrPostingId] = useState<string | null>(null);
  const [grCancelId, setGrCancelId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<WarehouseRow | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [grPoDetail, setGrPoDetail] = useState<ErpPurchaseOrder | null>(null);
  const [poOptions, setPoOptions] = useState<
    Array<{ value: string; label: string }>
  >([]);

  // ── GI drawer state
  const [giDrawerOpen, setGiDrawerOpen] = useState(false);
  const [giDrawerLoading, setGiDrawerLoading] = useState(false);
  const [giEditing, setGiEditing] = useState<ErpGoodsIssue | null>(null);
  const [giViewOnly, setGiViewOnly] = useState(false);
  const [giForm, setGiForm] = useState<GiForm>(emptyGiForm);
  const [giSaveError, setGiSaveError] = useState<string | null>(null);
  const [giSaving, setGiSaving] = useState(false);
  const [giPostingId, setGiPostingId] = useState<string | null>(null);

  // Lookup hooks for basic masters
  const [supplierSearch, setSupplierSearch] = useState("");
  const {
    data: suppliersData,
    fetchNextPage: fetchNextSuppliers,
    isFetchingNextPage: loadingSuppliers,
  } = useBasicMasterInfinite({
    search: supplierSearch,
    limit: 50,
    entities: "suppliers",
  });
  const supplierOptions = useMemo(() => {
    return (
      suppliersData?.pages.flatMap((p) =>
        (p.items.suppliers || []).map((s) => ({
          value: s.id,
          label: s.name,
        })),
      ) || []
    );
  }, [suppliersData]);

  const [customerSearch, setCustomerSearch] = useState("");
  const {
    data: customersData,
    fetchNextPage: fetchNextCustomers,
    isFetchingNextPage: loadingCustomers,
  } = useBasicMasterInfinite({
    search: customerSearch,
    limit: 50,
    entities: "customers",
  });
  const customerOptions = useMemo(() => {
    return (
      customersData?.pages.flatMap((p) =>
        (p.items.customers || []).map((c) => ({
          value: c.id,
          label: `${c.code} — ${c.displayName || c.name}`,
        })),
      ) || []
    );
  }, [customersData]);

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
    return (
      itemsData?.pages.flatMap((p) =>
        (p.items.inventoryItems || []).map((i) => ({
          value: i.id,
          label: `${i.sku} — ${i.itemName}`,
        })),
      ) || []
    );
  }, [itemsData]);

  const [vehicleOptions, setVehicleOptions] = useState<
    Array<{ value: string; label: string }>
  >([]);

  // ── Items Dict (for SKUs)
  const [itemsDict, setItemsDict] = useState<Record<string, ErpInventoryItem>>(
    {},
  );
  const fetchItemsDict = async (itemIds: string[]) => {
    const ids = [...new Set(itemIds)].filter(Boolean);
    if (ids.length === 0) return;
    try {
      const res = await inventoryCoreApi.list({
        ids: ids.join(","),
        pageSize: 1000,
      });
      setItemsDict((prev) => {
        const next = { ...prev };
        for (const it of res.items) next[it.id] = it;
        return next;
      });
    } catch (e) {
      /* ignore */
    }
  };

  const receiptQuery = useWarehouseReceiptsQuery(
    {
      page,
      pageSize: Math.ceil(pageSize / 2),
      search,
    },
    tabFilter !== "issue",
  );

  const issueQuery = useWarehouseIssuesQuery(
    {
      page,
      pageSize: Math.ceil(pageSize / 2),
      search,
    },
    tabFilter !== "receipt",
  );

  useEffect(() => {
    const receiptError =
      receiptQuery.error instanceof Error ? receiptQuery.error.message : null;
    const issueError =
      issueQuery.error instanceof Error ? issueQuery.error.message : null;
    setLoadError(receiptError || issueError);
  }, [issueQuery.error, receiptQuery.error]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const receiptId = params.get("receiptId");
    const mode = params.get("mode");

    if (!grDrawerOpen && receiptId && mode === "view") {
      goodsReceiptsCoreApi
        .get(receiptId)
        .then((gr) => {
          void openGrDetail(gr, true);
        })
        .catch(() => {
          // silent
        })
        .finally(() => {
          params.delete("receiptId");
          params.delete("mode");
          const nextQuery = params.toString();
          history.replaceState(
            null,
            "",
            nextQuery
              ? `${window.location.pathname}?${nextQuery}`
              : window.location.pathname,
          );
        });
    }
  }, [grDrawerOpen]);

  // ── Combine + sort by date desc
  const rows: WarehouseRow[] = useMemo(() => {
    const grRows =
      tabFilter !== "issue"
        ? (receiptQuery.data?.items ?? []).map((g) =>
            toWarehouseRow(g, "receipt"),
          )
        : [];
    const giRows =
      tabFilter !== "receipt"
        ? (issueQuery.data?.items ?? []).map((g) => toWarehouseRow(g, "issue"))
        : [];
    return [...grRows, ...giRows].sort((a, b) => b.date.localeCompare(a.date));
  }, [issueQuery.data?.items, receiptQuery.data?.items, tabFilter]);

  const loading =
    receiptQuery.isLoading ||
    receiptQuery.isFetching ||
    issueQuery.isLoading ||
    issueQuery.isFetching;
  const total =
    tabFilter === "receipt"
      ? (receiptQuery.data?.total ?? 0)
      : tabFilter === "issue"
        ? (issueQuery.data?.total ?? 0)
        : (receiptQuery.data?.total ?? 0) + (issueQuery.data?.total ?? 0);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  // ── Load GR lookups (PO + Supplier)
  const loadGrLookups = useCallback(async () => {
    try {
      const poRes = await purchaseOrdersCoreApi.list({
        page: 1,
        pageSize: 200,
      });
      setPoOptions(
        poRes.items.map((po) => ({
          value: po.id,
          label: `${po.poNo || po.id} — ${po.supplierName ?? ""}`,
        })),
      );
    } catch {
      /* silent */
    }
  }, []);

  // ── Load GI lookups
  const loadGiLookups = useCallback(async () => {
    try {
      const vehRes = await manufacturingApi.listVehicles({
        page: 1,
        pageSize: LOOKUP_LIMIT,
      });
      const vehList = vehRes.items ?? [];

      setVehicleOptions(
        vehList.map((v: any) => ({
          value: v.id,
          label: `${v.frame_no ?? v.vin ?? v.id}${v.engine_no ? ` / ${v.engine_no}` : ""}`,
        })),
      );
    } catch {
      /* silent */
    }
  }, []);

  // ── Load PO detail for GR form
  useEffect(() => {
    if (!grForm.purchaseOrderId) {
      setGrPoDetail(null);
      return;
    }
    purchaseOrdersCoreApi
      .get(grForm.purchaseOrderId)
      .then((po) => {
        setGrPoDetail(po);
        if (po.supplierId) {
          setGrForm((f) => ({ ...f, supplierId: po.supplierId || "" }));
        }
        if (po.lines) {
          void fetchItemsDict(po.lines.map((l) => l.itemId || ""));
        }
      })
      .catch(() => setGrPoDetail(null));
  }, [grForm.purchaseOrderId]);

  // ── GR open helpers
  function openGrCreate() {
    setGrEditing(null);
    setGrViewOnly(false);
    setGrForm(emptyGrForm());
    setGrSaveError(null);
    void loadGrLookups();
    setGrDrawerOpen(true);
  }
  async function openGrDetail(gr: ErpGoodsReceipt, viewOnly: boolean) {
    setGrViewOnly(viewOnly);
    setGrSaveError(null);
    setGrDrawerLoading(true);
    setGrDrawerOpen(true);
    void loadGrLookups();
    try {
      let detail = gr;
      if (!detail.lines) detail = await goodsReceiptsCoreApi.get(gr.id);
      if (detail.lines) {
        void fetchItemsDict(detail.lines.map((l) => l.itemId || ""));
      }
      setGrEditing(detail);
      setGrForm(buildGrForm(detail));
    } finally {
      setGrDrawerLoading(false);
    }
  }

  // ── GI open helpers
  function openGiCreate() {
    setGiEditing(null);
    setGiViewOnly(false);
    setGiForm(emptyGiForm());
    setGiSaveError(null);
    void loadGiLookups();
    setGiDrawerOpen(true);
  }
  async function openGiDetail(gi: ErpGoodsIssue, viewOnly: boolean) {
    setGiViewOnly(viewOnly);
    setGiSaveError(null);
    setGiDrawerLoading(true);
    setGiDrawerOpen(true);
    void loadGiLookups();
    try {
      let detail = gi;
      if (!detail.lines) detail = await goodsIssuesCoreApi.get(gi.id);
      if (detail.lines) {
        void fetchItemsDict(detail.lines.map((l) => l.itemId || ""));
      }
      setGiEditing(detail);
      setGiForm(buildGiForm(detail));
    } finally {
      setGiDrawerLoading(false);
    }
  }

  // ── GR save / post / cancel
  async function handleGrSave() {
    setGrSaving(true);
    setGrSaveError(null);
    try {
      const payload = buildGrPayload(grForm);
      if (grEditing) {
        await goodsReceiptsCoreApi.update(grEditing.id, payload);
        showToast({ title: "Đã cập nhật phiếu nhập kho", variant: "success" });
      } else {
        if (!payload.receiptNo)
          payload.receiptNo = await goodsReceiptsCoreApi.nextNo(
            grForm.receiptDate,
          );
        await goodsReceiptsCoreApi.create(payload);
        showToast({
          title: "Tạo phiếu nhập kho thành công",
          variant: "success",
        });
      }
      setGrDrawerOpen(false);
      await queryClient.invalidateQueries({
        queryKey: createWarehouseReceiptsKey({ page, pageSize, search }),
      });
    } catch (e) {
      setGrSaveError(e instanceof Error ? e.message : "Lỗi lưu phiếu nhập kho");
    } finally {
      setGrSaving(false);
    }
  }
  async function handleGrPost(id: string) {
    setGrPostingId(id);
    try {
      await goodsReceiptsCoreApi.post(id);
      showToast({ title: "Đã ghi sổ phiếu nhập kho", variant: "success" });
      await queryClient.invalidateQueries({
        queryKey: createWarehouseReceiptsKey({ page, pageSize, search }),
      });
    } catch (e) {
      showToast({
        title: e instanceof Error ? e.message : "Lỗi ghi sổ",
        variant: "destructive",
      });
    } finally {
      setGrPostingId(null);
    }
  }
  async function handleGrCancel(id: string) {
    setGrCancelId(id);
    try {
      await goodsReceiptsCoreApi.cancel(id);
      showToast({ title: "Đã hủy phiếu nhập kho", variant: "success" });
      await queryClient.invalidateQueries({
        queryKey: createWarehouseReceiptsKey({ page, pageSize, search }),
      });
    } catch (e) {
      showToast({
        title: e instanceof Error ? e.message : "Lỗi hủy phiếu",
        variant: "destructive",
      });
    } finally {
      setGrCancelId(null);
    }
  }

  // ── GI save / post
  async function handleGiSave() {
    setGiSaving(true);
    setGiSaveError(null);
    try {
      const payload = buildGiPayload(giForm);
      if (giEditing) {
        await goodsIssuesCoreApi.update(giEditing.id, payload);
        showToast({ title: "Đã cập nhật phiếu xuất kho", variant: "success" });
      } else {
        await goodsIssuesCoreApi.create(payload);
        showToast({
          title: "Tạo phiếu xuất kho thành công",
          variant: "success",
        });
      }
      setGiDrawerOpen(false);
      await queryClient.invalidateQueries({
        queryKey: createWarehouseIssuesKey({ page, pageSize, search }),
      });
    } catch (e) {
      setGiSaveError(e instanceof Error ? e.message : "Lỗi lưu phiếu xuất kho");
    } finally {
      setGiSaving(false);
    }
  }
  async function handleGiPost(id: string) {
    setGiPostingId(id);
    try {
      await goodsIssuesCoreApi.post(id);
      showToast({ title: "Đã ghi sổ phiếu xuất kho", variant: "success" });
      await queryClient.invalidateQueries({
        queryKey: createWarehouseIssuesKey({ page, pageSize, search }),
      });
    } catch (e) {
      showToast({
        title: e instanceof Error ? e.message : "Lỗi ghi sổ",
        variant: "destructive",
      });
    } finally {
      setGiPostingId(null);
    }
  }

  async function handleDeleteConfirm() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      if (deleteTarget.kind === "receipt") {
        await goodsReceiptsCoreApi.remove(deleteTarget.id);
        showToast({ title: "Đã xóa phiếu nhập kho", variant: "success" });
        await queryClient.invalidateQueries({
          queryKey: ["warehouse-vouchers", "receipts"],
        });
      } else {
        await goodsIssuesCoreApi.remove(deleteTarget.id);
        showToast({ title: "Đã xóa phiếu xuất kho", variant: "success" });
        await queryClient.invalidateQueries({
          queryKey: ["warehouse-vouchers", "issues"],
        });
      }
      setDeleteTarget(null);
    } catch (e) {
      showToast({
        title: e instanceof Error ? e.message : "Lỗi xóa phiếu",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  }

  // ── Columns
  const columns: DataTableColumn<WarehouseRow>[] = useMemo(
    () => [
      {
        key: "kind",
        header: "Loại",
        className: "w-[110px]",
        cell: (row) => <KindBadge kind={row.kind} />,
      },
      {
        key: "voucherNo",
        header: "Số phiếu",
        className: "w-[160px] font-mono text-sm",
        cell: (row) => row.voucherNo,
      },
      {
        key: "date",
        header: "Ngày",
        className: "w-[110px]",
        cell: (row) => fmtDate(row.date),
      },
      {
        key: "partnerName",
        header: "Đối tác",
        cell: (row) => row.partnerName ?? "—",
      },
      {
        key: "status",
        header: "Trạng thái",
        className: "w-[110px]",
        cell: (row) => <StatusBadge status={row.status} />,
      },
      {
        key: "remarks",
        header: "Ghi chú",
        cell: (row) => row.remarks ?? "—",
      },
    ],
    [],
  );

  const voucherTypeOptions = [
    {
      value: "receipt",
      label: `Nhập kho (${receiptQuery.data?.total ?? 0})`,
    },
    {
      value: "issue",
      label: `Xuất kho (${issueQuery.data?.total ?? 0})`,
    },
  ];

  const filterConfig: FilterPanelConfig = {
    search: true,
    custom: [
      {
        key: "voucherType",
        label: "Loại chứng từ",
        placeholder: "Tất cả chứng từ",
        options: voucherTypeOptions,
      },
    ],
  };

  const activeFilterCount = [!!searchInput, tabFilter !== "all"].filter(
    Boolean,
  ).length;

  const filters: FilterPanelReturn = {
    state: {
      period: "",
      dateFrom: "",
      dateTo: "",
      channel: "",
      search,
      amountMin: "",
      amountMax: "",
      status: "",
      counterpartySource: "",
      custom: {
        voucherType: tabFilter === "all" ? "" : tabFilter,
      },
    },
    inputs: {
      search: searchInput,
      amountMin: "",
      amountMax: "",
    },
    panelOpen: filterPanelOpen,
    openPanel: () => setFilterPanelOpen(true),
    closePanel: () => setFilterPanelOpen(false),
    togglePanel: () => setFilterPanelOpen((v) => !v),
    setPeriod: () => {},
    setDateFrom: () => {},
    setDateTo: () => {},
    setChannel: () => {},
    setSearchInput: (value: string) => {
      setSearchInputs((prev) => ({ ...prev, [tabFilter]: value }));
      setSearches((prev) => ({ ...prev, [tabFilter]: value }));
      setPage(1);
    },
    setAmountMinInput: () => {},
    setAmountMaxInput: () => {},
    setStatus: () => {},
    setCounterpartySource: () => {},
    setCustom: (key: string, value: string) => {
      if (key === "voucherType") {
        setTabFilter((value as TabFilter) || "all");
        setPage(1);
      }
    },
    resetAll: () => {
      setSearchInputs((prev) => ({ ...prev, [tabFilter]: "" }));
      setSearches((prev) => ({ ...prev, [tabFilter]: "" }));
      setPage(1);
    },
    hasActiveFilter: activeFilterCount > 0,
    activeFilterCount,
  };

  // ── GR drawer actions
  const grDrawerActions: DrawerAction[] = grViewOnly
    ? [{ label: "Đóng", onClick: () => setGrDrawerOpen(false) }]
    : [
        {
          label: "Hủy",
          onClick: () => setGrDrawerOpen(false),
          variant: "outline",
        },
        {
          label: grEditing ? "Cập nhật" : "Tạo mới",
          onClick: () => void handleGrSave(),
          primary: true,
          loading: grSaving,
        },
      ];

  // ── GI drawer actions
  const giDrawerActions: DrawerAction[] = giViewOnly
    ? [{ label: "Đóng", onClick: () => setGiDrawerOpen(false) }]
    : [
        {
          label: "Hủy",
          onClick: () => setGiDrawerOpen(false),
          variant: "outline",
        },
        {
          label: giEditing ? "Cập nhật" : "Tạo mới",
          onClick: () => void handleGiSave(),
          primary: true,
          loading: giSaving,
        },
      ];

  if (!canReadReceipts && !canReadIssues) return <Forbidden />;

  return (
    <>
      <PageLayout
        title="Chứng từ kho"
        desc="Quản lý phiếu nhập kho và xuất kho."
        icon={<ClipboardList className="h-5 w-5" />}
      >
        <div className="flex items-center justify-end mb-3">
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              className="px-3 py-2"
              disabled={loading}
              onClick={() => {
                if (tabFilter !== "issue") void receiptQuery.refetch();
                if (tabFilter !== "receipt") void issueQuery.refetch();
              }}
            >
              <RefreshCcw
                className={cn("h-3.5 w-3.5 mr-1.5", loading && "animate-spin")}
              />
              <span>Tải lại</span>
            </Button>
            <FilterButton
              onClick={() => setFilterPanelOpen((v) => !v)}
              activeCount={activeFilterCount}
            />
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-fg hover:bg-primary/90"
              onClick={openGrCreate}
            >
              <PackagePlus className="h-3.5 w-3.5" />
              Nhập kho
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-fg hover:bg-primary/90"
              onClick={openGiCreate}
            >
              <PackageMinus className="h-3.5 w-3.5" />
              Xuất kho
            </button>
          </div>
        </div>
        {loadError && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {loadError}
          </div>
        )}

        <div className="flex items-start">
          <div className="flex-1 min-w-0 space-y-4">
            <DataTable
              items={rows}
              columns={columns}
              getRowKey={(r) => `${r.kind}-${r.id}`}
              loading={loading}
              emptyLabel="Chưa có chứng từ kho."
              minWidth={780}
              loadingRows={8}
              actionsColumn={{
                header: "",
                className: "w-[48px]",
                cell: (row) => (
                  <ActionDropdown
                    items={[
                      {
                        label: "Xem chi tiết",
                        icon: <Eye className="h-3.5 w-3.5" />,
                        onClick: () => {
                          if (row.kind === "receipt" && row._gr)
                            void openGrDetail(row._gr, true);
                          else if (row.kind === "issue" && row._gi)
                            void openGiDetail(row._gi, true);
                        },
                      },
                      {
                        label:
                          (row.kind === "receipt"
                            ? grPostingId
                            : giPostingId) === row.id
                            ? "Đang ghi..."
                            : "Ghi sổ",
                        icon: <BookCheck className="h-3.5 w-3.5" />,
                        hidden:
                          row.status === "POSTED" ||
                          row.status === "CANCELLED" ||
                          row.status === "VOIDED",
                        onClick: () => {
                          if (row.kind === "receipt") void handleGrPost(row.id);
                          else void handleGiPost(row.id);
                        },
                      },
                      {
                        label: "Xóa",
                        icon: <Trash2 className="h-3.5 w-3.5" />,
                        variant: "danger",
                        hidden: row.status !== "DRAFT",
                        onClick: () => setDeleteTarget(row),
                      },
                      {
                        label:
                          grCancelId === row.id ? "Đang hủy..." : "Hủy phiếu",
                        icon: <XCircle className="h-3.5 w-3.5" />,
                        variant: "danger",
                        hidden:
                          row.kind !== "receipt" ||
                          row.status === "POSTED" ||
                          row.status === "CANCELLED" ||
                          row.status === "VOIDED",
                        onClick: () => void handleGrCancel(row.id),
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
              onPageSize={(v) => {
                setPage(1);
                setPageSize(v);
              }}
            />
          </div>
          <FilterPanel config={filterConfig} filter={filters} />
        </div>
      </PageLayout>

      <ConfirmModal
        open={!!deleteTarget}
        title="Xác nhận xóa"
        message={
          deleteTarget
            ? `Xóa ${deleteTarget.kind === "receipt" ? "phiếu nhập" : "phiếu xuất"} "${deleteTarget.voucherNo}"? Hành động này sẽ ẩn phiếu này khỏi danh sách.`
            : ""
        }
        confirmLabel="Xóa"
        cancelLabel="Hủy"
        onConfirm={() => void handleDeleteConfirm()}
        onCancel={() => {
          if (!deleting) setDeleteTarget(null);
        }}
        loading={deleting}
        danger
      />

      {/* ─── GR Drawer ──────────────────────────────────────────────────────── */}
      <DrawerModal
        open={grDrawerOpen}
        onClose={() => setGrDrawerOpen(false)}
        icon={<Boxes className="h-4 w-4" />}
        title={
          grEditing
            ? grViewOnly
              ? "Phiếu nhập kho"
              : "Sửa nhập kho"
            : "Tạo phiếu nhập kho"
        }
        subtitle={grEditing?.receiptNo ?? "Nhập kho"}
        actions={grDrawerActions}
        headerExtra={
          grViewOnly &&
          grEditing &&
          !["POSTED", "CANCELLED", "VOIDED"].includes(
            grEditing.status || "DRAFT",
          ) ? (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setGrViewOnly(false)}
            >
              Chỉnh sửa
            </Button>
          ) : null
        }
        panelClassName="min-[1024px]:min-w-[1120px]"
      >
        {grSaveError && (
          <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
            {grSaveError}
          </div>
        )}

        {grDrawerLoading ? (
          <div className="flex flex-col xl:flex-row gap-6 items-start">
            <div className="flex-1 min-w-0 order-2 xl:order-1 space-y-4">
              <DrawerSection title="Chi tiết hàng hóa">
                <div className="space-y-3">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </DrawerSection>
            </div>
            <div className="shrink-0 order-1 xl:order-2 space-y-4 w-full xl:w-[320px]">
              <DrawerSection title="Thông tin chung">
                <div className="flex flex-col gap-3">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-20 w-full" />
                </div>
              </DrawerSection>
            </div>
          </div>
        ) : (
          <div className="flex flex-col xl:flex-row gap-6 items-start">
            <div className="flex-1 min-w-0 order-2 xl:order-1 space-y-4">
              <DrawerSection
                title={`Chi tiết hàng hóa (${grForm.lines.length})`}
              >
                <div className="w-full overflow-x-auto rounded-lg border border-[color:var(--border)]">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-muted text-muted-foreground text-xs uppercase">
                      <tr>
                        <th className="px-3 py-2 font-medium min-w-[260px]">
                          Linh kiện / Tên hàng
                        </th>
                        <th className="px-3 py-2 font-medium min-w-[140px] text-right">
                          SL Thay đổi
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {grPoDetail?.lines?.map((poLine) => {
                        const lineIdx = grForm.lines.findIndex(
                          (l) => l.purchaseOrderLineId === poLine.id,
                        );
                        const currentLine =
                          lineIdx >= 0 ? grForm.lines[lineIdx] : null;
                        if (
                          grViewOnly &&
                          (!currentLine || Number(currentLine.qtyReceived) <= 0)
                        ) {
                          return null;
                        }
                        const ordered = Number(poLine.qtyOrdered ?? 0);
                        const received = Number(poLine.qtyReceived ?? 0);
                        const remaining = Math.max(0, ordered - received);

                        const itemName =
                          poLine.itemName ||
                          poLine.description ||
                          poLine.itemId ||
                          "—";
                        const sku =
                          poLine.itemId && itemsDict[poLine.itemId]
                            ? `[${itemsDict[poLine.itemId].sku}] `
                            : "";

                        return (
                          <tr key={poLine.id} className="bg-background">
                            <td className="px-3 py-2 align-top">
                              <div className="font-medium">
                                {sku}
                                {itemName}
                              </div>
                              <div className="text-xs text-muted-foreground mt-1">
                                Đặt {ordered} | Đã nhận {received} | Còn{" "}
                                {remaining}
                              </div>
                            </td>
                            <td className="px-3 py-2 align-top text-right">
                              {!grViewOnly ? (
                                <input
                                  type="number"
                                  min={0}
                                  max={remaining}
                                  className={cn(
                                    inputCls,
                                    "w-28 flex-shrink-0 text-right ml-auto",
                                  )}
                                  placeholder={`Max ${remaining}`}
                                  value={currentLine?.qtyReceived ?? ""}
                                  onChange={(e) => {
                                    const qty = e.target.value;
                                    setGrForm((f) => {
                                      const lines = [...f.lines];
                                      if (lineIdx >= 0) {
                                        lines[lineIdx] = {
                                          ...lines[lineIdx],
                                          qtyReceived: qty,
                                        };
                                      } else {
                                        lines.push({
                                          purchaseOrderLineId: poLine.id ?? "",
                                          itemId: poLine.itemId ?? "",
                                          itemName: poLine.itemName ?? "",
                                          qtyReceived: qty,
                                          unitCost: poLine.unitPrice ?? "",
                                        });
                                      }
                                      return { ...f, lines };
                                    });
                                  }}
                                />
                              ) : currentLine ? (
                                <div className="font-medium text-emerald-600 mt-1">
                                  +{fmtQty(currentLine.qtyReceived)}
                                </div>
                              ) : null}
                            </td>
                          </tr>
                        );
                      })}
                      {!grPoDetail &&
                        grForm.lines.length === 0 &&
                        !grViewOnly && (
                          <tr>
                            <td
                              colSpan={2}
                              className="px-3 py-4 text-center text-sm text-muted-foreground"
                            >
                              Chọn PO để hiện danh sách hàng cần nhận.
                            </td>
                          </tr>
                        )}
                      {grViewOnly &&
                        !grPoDetail &&
                        grForm.lines.map((line, i) => {
                          if (Number(line.qtyReceived) <= 0) return null;
                          const sku =
                            line.itemId && itemsDict[line.itemId]
                              ? `[${itemsDict[line.itemId].sku}] `
                              : "";
                          return (
                            <tr key={i} className="bg-background">
                              <td className="px-3 py-2 align-top font-medium text-xs">
                                {sku}
                                {line.itemName || line.itemId || "—"}
                              </td>
                              <td className="px-3 py-2 align-top text-right font-medium text-emerald-600">
                                +{fmtQty(line.qtyReceived)}
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </DrawerSection>
            </div>

            <div
              className={cn(
                "shrink-0 order-1 xl:order-2 space-y-4 transition-all duration-300",
                showGrGeneralInfo ? "w-full xl:w-[320px]" : "w-auto",
              )}
            >
              <DrawerSection
                title={showGrGeneralInfo ? "Thông tin chung" : ""}
                titleExtra={
                  <button
                    type="button"
                    onClick={() => setShowGrGeneralInfo((s) => !s)}
                    className="p-1 -mr-1 rounded hover:bg-muted text-muted-foreground transition-colors"
                    title={showGrGeneralInfo ? "Thu gọn" : "Mở rộng"}
                  >
                    {showGrGeneralInfo ? (
                      <ChevronRight className="w-4 h-4" />
                    ) : (
                      <ChevronLeft className="w-4 h-4" />
                    )}
                  </button>
                }
              >
                {showGrGeneralInfo && (
                  <div className="flex flex-col gap-3">
                    <DrawerField label="Số phiếu">
                      <input
                        className={inputCls}
                        placeholder="Tự động nếu để trống"
                        value={grForm.receiptNo}
                        disabled={grViewOnly}
                        onChange={(e) =>
                          setGrForm((f) => ({
                            ...f,
                            receiptNo: e.target.value,
                          }))
                        }
                      />
                    </DrawerField>
                    <DrawerField label="Ngày nhập">
                      <input
                        type="date"
                        className={inputCls}
                        value={grForm.receiptDate}
                        disabled={grViewOnly}
                        onChange={(e) =>
                          setGrForm((f) => ({
                            ...f,
                            receiptDate: e.target.value,
                          }))
                        }
                      />
                    </DrawerField>
                    <DrawerField label="Đơn mua hàng (PO)">
                      <Combobox
                        options={poOptions}
                        value={grForm.purchaseOrderId}
                        disabled={grViewOnly}
                        placeholder="Chọn PO..."
                        onChange={(v) =>
                          setGrForm((f) => ({
                            ...f,
                            purchaseOrderId: v,
                            lines: [],
                          }))
                        }
                      />
                    </DrawerField>
                    <DrawerField label="Nhà cung cấp">
                      <Combobox
                        options={supplierOptions}
                        value={grForm.supplierId}
                        disabled={grViewOnly || !!grForm.purchaseOrderId}
                        placeholder="Chọn NCC"
                        searchPlaceholder="Tìm kiếm..."
                        onSearch={setSupplierSearch}
                        onScrollBottom={fetchNextSuppliers}
                        loading={loadingSuppliers}
                        onChange={(v) =>
                          setGrForm((f) => ({ ...f, supplierId: v }))
                        }
                      />
                    </DrawerField>
                    <DrawerField label="Ghi chú">
                      <textarea
                        className={`${inputCls} min-h-[60px] resize-y`}
                        value={grForm.remarks}
                        disabled={grViewOnly}
                        onChange={(e) =>
                          setGrForm((f) => ({ ...f, remarks: e.target.value }))
                        }
                      />
                    </DrawerField>
                  </div>
                )}
              </DrawerSection>
            </div>
          </div>
        )}
      </DrawerModal>

      {/* ─── GI Drawer ──────────────────────────────────────────────────────── */}
      <DrawerModal
        open={giDrawerOpen}
        onClose={() => setGiDrawerOpen(false)}
        icon={<PackageOpen className="h-4 w-4" />}
        title={
          giEditing
            ? giViewOnly
              ? "Phiếu xuất kho"
              : "Sửa xuất kho"
            : "Tạo phiếu xuất kho"
        }
        subtitle={giEditing?.issueNo ?? "Xuất kho"}
        actions={giDrawerActions}
        headerExtra={
          giViewOnly &&
          giEditing &&
          !["POSTED", "CANCELLED", "VOIDED"].includes(
            giEditing.status || "DRAFT",
          ) ? (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setGiViewOnly(false)}
            >
              Chỉnh sửa
            </Button>
          ) : null
        }
        panelClassName="min-[1024px]:min-w-[550px]"
      >
        {giSaveError && (
          <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
            {giSaveError}
          </div>
        )}

        {giDrawerLoading ? (
          <div className="space-y-4">
            <DrawerSection title="Thông tin phiếu">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            </DrawerSection>
            <DrawerSection title="Dòng xuất kho">
              <div className="space-y-3">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
              </div>
            </DrawerSection>
          </div>
        ) : (
          <>
            <DrawerSection title="Thông tin phiếu">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <DrawerField label="Số phiếu xuất" required>
                  <input
                    className={inputCls}
                    value={giForm.issueNo}
                    disabled={giViewOnly || !!giEditing}
                    onChange={(e) =>
                      setGiForm((f) => ({ ...f, issueNo: e.target.value }))
                    }
                    placeholder="GI-YYYYMMDD-001"
                  />
                </DrawerField>
                <DrawerField label="Ngày xuất" required>
                  <input
                    type="date"
                    className={inputCls}
                    value={giForm.issueDate}
                    disabled={giViewOnly}
                    onChange={(e) =>
                      setGiForm((f) => ({ ...f, issueDate: e.target.value }))
                    }
                  />
                </DrawerField>
                <DrawerField label="Loại xuất" required>
                  <Combobox
                    options={ISSUE_TYPE_OPTIONS}
                    value={giForm.issueType}
                    disabled={giViewOnly}
                    allowClear={false}
                    onChange={(v) =>
                      setGiForm((f) => ({ ...f, issueType: v || "SALE" }))
                    }
                  />
                </DrawerField>
                <DrawerField label="Khách hàng">
                  <Combobox
                    options={customerOptions}
                    value={giForm.customerId}
                    disabled={giViewOnly}
                    placeholder="Chọn khách hàng"
                    searchPlaceholder="Tìm khách hàng"
                    onSearch={setCustomerSearch}
                    onScrollBottom={fetchNextCustomers}
                    loading={loadingCustomers}
                    onChange={(v) =>
                      setGiForm((f) => ({ ...f, customerId: v }))
                    }
                  />
                </DrawerField>
                <DrawerField label="Trạng thái">
                  <Combobox
                    options={STATUS_OPTIONS}
                    value={giForm.status}
                    disabled={giViewOnly}
                    allowClear={false}
                    onChange={(v) =>
                      setGiForm((f) => ({ ...f, status: v || "DRAFT" }))
                    }
                  />
                </DrawerField>
              </div>
              <DrawerField label="Ghi chú">
                <textarea
                  className={`${inputCls} min-h-[60px] resize-y`}
                  value={giForm.remarks}
                  disabled={giViewOnly}
                  onChange={(e) =>
                    setGiForm((f) => ({ ...f, remarks: e.target.value }))
                  }
                />
              </DrawerField>
            </DrawerSection>

            <DrawerSection title={`Dòng xuất kho (${giForm.lines.length})`}>
              {giForm.lines.map((line, idx) => {
                if (giViewOnly && Number(line.qtyIssued) <= 0) return null;
                return (
                  <div
                    key={idx}
                    className="rounded-xl border border-border bg-muted/10 p-3 mb-2 space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-muted-foreground">
                        Dòng {idx + 1}
                      </span>
                      {!giViewOnly && (
                        <button
                          type="button"
                          className="text-xs text-red-500 hover:underline"
                          onClick={() =>
                            setGiForm((f) => ({
                              ...f,
                              lines: f.lines.filter((_, i) => i !== idx),
                            }))
                          }
                        >
                          Xóa
                        </button>
                      )}
                    </div>
                    <DrawerField label="Hàng hóa">
                      <Combobox
                        options={itemOptions}
                        value={line.itemId}
                        disabled={giViewOnly}
                        placeholder="Chọn inventory item"
                        searchPlaceholder="Tìm SKU / tên"
                        onSearch={setItemSearch}
                        onScrollBottom={fetchNextItems}
                        loading={loadingItems}
                        onChange={(v) => {
                          const found = itemOptions.find((o) => o.value === v);
                          setGiForm((f) => {
                            const lines = [...f.lines];
                            lines[idx] = {
                              ...lines[idx],
                              itemId: v,
                              itemName: found?.label ?? "",
                            };
                            return { ...f, lines };
                          });
                        }}
                      />
                    </DrawerField>
                    <div className="flex gap-2">
                      <DrawerField label="Số lượng">
                        <input
                          type="number"
                          className={cn(inputCls, "w-28")}
                          value={line.qtyIssued}
                          disabled={giViewOnly}
                          onChange={(e) => {
                            const v = e.target.value;
                            setGiForm((f) => {
                              const lines = [...f.lines];
                              lines[idx] = { ...lines[idx], qtyIssued: v };
                              return { ...f, lines };
                            });
                          }}
                        />
                      </DrawerField>
                      <DrawerField label="Đơn giá">
                        <input
                          type="number"
                          className={cn(inputCls, "w-28")}
                          value={line.unitCost}
                          disabled={giViewOnly}
                          placeholder="Tùy chọn"
                          onChange={(e) => {
                            const v = e.target.value;
                            setGiForm((f) => {
                              const lines = [...f.lines];
                              lines[idx] = { ...lines[idx], unitCost: v };
                              return { ...f, lines };
                            });
                          }}
                        />
                      </DrawerField>
                    </div>
                    {vehicleOptions.length > 0 && (
                      <DrawerField label="Xe (tùy chọn)">
                        <Combobox
                          options={vehicleOptions}
                          value={line.vehicleId}
                          disabled={giViewOnly}
                          placeholder="Chọn xe..."
                          onChange={(v) => {
                            setGiForm((f) => {
                              const lines = [...f.lines];
                              lines[idx] = { ...lines[idx], vehicleId: v };
                              return { ...f, lines };
                            });
                          }}
                        />
                      </DrawerField>
                    )}
                  </div>
                );
              })}
              {!giViewOnly && (
                <button
                  type="button"
                  className="mt-1 flex items-center gap-1 text-sm text-primary hover:underline"
                  onClick={() =>
                    setGiForm((f) => ({
                      ...f,
                      lines: [...f.lines, emptyGiLine()],
                    }))
                  }
                >
                  <Plus className="h-3.5 w-3.5" />
                  Thêm dòng hàng
                </button>
              )}
            </DrawerSection>
          </>
        )}
      </DrawerModal>
    </>
  );
}
