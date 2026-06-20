import { useState, useCallback, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useUIStore } from "@/core/config/uiStore";
import {
  goodsIssuesCoreApi,
  type CreateGiPayload,
  type ErpGoodsIssue,
} from "@/modules/goods-issues-core/api/goodsIssuesCoreApi";
import { manufacturingApi } from "@/modules/manufacturing/api/manufacturingApi";
import type { ErpVehicle } from "@/modules/manufacturing/api/manufacturingApi";
import { productionCoreApi } from "@/modules/production-core/api/productionCoreApi";
import { useBasicMasterInfinite } from "@/modules/basic-masters/hooks/useBasicMasterInfinite";
import { useT } from "@/core/i18n";

const LOOKUP_LIMIT = 200;

export interface GiLineForm {
  salesOrderLineId: string;
  productionOrderMaterialId: string;
  itemId: string;
  itemName: string;
  serialId: string;
  vehicleId: string;
  qtyIssued: string;
  unitCost: string;
}

export interface GiForm {
  issueNo: string;
  issueDate: string;
  issueType: string;
  customerId: string;
  productionOrderId: string;
  status: string;
  remarks: string;
  lines: GiLineForm[];
}

export const emptyGiLine = (): GiLineForm => ({
  salesOrderLineId: "",
  productionOrderMaterialId: "",
  itemId: "",
  itemName: "",
  serialId: "",
  vehicleId: "",
  qtyIssued: "1",
  unitCost: "",
});

export const emptyGiForm = (): GiForm => ({
  issueNo: "",
  issueDate: new Date().toISOString().slice(0, 10),
  issueType: "SALE",
  customerId: "",
  productionOrderId: "",
  status: "DRAFT",
  remarks: "",
  lines: [emptyGiLine()],
});

