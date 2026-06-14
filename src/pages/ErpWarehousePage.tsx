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
import { DocumentLineTable } from "@/shared/components/DocumentLineTable";
import {
  useFilterPanel,
  type FilterPanelConfig,
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
import { useWarehouseVouchersQuery } from "@/modules/inventory-core/hooks/useWarehouseVoucherQueries";
import type { WarehouseRow } from "@/modules/inventory-core/api/warehouseVouchersCoreApi";

const LOOKUP_LIMIT = 200;
const ISSUE_TYPE_OPTIONS = [
  { value: "SALE", label: "SALE — Xuất bán" },
  { value: "OTHER", label: "OTHER — Xuất khác" },
];
const STATUS_OPTIONS = [
  { value: "DRAFT", label: "DRAFT" },
  { value: "POSTED", label: "POSTED" },
];

// ─── Combined row type provided by API ───

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

function KindBadge({ kind }: { kind: "receipt" | "issue" }) {
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
  const [sortBy, setSortBy] = useState<string>("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
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
  const [cancelTarget, setCancelTarget] = useState<WarehouseRow | null>(null);
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

  const filterConfig: FilterPanelConfig = {
    search: true,
    period: true,
    status: {
      placeholder: "Trạng thái",
      options: STATUS_OPTIONS,
    },
    custom: [
      {
        key: "partnerId",
        label: "Đối tác",
        placeholder: "Tất cả đối tác",
        type: "select",
        options: [...supplierOptions, ...customerOptions],
      },
    ],
  };

  const filterPanel = useFilterPanel(filterConfig);

  const dateFrom = filterPanel.state.dateFrom;
  const dateTo = filterPanel.state.dateTo;
  const status = filterPanel.state.status;
  const partnerId = filterPanel.state.custom?.partnerId;

  const vouchersQuery = useWarehouseVouchersQuery({
    page,
    pageSize,
    search: filterPanel.state.search || undefined,
    type: tabFilter === "all" ? undefined : tabFilter,
    dateFrom,
    dateTo,
    status,
    partnerId,
    sort: sortOrder === "desc" ? [`-${sortBy}`] : [sortBy],
  });

  useEffect(() => {
    const error =
      vouchersQuery.error instanceof Error ? vouchersQuery.error.message : null;
    setLoadError(error);
  }, [vouchersQuery.error]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const receiptId = params.get("receiptId");
    const purchaseOrderId = params.get("purchaseOrderId");
    const mode = params.get("mode");

    if (!grDrawerOpen && receiptId && mode === "view") {
      goodsReceiptsCoreApi
        .get(receiptId)
        .then((gr) => {
          void openGrDetail(gr.id, true);
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
    } else if (!grDrawerOpen && purchaseOrderId && mode === "from-po") {
      openGrCreate();
      setGrForm((f) => ({ ...f, purchaseOrderId }));
      params.delete("purchaseOrderId");
      params.delete("mode");
      const nextQuery = params.toString();
      history.replaceState(
        null,
        "",
        nextQuery
          ? `${window.location.pathname}?${nextQuery}`
          : window.location.pathname,
      );
    }
  }, [grDrawerOpen]);

  // ── Unified rows
  const rows: WarehouseRow[] = vouchersQuery.data?.items ?? [];

  const loading = vouchersQuery.isLoading || vouchersQuery.isFetching;
  const total = vouchersQuery.data?.total ?? 0;
  const totalPages = vouchersQuery.data?.totalPages ?? 1;

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
  async function openGrDetail(id: string, viewOnly: boolean) {
    setGrViewOnly(viewOnly);
    setGrSaveError(null);
    setGrDrawerLoading(true);
    setGrDrawerOpen(true);
    void loadGrLookups();
    try {
      const detail = await goodsReceiptsCoreApi.get(id);
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
  async function openGiDetail(id: string, viewOnly: boolean) {
    setGiViewOnly(viewOnly);
    setGiSaveError(null);
    setGiDrawerLoading(true);
    setGiDrawerOpen(true);
    void loadGiLookups();
    try {
      const detail = await goodsIssuesCoreApi.get(id);
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
  async function handleGrSave(statusOverride?: string) {
    setGrSaving(true);
    setGrSaveError(null);
    try {
      const payload = buildGrPayload(grForm);
      if (statusOverride) {
        (payload as any).status = statusOverride;
      }
      if (grEditing) {
        await goodsReceiptsCoreApi.update(grEditing.id, payload);
        if (statusOverride === "POSTED") {
          await goodsReceiptsCoreApi.post(grEditing.id);
        }
        showToast({ title: "Đã cập nhật phiếu nhập kho", variant: "success" });
      } else {
        if (!payload.receiptNo)
          payload.receiptNo = await goodsReceiptsCoreApi.nextNo(
            grForm.receiptDate,
          );
        const created = await goodsReceiptsCoreApi.create(payload);
        if (statusOverride === "POSTED") {
          await goodsReceiptsCoreApi.post(created.id);
        }
        showToast({
          title: "Tạo phiếu nhập kho thành công",
          variant: "success",
        });
      }
      setGrDrawerOpen(false);
      await queryClient.invalidateQueries({
        queryKey: ["warehouse-vouchers", "receipts"],
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
        queryKey: ["warehouse-vouchers", "unified"],
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
      setCancelTarget(null);
      await queryClient.invalidateQueries({
        queryKey: ["warehouse-vouchers", "receipts"],
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
  async function handleGiSave(statusOverride?: string) {
    setGiSaving(true);
    setGiSaveError(null);
    try {
      const payload = buildGiPayload(giForm);
      if (statusOverride) {
        (payload as any).status = statusOverride;
      }
      if (giEditing) {
        await goodsIssuesCoreApi.update(giEditing.id, payload);
        if (statusOverride === "POSTED") {
          await goodsIssuesCoreApi.post(giEditing.id);
        }
        showToast({ title: "Đã cập nhật phiếu xuất kho", variant: "success" });
      } else {
        const created = await goodsIssuesCoreApi.create(payload);
        if (statusOverride === "POSTED") {
          await goodsIssuesCoreApi.post(created.id);
        }
        showToast({
          title: "Tạo phiếu xuất kho thành công",
          variant: "success",
        });
      }
      setGiDrawerOpen(false);
      await queryClient.invalidateQueries({
        queryKey: ["warehouse-vouchers", "issues"],
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
        queryKey: ["warehouse-vouchers", "unified"],
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
      if (deleteTarget.type === "receipt") {
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
        key: "type",
        header: "Loại",
        className: "w-[110px]",
        cell: (row) => <KindBadge kind={row.type} />,
      },
      {
        key: "voucherNo",
        header: "Số phiếu",
        className: "w-[160px] font-mono text-sm",
        sortable: true,
        sortKey: "voucherNo",
        cell: (row) => (
          <div className="flex items-center gap-2">
            <span>{row.voucherNo}</span>
            {row.status === "DRAFT" && (
              <span className="inline-flex rounded-md bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-800">
                Nháp
              </span>
            )}
            {row.status === "CANCELLED" && (
              <span className="inline-flex rounded-md bg-red-100 px-1.5 py-0.5 text-[10px] font-medium text-red-800">
                Đã Hủy
              </span>
            )}
          </div>
        ),
      },
      {
        key: "date",
        header: "Ngày",
        className: "w-[110px]",
        sortable: true,
        sortKey: "date",
        cell: (row) => fmtDate(row.date),
      },
      {
        key: "partnerName",
        header: "Đối tác",
        cell: (row) => row.partnerName ?? "—",
      },
      {
        key: "remarks",
        header: "Ghi chú",
        cell: (row) => row.remarks ?? "—",
      },
    ],
    [],
  );

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
          label: "Lưu nháp",
          onClick: () => void handleGrSave("DRAFT"),
          variant: "secondary",
          loading: grSaving,
        },
        {
          label: grEditing ? "Cập nhật" : "Tạo mới",
          onClick: () => void handleGrSave("POSTED"),
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
          label: "Lưu nháp",
          onClick: () => void handleGiSave("DRAFT"),
          variant: "secondary",
          loading: giSaving,
        },
        {
          label: giEditing ? "Cập nhật" : "Tạo mới",
          onClick: () => void handleGiSave("POSTED"),
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
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              className="px-3 py-2"
              disabled={loading}
              onClick={() => void vouchersQuery.refetch()}
            >
              <RefreshCcw
                className={cn("h-3.5 w-3.5 mr-1.5", loading && "animate-spin")}
              />
              <span>Tải lại</span>
            </Button>
            <FilterButton
              onClick={() => filterPanel.togglePanel()}
              activeCount={filterPanel.activeFilterCount}
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
        }
      >
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
              getRowKey={(r) => `${r.type}-${r.id}`}
              loading={loading}
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSort={(key) => {
                if (sortBy === key) {
                  setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
                } else {
                  setSortBy(key);
                  setSortOrder("asc");
                }
              }}
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
                        label: "Chi tiết",
                        icon: <Eye className="h-3.5 w-3.5" />,
                        onClick: () => {
                          if (row.type === "receipt")
                            void openGrDetail(row.id, true);
                          else if (row.type === "issue")
                            void openGiDetail(row.id, true);
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
                          row.type !== "receipt" || row.status !== "POSTED",
                        onClick: () => setCancelTarget(row),
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
          <FilterPanel config={filterConfig} filter={filterPanel} />
        </div>
      </PageLayout>

      <ConfirmModal
        open={!!deleteTarget}
        title="Xác nhận xóa"
        message={
          deleteTarget
            ? `Xóa ${deleteTarget.type === "receipt" ? "phiếu nhập" : "phiếu xuất"} "${deleteTarget.voucherNo}"? Hành động này sẽ ẩn phiếu này khỏi danh sách.`
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

      <ConfirmModal
        open={!!cancelTarget}
        title="Xác nhận hủy phiếu"
        message={
          cancelTarget
            ? `Hủy ${cancelTarget.type === "receipt" ? "phiếu nhập" : "phiếu xuất"} "${cancelTarget.voucherNo}"? Hệ thống sẽ tạo một bút toán đảo để cân bằng giá trị.`
            : ""
        }
        confirmLabel="Hủy phiếu"
        cancelLabel="Đóng"
        onConfirm={() => {
          if (cancelTarget && cancelTarget.type === "receipt") {
            void handleGrCancel(cancelTarget.id);
          }
        }}
        onCancel={() => {
          if (!grCancelId) setCancelTarget(null);
        }}
        loading={!!grCancelId}
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
        subtitle={
          <div className="flex items-center gap-2">
            <span>{grEditing?.receiptNo ?? "Nhập kho"}</span>
            {grEditing?.status === "DRAFT" && (
              <span className="inline-flex rounded-md bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-800">
                Nháp
              </span>
            )}
          </div>
        }
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
              <DrawerSection title="Chi tiết">
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
                title={`Chi tiết (${grForm.lines.length})`}
                titleExtra={
                  !grViewOnly && grPoDetail ? (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 text-[11px] px-2 leading-none text-muted-foreground hover:text-foreground"
                        onClick={() => {
                          setGrForm((f) => ({
                            ...f,
                            lines: f.lines.map((l) => ({
                              ...l,
                              qtyReceived: "",
                            })),
                          }));
                        }}
                      >
                        Đặt lại
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-6 text-[11px] px-2 leading-none"
                        onClick={() => {
                          setGrForm((f) => {
                            const newLines = (grPoDetail.lines || []).map(
                              (poLine) => {
                                const ordered = Number(poLine.qtyOrdered ?? 0);
                                const received = Number(
                                  poLine.qtyReceived ?? 0,
                                );
                                const remaining = Math.max(
                                  0,
                                  ordered - received,
                                );
                                return {
                                  purchaseOrderLineId: poLine.id ?? "",
                                  itemId: poLine.itemId ?? "",
                                  itemName: poLine.itemName ?? "",
                                  qtyReceived:
                                    remaining > 0 ? remaining.toString() : "",
                                  unitCost: poLine.unitPrice ?? "",
                                };
                              },
                            );
                            return { ...f, lines: newLines };
                          });
                        }}
                      >
                        Nhập hết
                      </Button>
                    </div>
                  ) : undefined
                }
              >
                {grPoDetail ? (
                  <DocumentLineTable
                    data={grPoDetail.lines || []}
                    getRowKey={(line) => line.id || ""}
                    viewOnly={true}
                    columns={[
                      {
                        key: "index",
                        header: "#",
                        width: 40,
                        align: "center",
                        cell: (_, idx) => (
                          <span className="text-muted-foreground">
                            {idx + 1}
                          </span>
                        ),
                      },
                      {
                        key: "itemCode",
                        header: "Mã linh kiện",
                        minWidth: 140,
                        cell: (poLine) => {
                          const itemCode =
                            poLine.itemId && itemsDict[poLine.itemId]
                              ? itemsDict[poLine.itemId].sku
                              : "—";
                          return <span>{itemCode}</span>;
                        },
                      },
                      {
                        key: "itemName",
                        header: "Tên linh kiện",
                        minWidth: 260,
                        cell: (poLine) => {
                          const itemName =
                            poLine.itemName ||
                            poLine.description ||
                            poLine.itemId ||
                            "—";
                          return (
                            <div
                              className="font-medium text-foreground truncate max-w-[260px]"
                              title={itemName}
                            >
                              {itemName}
                            </div>
                          );
                        },
                      },
                      {
                        key: "ordered",
                        header: "Đã đặt",
                        minWidth: 100,
                        align: "center",
                        cell: (poLine) => (
                          <div className="font-medium text-foreground">
                            {Number(poLine.qtyOrdered ?? 0).toLocaleString(
                              "vi-VN",
                            )}
                          </div>
                        ),
                      },
                      {
                        key: "remaining",
                        header: "Còn lại",
                        minWidth: 100,
                        align: "center",
                        cell: (poLine) => {
                          const ordered = Number(poLine.qtyOrdered ?? 0);
                          const received = Number(poLine.qtyReceived ?? 0);
                          const remaining = Math.max(0, ordered - received);
                          return (
                            <div className="font-medium text-amber-600">
                              {remaining.toLocaleString("vi-VN")}
                            </div>
                          );
                        },
                      },
                      {
                        key: "qtyInput",
                        header: "SL Nhập",
                        minWidth: 140,
                        align: "center",
                        cell: (poLine) => {
                          const lineIdx = grForm.lines.findIndex(
                            (l) => l.purchaseOrderLineId === poLine.id,
                          );
                          const currentLine =
                            lineIdx >= 0 ? grForm.lines[lineIdx] : null;

                          if (!grViewOnly) {
                            const ordered = Number(poLine.qtyOrdered ?? 0);
                            const received = Number(poLine.qtyReceived ?? 0);
                            const remaining = Math.max(0, ordered - received);

                            return (
                              <input
                                type="number"
                                min={0}
                                max={remaining}
                                className={cn(
                                  inputCls,
                                  "w-28 flex-shrink-0 text-right mx-auto",
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
                            );
                          }
                          return currentLine &&
                            Number(currentLine.qtyReceived) > 0 ? (
                            <div className="font-medium text-emerald-600">
                              +{fmtQty(currentLine.qtyReceived)}
                            </div>
                          ) : null;
                        },
                      },
                    ]}
                  />
                ) : grViewOnly ? (
                  <DocumentLineTable
                    data={grForm.lines.filter((l) => Number(l.qtyReceived) > 0)}
                    getRowKey={(_, i) => i}
                    viewOnly={true}
                    columns={[
                      {
                        key: "index",
                        header: "#",
                        width: 40,
                        align: "center",
                        cell: (_, i) => (
                          <span className="text-muted-foreground">{i + 1}</span>
                        ),
                      },
                      {
                        key: "itemCode",
                        header: "Mã linh kiện",
                        minWidth: 140,
                        cell: (line) => {
                          const itemCode =
                            line.itemId && itemsDict[line.itemId]
                              ? itemsDict[line.itemId].sku
                              : "—";
                          return <span>{itemCode}</span>;
                        },
                      },
                      {
                        key: "itemName",
                        header: "Tên linh kiện",
                        minWidth: 260,
                        cell: (line) => {
                          const itemName = line.itemName || line.itemId || "—";
                          return (
                            <div
                              className="font-medium text-foreground truncate max-w-[260px]"
                              title={itemName}
                            >
                              {itemName}
                            </div>
                          );
                        },
                      },
                      {
                        key: "ordered",
                        header: "Đã đặt",
                        minWidth: 100,
                        align: "center",
                        cell: () => "—",
                      },
                      {
                        key: "remaining",
                        header: "Còn lại",
                        minWidth: 100,
                        align: "center",
                        cell: () => "—",
                      },
                      {
                        key: "qtyReceived",
                        header: "SL Nhập",
                        minWidth: 140,
                        align: "center",
                        cell: (line) => (
                          <div className="font-medium text-emerald-600">
                            +{fmtQty(line.qtyReceived)}
                          </div>
                        ),
                      },
                    ]}
                  />
                ) : (
                  <div className="rounded-xl border border-dashed border-border px-4 py-6 text-sm text-center text-muted-foreground">
                    Chọn PO để hiện danh sách hàng cần nhận.
                  </div>
                )}
              </DrawerSection>
            </div>

            <div
              className={cn(
                "shrink-0 order-1 xl:order-2 space-y-4 transition-all duration-300 xl:sticky xl:top-0",
                showGrGeneralInfo
                  ? "w-full xl:w-[320px]"
                  : "w-full xl:w-[52px]",
              )}
            >
              <DrawerSection
                title={
                  <span
                    className={cn(
                      "transition-all duration-300 inline-block overflow-hidden whitespace-nowrap align-middle",
                      showGrGeneralInfo
                        ? "max-w-[200px] opacity-100"
                        : "max-w-0 opacity-0",
                    )}
                  >
                    Thông tin chung
                  </span>
                }
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
                <div
                  className={cn(
                    "grid transition-all duration-300 ease-in-out",
                    showGrGeneralInfo ? "opacity-100" : "opacity-0",
                  )}
                  style={{
                    gridTemplateRows: showGrGeneralInfo ? "1fr" : "0fr",
                  }}
                >
                  <div
                    className="overflow-x-hidden overflow-y-auto w-full xl:max-h-[calc(100vh-190px)]"
                    style={{ scrollbarWidth: "none" }}
                  >
                    <div className="flex flex-col gap-3 pt-1 min-w-[280px]">
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
                            setGrForm((f) => ({
                              ...f,
                              remarks: e.target.value,
                            }))
                          }
                        />
                      </DrawerField>
                    </div>
                  </div>
                </div>
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
        subtitle={
          <div className="flex items-center gap-2">
            <span>{giEditing?.issueNo ?? "Xuất kho"}</span>
            {giEditing?.status === "DRAFT" && (
              <span className="inline-flex rounded-md bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-800">
                Nháp
              </span>
            )}
          </div>
        }
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
