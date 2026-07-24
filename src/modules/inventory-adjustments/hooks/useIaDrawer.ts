import { useState, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  inventoryAdjustmentsApi,
  type IaHeaderDto,
} from "../api/inventoryAdjustmentsApi";
import {
  inventoryCoreApi,
  type ErpInventoryItem,
} from "@/modules/inventory-core/api/inventoryCoreApi";
import { useUIStore } from "@/core/config/uiStore";
import { useBasicMasterInfinite } from "@/modules/basic-masters/hooks/useBasicMasterInfinite";
import { useMemo } from "react";

// ─── Form types ───────────────────────────────────────────────────────────────

export interface IaLineForm {
  id?: string;
  itemId: string;
  itemCode?: string;
  itemName?: string;
  qtyAdjusted: string;
  unitCost: string;
}

export interface IaForm {
  adjustmentNo: string;
  adjustmentDate: string;
  remarks: string;
  lines: IaLineForm[];
}

export function emptyIaForm(): IaForm {
  return {
    adjustmentNo: "",
    adjustmentDate: new Date().toISOString().slice(0, 10),
    remarks: "",
    lines: [],
  };
}

export function buildIaForm(adj: IaHeaderDto): IaForm {
  return {
    adjustmentNo: adj.adjustmentNo ?? "",
    adjustmentDate: adj.adjustmentDate ? adj.adjustmentDate.slice(0, 10) : "",
    remarks: adj.remarks ?? "",
    lines:
      adj.lines?.map((line) => ({
        id: line.id,
        itemId: line.itemId ?? "",
        itemCode: "",
        qtyAdjusted: line.qtyAdjusted?.toString() ?? "0",
        unitCost: line.unitCost?.toString() ?? "0",
      })) ?? [],
  };
}

export function buildIaPayload(form: IaForm): IaHeaderDto {
  return {
    adjustmentNo: form.adjustmentNo.trim(),
    adjustmentDate: form.adjustmentDate,
    remarks: form.remarks.trim() || undefined,
    lines: form.lines
      .filter((line) => {
        const qty = Number(line.qtyAdjusted);
        return !isNaN(qty) && qty !== 0;
      })
      .map((line) => ({
        itemId: line.itemId || "",
        qtyAdjusted: Number(line.qtyAdjusted),
        unitCost: Number(line.unitCost || 0),
        typeAdjust: Number(line.qtyAdjusted) > 0 ? "increase" : "decrease",
      })),
  };
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export interface UseIaDrawerOptions {
  onSaved?: () => Promise<void> | void;
  invalidateWarehouseQuery?: boolean;
}

export function useIaDrawer({
  onSaved,
  invalidateWarehouseQuery = false,
}: UseIaDrawerOptions = {}) {
  const showToast = useUIStore((s) => s.showToast);
  const queryClient = useQueryClient();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<IaHeaderDto | null>(null);
  const [viewOnly, setViewOnly] = useState(false);
  const [form, setForm] = useState<IaForm>(emptyIaForm);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [cancelId, setCancelId] = useState<string | null>(null);

  // Item options
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
        (p.items.inventoryItems || []).map((i: any) => ({
          value: i.id,
          label: `${i.sku} — ${i.itemName}`,
        })),
      ) || []
    );
  }, [itemsData]);

  const [itemsDict, setItemsDict] = useState<Record<string, ErpInventoryItem>>(
    {},
  );

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
      // ignore
    }
  }, []);

  const openCreate = useCallback(() => {
    setEditing(null);
    setViewOnly(false);
    setSaveError(null);
    setForm(emptyIaForm());
    setOpen(true);
  }, []);

  const openDetail = useCallback(
    async (id: string, viewOnlyMode = true) => {
      setViewOnly(viewOnlyMode);
      setSaveError(null);
      setLoading(true);
      setOpen(true);
      try {
        const detail = await inventoryAdjustmentsApi.getById(id);
        const data = detail.data;
        if (data.lines) {
          void fetchItemsDict(data.lines.map((l: any) => l.itemId || ""));
        }
        setEditing(data);
        setForm(buildIaForm(data));
      } finally {
        setLoading(false);
      }
    },
    [fetchItemsDict],
  );

  const close = useCallback(() => {
    setOpen(false);
  }, []);

  const handleSave = useCallback(
    async (statusOverride?: string) => {
      setSaving(true);
      setSaveError(null);
      try {
        const payload = buildIaPayload(form);
        if (editing) {
          await inventoryAdjustmentsApi.update(editing.id!, payload);
          if (statusOverride === "POSTED") {
            await inventoryAdjustmentsApi.postAdjustment(editing.id!);
          }
          showToast({
            title: "Đã cập nhật phiếu điều chỉnh",
            variant: "success",
          });
        } else {
          if (!payload.adjustmentNo) {
            const nextRes = await inventoryAdjustmentsApi.getNextNo(
              form.adjustmentDate,
            );
            payload.adjustmentNo = nextRes.nextNo;
          }
          const createdRes = await inventoryAdjustmentsApi.create(payload);
          const created = createdRes.data;
          if (statusOverride === "POSTED") {
            await inventoryAdjustmentsApi.postAdjustment(created.id);
          }
          showToast({
            title: "Tạo phiếu điều chỉnh thành công",
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
        setSaveError(
          e instanceof Error ? e.message : "Lỗi lưu phiếu điều chỉnh",
        );
      } finally {
        setSaving(false);
      }
    },
    [editing, form, invalidateWarehouseQuery, onSaved, queryClient, showToast],
  );

  const handleCancel = useCallback(
    async (id: string) => {
      setCancelId(id);
      try {
        await inventoryAdjustmentsApi.cancelAdjustment(id);
        showToast({ title: "Đã hủy phiếu điều chỉnh", variant: "success" });
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
    open,
    loading,
    editing,
    viewOnly,
    form,
    setForm,
    saveError,
    saving,
    cancelId,
    itemsDict,
    itemOptions,
    setItemSearch,
    fetchNextItems,
    loadingItems,
    openCreate,
    openDetail,
    close,
    handleSave,
    handleCancel,
    setViewOnly,
  };
}

export type UseIaDrawerReturn = ReturnType<typeof useIaDrawer>;
