/**
 * useGrDrawer — reusable hook for Goods Receipt (GR) form drawer.
 * Extracted from ErpWarehousePage so the same drawer can be used in
 * PurchaseOrderListPage and anywhere else that needs inline GR creation.
 */
import { useState, useEffect, useCallback, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  goodsReceiptsCoreApi,
  type ErpGoodsReceipt,
  type CreateGrPayload,
} from "@/modules/goods-receipts-core/api/goodsReceiptsCoreApi";
import {
  purchaseOrdersCoreApi,
  type ErpPurchaseOrder,
} from "@/modules/purchase-orders-core/api/purchaseOrdersCoreApi";
import {
  inventoryCoreApi,
  type ErpInventoryItem,
} from "@/modules/inventory-core/api/inventoryCoreApi";
import {
  productionCoreApi,
  type ErpProductionOrder,
} from "@/modules/production-core/api/productionCoreApi";
import { useBasicMasterInfinite } from "@/modules/basic-masters/hooks/useBasicMasterInfinite";
import { useUIStore } from "@/core/config/uiStore";

// ─── Form types ───────────────────────────────────────────────────────────────

export interface GrLineForm {
  purchaseOrderLineId: string;
  productionOrderMaterialId: string;
  itemId: string;
  itemName: string;
  qtyReceived: string;
  unitCost: string;
}

export interface GrForm {
  receiptNo: string;
  purchaseOrderId: string;
  productionOrderId: string;
  supplierId: string;
  receiptDate: string;
  remarks: string;
  lines: GrLineForm[];
}

export function emptyGrForm(): GrForm {
  return {
    receiptNo: "",
    purchaseOrderId: "",
    productionOrderId: "",
    supplierId: "",
    receiptDate: new Date().toISOString().slice(0, 10),
    remarks: "",
    lines: [],
  };
}

export function buildGrForm(gr: ErpGoodsReceipt): GrForm {
  return {
    receiptNo: gr.receiptNo ?? "",
    purchaseOrderId: gr.purchaseOrderId ?? "",
    productionOrderId: gr.productionOrderId ?? "",
    supplierId: gr.supplierId ?? "",
    receiptDate: gr.receiptDate ? gr.receiptDate.slice(0, 10) : "",
    remarks: gr.remarks ?? "",
    lines:
      gr.lines?.map((line) => ({
        purchaseOrderLineId: line.purchaseOrderLineId ?? "",
        productionOrderMaterialId: line.productionOrderMaterialId ?? "",
        itemId: line.itemId ?? "",
        itemName: line.itemName ?? "",
        qtyReceived: line.qtyReceived ?? "0",
        unitCost: line.unitCost ?? "",
      })) ?? [],
  };
}