export function buildGiForm(gi: ErpGoodsIssue): GiForm {
  return {
    issueNo: gi.issueNo ?? "",
    issueDate: gi.issueDate ? gi.issueDate.slice(0, 10) : "",
    issueType: gi.issueType ?? "SALE",
    customerId: gi.customerId ?? "",
    productionOrderId: gi.productionOrderId ?? "",
    status: gi.status ?? "DRAFT",
    remarks: gi.remarks ?? "",
    lines: gi.lines?.length
      ? gi.lines.map((line) => ({
          salesOrderLineId: line.salesOrderLineId ?? "",
          productionOrderMaterialId: line.productionOrderMaterialId ?? "",
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

export function buildGiPayload(form: GiForm): CreateGiPayload {
  return {
    issueNo: form.issueNo.trim(),
    issueDate: form.issueDate,
    issueType: form.issueType || "SALE",
    customerId: form.customerId || undefined,
    productionOrderId: form.productionOrderId || undefined,
    status: form.status || "DRAFT",
    remarks: form.remarks.trim() || undefined,
    lines: form.lines.map((line) => ({
      salesOrderLineId: line.salesOrderLineId || undefined,
      productionOrderMaterialId: line.productionOrderMaterialId || undefined,
      itemId: line.itemId || undefined,
      itemName: line.itemName || undefined,
      serialId: line.serialId || undefined,
      vehicleId: line.vehicleId || undefined,
      qtyIssued: line.qtyIssued,
      unitCost: line.unitCost || undefined,
    })),
  };
}

export interface UseGiDrawerOptions {
  invalidateWarehouseQuery?: boolean;
}

export function useGiDrawer({
  invalidateWarehouseQuery = false,
}: UseGiDrawerOptions = {}) {
  const t = useT();
  const showToast = useUIStore((s) => s.showToast);
  const queryClient = useQueryClient();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<ErpGoodsIssue | null>(null);
  const [viewOnly, setViewOnly] = useState(false);
  const [form, setForm] = useState<GiForm>(emptyGiForm);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Customer options
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
  const itemOptions = useMemo(
    () =>
      itemsData?.pages.flatMap((p) =>
        (p.items.inventoryItems || []).map((i) => ({
          value: i.id,
          label: `${i.sku} — ${i.itemName}`,
        })),
      ) ?? [],
    [itemsData],
  );

  // Vehicle options
  const [vehicleOptions, setVehicleOptions] = useState<
    Array<{ value: string; label: string }>
  >([]);

  // Production Order options
  const [moOptions, setMoOptions] = useState<
    Array<{
      value: string;
      label: string;
      details: ErpGoodsIssue | Record<string, unknown>;
    }>
  >([]);

  const loadGiLookups = useCallback(async () => {
    try {
      const vehRes = await manufacturingApi.listVehicles({
        page: 1,
        pageSize: LOOKUP_LIMIT,
      });
      const vehList = vehRes.items ?? [];
      setVehicleOptions(
        vehList.map((v: ErpVehicle) => ({
          value: v.id,
          label: `${v.frame_no ?? v.vin ?? v.id}${v.engine_no ? ` / ${v.engine_no}` : ""}`,
        })),
      );

      const moRes = await productionCoreApi.list({
        page: 1,
        pageSize: LOOKUP_LIMIT,
      });
      const moList = moRes.items ?? [];
      setMoOptions(
        moList.map((m: Record<string, unknown>) => ({
          value: String(m.id ?? ""),
          label: String(m.referenceNo ?? m.id ?? ""),
          details: m,
        })),
      );
    } catch {
      /* silent */
    }
  }, []);

  const openCreate = useCallback(
    (prefillProductionOrderId?: string) => {
      setEditing(null);
      setViewOnly(false);
      const initial = emptyGiForm();
      if (prefillProductionOrderId) {
        initial.issueType = "PRODUCTION";
        initial.productionOrderId = prefillProductionOrderId;
      }
      setForm(initial);
      setSaveError(null);
      void loadGiLookups();
      setOpen(true);
    },
    [loadGiLookups],
  );

  const openDetail = useCallback(
    async (id: string, viewOnlyMode = true) => {
      setViewOnly(viewOnlyMode);
      setSaveError(null);
      setLoading(true);
      setOpen(true);
      void loadGiLookups();
      try {
        const detail = await goodsIssuesCoreApi.get(id);
        setEditing(detail);
        setForm(buildGiForm(detail));
      } finally {
        setLoading(false);
      }
    },
    [loadGiLookups],
  );

  const close = useCallback(() => {
    setOpen(false);
  }, []);

  const handleSave = useCallback(
    async (statusOverride?: string) => {
      setSaving(true);
      setSaveError(null);
      try {
        const payload = buildGiPayload(form);
        if (statusOverride) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (payload as any).status = statusOverride;
        }
        if (editing) {
          await goodsIssuesCoreApi.update(editing.id, payload);
          if (statusOverride === "POSTED") {
            await goodsIssuesCoreApi.post(editing.id);
          }
          showToast({
            title: t("Đã cập nhật phiếu xuất kho"),
            variant: "success",
          });
        } else {
          const created = await goodsIssuesCoreApi.create(payload);
          if (statusOverride === "POSTED") {
            await goodsIssuesCoreApi.post(created.id);
          }
          showToast({
            title: t("Tạo phiếu xuất kho thành công"),
            variant: "success",
          });
        }
        setOpen(false);
        if (invalidateWarehouseQuery) {
          await queryClient.invalidateQueries({
            queryKey: ["warehouse-vouchers", "unified"],
          });
        }
      } catch (e) {
        setSaveError(
          e instanceof Error ? e.message : t("Lỗi lưu phiếu xuất kho"),
        );
      } finally {
        setSaving(false);
      }
    },
    [editing, form, invalidateWarehouseQuery, queryClient, showToast, t],
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
    customerOptions,
    customerSearch,
    setCustomerSearch,
    fetchNextCustomers,
    loadingCustomers,
    itemOptions,
    itemSearch,
    setItemSearch,
    fetchNextItems,
    loadingItems,
    vehicleOptions,
    moOptions,
    openCreate,
    openDetail,
    close,
    handleSave,
    setViewOnly,
  };
}

export type UseGiDrawerReturn = ReturnType<typeof useGiDrawer>;
