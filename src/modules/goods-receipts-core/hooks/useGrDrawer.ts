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
  type ErpGrDeclaredSerial,
} from "@/modules/goods-receipts-core/api/goodsReceiptsCoreApi";
import {
  purchaseOrdersCoreApi,
  type ErpPurchaseOrder,
} from "@/modules/purchase-orders-core/api/purchaseOrdersCoreApi";
import {
  inventoryCoreApi,
  type ErpInventoryItem,
} from "@/modules/inventory-core/api/inventoryCoreApi";
import { moduleConfigApi } from "@/core/api/moduleConfigApi";
import { useUIStore } from "@/core/config/uiStore";

// ─── Form types ───────────────────────────────────────────────────────────────

export type GrReceiptType =
  | "PO"
  | "MANUFACTURING"
  | "RETURN"
  | "WARRANTY"
  | "OTHER"
  | (string & {});

export interface GrLineForm {
  purchaseOrderLineId: string;
  productionOrderMaterialId: string;
  itemId: string;
  itemCode?: string;
  itemName: string;
  qtyReceived: string;
  unitCost: string;
  declaredSerials?: ErpGrDeclaredSerial[];
}

export interface GrForm {
  receiptType: GrReceiptType;
  receiptNo: string;
  purchaseOrderId: string;
  productionOrderId: string;
  receiptDate: string;
  remarks: string;
  lines: GrLineForm[];
  globalAttributes?: Record<string, any>;
  customAttributes?: Record<string, any>;
}

export function emptyGrForm(): GrForm {
  return {
    receiptType: "" as GrReceiptType,
    receiptNo: "",
    purchaseOrderId: "",
    productionOrderId: "",
    receiptDate: new Date().toISOString().slice(0, 10),
    remarks: "",
    lines: [],
    globalAttributes: {},
    customAttributes: {},
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
        declaredSerials: line.declaredSerials ?? [],
      })) ?? [],
    globalAttributes: {},
    customAttributes: {},
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
        declaredSerials: line.declaredSerials || undefined,
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
        setPoOptions((prev) => {
          if (!prev.find((p) => p.value === po.id)) {
            return [
              ...prev,
              {
                value: po.id,
                label: `${po.poNo || po.id} — ${po.supplierName ?? ""}`,
              },
            ];
          }
          return prev;
        });
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
        (res.items || [])
          .filter((po) => {
            if (Array.isArray(po.lines)) {
              if (po.lines.length === 0) return false;
              return po.lines.some((l: any) =>
                Boolean(l.itemId || l.inventory_item_id),
              );
            }
            return true;
          })
          .map((po) => ({
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
        const [detail, customValues] = await Promise.all([
          goodsReceiptsCoreApi.get(id),
          moduleConfigApi
            .getEntityValues("GOODS_RECEIPT", id)
            .catch(() => null),
        ]);
        if (detail.lines) {
          void fetchItemsDict(detail.lines.map((l) => l.itemId || ""));
        }
        setEditing(detail);
        const mappedForm = buildGrForm(detail);
        if (customValues) {
          mappedForm.globalAttributes = customValues.globalAttributes || {};
          mappedForm.customAttributes = customValues.attributes || {};
        }
        setForm(mappedForm);
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
        if (statusOverride === "POSTED") {
          for (let i = 0; i < form.lines.length; i++) {
            const l = form.lines[i];
            const qty = Math.round(Number(l.qtyReceived || 0));
            if (qty > 0) {
              const item = l.itemId ? itemsDict[l.itemId] : null;
              const trackingCode = item?.trackingPolicy?.code;
              if (
                trackingCode === "SERIAL" ||
                trackingCode === "VEHICLE" ||
                trackingCode === "CUSTOM"
              ) {
                const declared = l.declaredSerials?.length || 0;
                if (declared < qty) {
                  const errorMsg = `Dòng ${i + 1} (${item?.sku || l.itemName || "Item"}): Chưa khai báo đủ số lượng Serial (cần ${qty}, đã có ${declared}). Vui lòng bấm vào cột Serial để khai báo.`;
                  setSaveError(errorMsg);
                  showToast({
                    title: "Chưa khai báo đủ số Serial",
                    description: errorMsg,
                    variant: "destructive",
                  });
                  setSaving(false);
                  return;
                }
              }
            }
          }
        }

        const payload = buildGrPayload(form);
        if (statusOverride) {
          (payload as any).status = statusOverride;
        }
        let targetId = "";
        if (editing) {
          await goodsReceiptsCoreApi.update(editing.id, payload);
          if (statusOverride === "POSTED" && editing.status !== "POSTED") {
            await goodsReceiptsCoreApi.post(editing.id);
          }
          targetId = editing.id;
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
          targetId = created.id;
          showToast({
            title: "Tạo phiếu nhập kho thành công",
            variant: "success",
          });
        }

        // Lưu thuộc tính tùy chỉnh nếu có
        if (targetId && (form.globalAttributes || form.customAttributes)) {
          try {
            await moduleConfigApi.saveEntityValues("GOODS_RECEIPT", targetId, {
              globalAttributes: form.globalAttributes || {},
              attributes: form.customAttributes || {},
            });
          } catch (cfErr) {
            console.warn("Failed to save GR custom fields", cfErr);
          }
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
    [
      editing,
      form,
      itemsDict,
      invalidateWarehouseQuery,
      onSaved,
      queryClient,
      showToast,
    ],
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

export type UseGrDrawerReturn = ReturnType<typeof useGrDrawer> & {
  unifiedContext?: {
    type: "receipt" | "issue" | "adjustment";
    setType: (t: "receipt" | "issue" | "adjustment") => void;
    mode: "create" | "view" | "edit";
  };
};