export function buildGrPayload(form: GrForm): CreateGrPayload {
  return {
    receiptNo: form.receiptNo.trim(),
    purchaseOrderId: form.purchaseOrderId || undefined,
    productionOrderId: form.productionOrderId || undefined,
    supplierId: form.supplierId || undefined,
    receiptDate: form.receiptDate,
    remarks: form.remarks.trim() || undefined,
    lines: form.lines
      .filter((line) => {
        const qty = Number(line.qtyReceived);
        return !isNaN(qty) && qty > 0;
      })
      .map((line) => ({
        purchaseOrderLineId: line.purchaseOrderLineId || undefined,
        productionOrderMaterialId: line.productionOrderMaterialId || undefined,
        itemId: line.itemId || undefined,
        qtyReceived: line.qtyReceived,
        unitCost: line.unitCost || undefined,
      })),
  };
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export interface UseGrDrawerOptions {
  /** Called after a successful save/post so the caller can invalidate its own queries. */
  onSaved?: () => Promise<void> | void;
  /** Invalidate warehouse-vouchers query automatically (used by ErpWarehousePage). */
  invalidateWarehouseQuery?: boolean;
}

export function useGrDrawer({
  onSaved,
  invalidateWarehouseQuery = false,
}: UseGrDrawerOptions = {}) {
  const showToast = useUIStore((s) => s.showToast);
  const queryClient = useQueryClient();

  // ── Drawer state
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<ErpGoodsReceipt | null>(null);
  const [viewOnly, setViewOnly] = useState(false);
  const [form, setForm] = useState<GrForm>(emptyGrForm);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [cancelId, setCancelId] = useState<string | null>(null);
  const [poDetail, setPoDetail] = useState<ErpPurchaseOrder | null>(null);
  const [moDetail, setMoDetail] = useState<ErpProductionOrder | null>(null);

  // ── PO options (for the combobox when no purchaseOrderId is pre-set)
  const [poOptions, setPoOptions] = useState<
    Array<{ value: string; label: string }>
  >([]);

  // ── MO options
  const [moOptions, setMoOptions] = useState<
    Array<{ value: string; label: string }>
  >([]);

  // ── Items dict (id → item) for SKU display
  const [itemsDict, setItemsDict] = useState<Record<string, ErpInventoryItem>>(
    {},
  );

  // ── Supplier infinite lookup
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

  const supplierOptions = useMemo(
    () =>
      suppliersData?.pages.flatMap((p) =>
        (p.items.suppliers || []).map((s) => ({ value: s.id, label: s.name })),
      ) ?? [],
    [suppliersData],
  );

  // ── Fetch item SKUs
  const fetchItemsDict = useCallback(async (itemIds: string[]) => {
    const ids = [...new Set(itemIds)].filter(Boolean);
    if (!ids.length) return;
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
    } catch {
      /* ignore */
    }
  }, []);

  // ── Load PO detail when purchaseOrderId changes or drawer opens
  useEffect(() => {
    if (!open) return;
    if (!form.purchaseOrderId) {
      setPoDetail(null);
      return;
    }
    purchaseOrdersCoreApi
      .get(form.purchaseOrderId)
      .then((po) => {
        setPoDetail(po);
        if (po.supplierId) {
          setForm((f) => ({ ...f, supplierId: po.supplierId || "" }));
        }
        if (po.lines) {
          void fetchItemsDict(po.lines.map((l) => l.itemId || ""));
        }
      })
      .catch(() => setPoDetail(null));
  }, [form.purchaseOrderId, fetchItemsDict, open]);

  // ── Load MO detail when productionOrderId changes or drawer opens
  useEffect(() => {
    if (!open) return;
    if (!form.productionOrderId) {
      setMoDetail(null);
      return;
    }
    productionCoreApi
      .get(form.productionOrderId)
      .then((mo) => {
        setMoDetail(mo);
        if (mo.lines) {
          void fetchItemsDict(mo.lines.map((l) => l.itemId || ""));
        }
      })
      .catch(() => setMoDetail(null));
  }, [form.productionOrderId, fetchItemsDict, open]);

  // ── Load PO list for the combobox
  const loadPoOptions = useCallback(async () => {
    try {
      const res = await purchaseOrdersCoreApi.list({
        page: 1,
        pageSize: 200,
        exclude_status: "DRAFT",
      });
      setPoOptions(
        res.items.map((po) => ({
          value: po.id,
          label: `${po.poNo || po.id} — ${po.supplierName ?? ""}`,
        })),
      );
    } catch {
      /* silent */
    }
  }, []);

  // ── Load MO list for the combobox
  const loadMoOptions = useCallback(async () => {
    try {
      const res = await productionCoreApi.list({
        page: 1,
        pageSize: 200,
        exclude_status: "DRAFT",
      });
      setMoOptions(
        res.items.map((mo) => ({
          value: mo.id,
          label: mo.referenceNo || mo.id,
        })),
      );
    } catch {
      /* silent */
    }
  }, []);

  // ── Open helpers
  const openCreate = useCallback(
    (prefillPurchaseOrderId?: string, prefillProductionOrderId?: string) => {
      setEditing(null);
      setViewOnly(false);
      setSaveError(null);
      const initial = emptyGrForm();
      if (prefillPurchaseOrderId)
        initial.purchaseOrderId = prefillPurchaseOrderId;
      if (prefillProductionOrderId)
        initial.productionOrderId = prefillProductionOrderId;
      setForm(initial);
      void loadPoOptions();
      void loadMoOptions();
      setOpen(true);
    },
    [loadPoOptions, loadMoOptions],
  );

  const openDetail = useCallback(
    async (id: string, viewOnlyMode = true) => {
      setViewOnly(viewOnlyMode);
      setSaveError(null);
      setLoading(true);
      setOpen(true);
      void loadPoOptions();
      void loadMoOptions();
      try {
        const detail = await goodsReceiptsCoreApi.get(id);
        if (detail.lines) {
          void fetchItemsDict(detail.lines.map((l) => l.itemId || ""));
        }
        setEditing(detail);
        setForm(buildGrForm(detail));
      } finally {
        setLoading(false);
      }
    },
    [loadPoOptions, loadMoOptions, fetchItemsDict],
  );

  const close = useCallback(() => {
    setOpen(false);
  }, []);

  // ── Save / post
  const handleSave = useCallback(
    async (statusOverride?: string) => {
      setSaving(true);
      setSaveError(null);
      try {
        const payload = buildGrPayload(form);
        if (statusOverride) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (payload as any).status = statusOverride;
        }
        if (editing) {
          await goodsReceiptsCoreApi.update(editing.id, payload);
          if (statusOverride === "POSTED") {
            await goodsReceiptsCoreApi.post(editing.id);
          }
          showToast({
            title: "Đã cập nhật phiếu nhập kho",
            variant: "success",
          });
        } else {
          if (!payload.receiptNo) {
            payload.receiptNo = await goodsReceiptsCoreApi.nextNo(
              form.receiptDate,
            );
          }
          const created = await goodsReceiptsCoreApi.create(payload);
          if (statusOverride === "POSTED") {
            await goodsReceiptsCoreApi.post(created.id);
          }
          showToast({
            title: "Tạo phiếu nhập kho thành công",
            variant: "success",
          });
        }
        setOpen(false);
        if (invalidateWarehouseQuery) {
          await queryClient.invalidateQueries({
            queryKey: ["warehouse-vouchers", "unified"],
          });
        }
        await onSaved?.();
      } catch (e) {
        setSaveError(e instanceof Error ? e.message : "Lỗi lưu phiếu nhập kho");
      } finally {
        setSaving(false);
      }
    },
    [editing, form, invalidateWarehouseQuery, onSaved, queryClient, showToast],
  );

  // ── Cancel a posted GR
  const handleCancel = useCallback(
    async (id: string) => {
      setCancelId(id);
      try {
        await goodsReceiptsCoreApi.cancel(id);
        showToast({ title: "Đã hủy phiếu nhập kho", variant: "success" });
        if (invalidateWarehouseQuery) {
          await queryClient.invalidateQueries({
            queryKey: ["warehouse-vouchers", "unified"],
          });
        }
        await onSaved?.();
      } catch (e) {
        showToast({
          title: e instanceof Error ? e.message : "Lỗi hủy phiếu",
          variant: "destructive",
        });
      } finally {
        setCancelId(null);
      }
    },
    [invalidateWarehouseQuery, onSaved, queryClient, showToast],
  );

  return {
    // state
    open,
    loading,
    editing,
    viewOnly,
    form,
    setForm,
    saveError,
    saving,
    cancelId,
    poDetail,
    poOptions,
    moDetail,
    moOptions,
    itemsDict,
    supplierOptions,
    supplierSearch,
    setSupplierSearch,
    fetchNextSuppliers,
    loadingSuppliers,
    // actions
    openCreate,
    openDetail,
    close,
    handleSave,
    handleCancel,
    setViewOnly,
  };
}

export type UseGrDrawerReturn = ReturnType<typeof useGrDrawer>;
