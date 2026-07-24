/**
 * useGrDrawer — reusable hook for Goods Receipt (GR) form drawer.
 * Extracted from ErpWarehousePage so the same drawer can be used in
 * PurchaseOrderListPage and anywhere else that needs inline GR creation.
 */
import { useState, useEffect, useCallback } from "react";
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
import { useUIStore } from "@/core/config/uiStore";

// ─── Form types ───────────────────────────────────────────────────────────────

export type GrReceiptType = "PO" | "OTHER";

export interface GrLineForm {
  purchaseOrderLineId: string;
  productionOrderMaterialId: string;
  itemId: string;
  itemCode?: string;
  itemName: string;
  qtyReceived: string;
  unitCost: string;
}

export interface GrForm {
  receiptType: GrReceiptType;
  receiptNo: string;
  purchaseOrderId: string;
  productionOrderId: string;
  receiptDate: string;
  remarks: string;
  lines: GrLineForm[];
}

export function emptyGrForm(): GrForm {
  return {
    receiptType: "OTHER",
    receiptNo: "",
    purchaseOrderId: "",
    productionOrderId: "",
    receiptDate: new Date().toISOString().slice(0, 10),
    remarks: "",
    lines: [],
  };
}

export function buildGrForm(gr: ErpGoodsReceipt): GrForm {
  return {
    receiptType: gr.purchaseOrderId ? "PO" : "OTHER",
    receiptNo: gr.receiptNo ?? "",
    purchaseOrderId: gr.purchaseOrderId ?? "",
    productionOrderId: gr.productionOrderId ?? "",
    receiptDate: gr.receiptDate ? gr.receiptDate.slice(0, 10) : "",
    remarks: gr.remarks ?? "",
    lines:
      gr.lines?.map((line) => ({
        purchaseOrderLineId: line.purchaseOrderLineId ?? "",
        productionOrderMaterialId: line.productionOrderMaterialId ?? "",
        itemId: line.itemId ?? "",
        itemCode: "",
        itemName: line.itemName ?? "",
        qtyReceived: line.qtyReceived ?? "0",
        unitCost: line.unitCost ?? "",
      })) ?? [],
  };
}

export function buildGrPayload(form: GrForm): CreateGrPayload {
  return {
    receiptNo: form.receiptNo.trim(),
    purchaseOrderId:
      form.receiptType === "PO" ? form.purchaseOrderId || undefined : undefined,
    productionOrderId: undefined,
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

  // ── PO options (for the combobox when no purchaseOrderId is pre-set)
  const [poOptions, setPoOptions] = useState<
    Array<{ value: string; label: string }>
  >([]);

  // ── Items dict (id → item) for SKU display
  const [itemsDict, setItemsDict] = useState<Record<string, ErpInventoryItem>>(
    {},
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
    if (!form.purchaseOrderId || form.receiptType !== "PO") {
      setPoDetail(null);
      return;
    }
    purchaseOrdersCoreApi
      .get(form.purchaseOrderId)
      .then((po) => {
        setPoDetail(po);
        if (po.lines) {
          void fetchItemsDict(po.lines.map((l) => l.itemId || ""));
        }
      })
      .catch(() => setPoDetail(null));
  }, [form.purchaseOrderId, form.receiptType, fetchItemsDict, open]);

  // ── Load PO list for the combobox
  const loadPoOptions = useCallback(async () => {
    try {
      const res = await purchaseOrdersCoreApi.list({
        page: 1,
        pageSize: 500,
        exclude_status: "DRAFT",
        only_receivable: true,
      } as any);
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
      setOpen(true);
    },
    [loadPoOptions],
  );

  const openDetail = useCallback(
    async (id: string, viewOnlyMode = true) => {
      setViewOnly(viewOnlyMode);
      setSaveError(null);
      setLoading(true);
      setOpen(true);
      void loadPoOptions();
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
    [loadPoOptions, fetchItemsDict],
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
    itemsDict,
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
