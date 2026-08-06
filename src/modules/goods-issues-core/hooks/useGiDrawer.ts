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
import {
  productionCoreApi,
  type ProductionOrderMasterOption,
} from "@/modules/production-core/api/productionCoreApi";
import { salesOrdersCoreApi } from "@/modules/sales-orders-core/api/salesOrdersCoreApi";
import { useBasicMasterInfinite } from "@/modules/basic-masters/hooks/useBasicMasterInfinite";
import { useT } from "@/core/i18n";

const LOOKUP_LIMIT = 200;

export interface GiLineForm {
  salesOrderLineId: string;
  productionOrderMaterialId: string;
  itemId: string;
  itemCode?: string;
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
  salesOrderId: string;
  productionOrderId: string;
  status: string;
  remarks: string;
  lines: GiLineForm[];
}

export function isMoLinkedGiLocked(
  gi?: Pick<ErpGoodsIssue, "productionOrderId" | "status"> | null,
) {
  return Boolean(gi?.productionOrderId) || !gi || gi.status !== "DRAFT";
}

export const emptyGiLine = (): GiLineForm => ({
  salesOrderLineId: "",
  productionOrderMaterialId: "",
  itemId: "",
  itemCode: "",
  itemName: "",
  serialId: "",
  vehicleId: "",
  qtyIssued: "1",
  unitCost: "",
});

export const emptyGiForm = (): GiForm => ({
  issueNo: "",
  issueDate: new Date().toISOString().slice(0, 10),
  issueType: "",
  salesOrderId: "",
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
    salesOrderId: gi.salesOrderId ?? "",
    productionOrderId: gi.productionOrderId ?? "",
    status: gi.status ?? "DRAFT",
    remarks: gi.remarks ?? "",
    lines: gi.lines?.length
      ? gi.lines.map((line) => ({
          salesOrderLineId: line.salesOrderLineId ?? "",
          productionOrderMaterialId: line.productionOrderMaterialId ?? "",
          itemId: line.itemId ?? "",
          itemCode: "",
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
    salesOrderId:
      form.issueType === "SALE" ? form.salesOrderId || undefined : undefined,
    productionOrderId:
      form.issueType === "PRODUCTION"
        ? form.productionOrderId || undefined
        : undefined,
    status: form.status || "DRAFT",
    remarks: form.remarks.trim() || undefined,
    lines: form.lines
      .filter((line) => {
        const qty = Number(line.qtyIssued);
        return !Number.isNaN(qty) && qty > 0;
      })
      .map((line) => ({
        salesOrderLineId: line.salesOrderLineId || undefined,
        productionOrderMaterialId: line.productionOrderMaterialId || undefined,
        itemId: line.itemId || undefined,
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

  // SO options
  const [soOptions, setSoOptions] = useState<
    Array<{ value: string; label: string }>
  >([]);

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
  const [moOptions, setMoOptions] = useState<ProductionOrderMasterOption[]>([]);

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

      const moOptions = await productionCoreApi.listMasterOptions({
        page: 1,
        pageSize: LOOKUP_LIMIT,
        status: "CONFIRMED",
      });
      setMoOptions(moOptions);

      const soRes = await salesOrdersCoreApi.list({
        page: 1,
        pageSize: LOOKUP_LIMIT,
        notFullyIssued: true,
      } as any);
      const soList = soRes.items ?? [];
      setSoOptions(
        soList.map((so: any) => ({
          value: so.id,
          label: `${so.soNo}${so.customerName ? ` - ${so.customerName}` : ""}`,
        })),
      );
    } catch {
      /* silent */
    }
  }, []);

  const handleSoChange = useCallback(
    async (soId: string) => {
      setForm((f) => ({ ...f, salesOrderId: soId }));
      if (!soId) return;
      try {
        setLoading(true);
        const so = await salesOrdersCoreApi.get(soId);
        const newLines: GiLineForm[] = [];
        for (const l of so.lines || []) {
          const qtyToDeliver =
            Number(l.qtyOrdered || 0) - Number(l.qtyDelivered || 0);
          if (qtyToDeliver <= 0) continue;

          const serials = Array.isArray(l.selectedSerialIds)
            ? l.selectedSerialIds
            : [];
          if (serials.length > 0) {
            for (const sid of serials) {
              newLines.push({
                ...emptyGiLine(),
                salesOrderLineId: l.id || "",
                itemId: l.itemId || "",
                itemCode: "",
                itemName: l.itemName || "",
                qtyIssued: "1",
                unitCost: l.unitPrice || "",
                serialId: sid,
              });
            }
          } else {
            newLines.push({
              ...emptyGiLine(),
              salesOrderLineId: l.id || "",
              itemId: l.itemId || "",
              itemCode: "",
              itemName: l.itemName || "",
              qtyIssued: String(qtyToDeliver),
              unitCost: l.unitPrice || "",
            });
          }
        }
        setForm((f) => ({
          ...f,
          lines: newLines.length > 0 ? newLines : [emptyGiLine()],
        }));
      } catch {
        showToast({
          title: "Lỗi",
          description: "Lỗi tải thông tin Đơn bán",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    },
    [showToast],
  );

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
      await loadGiLookups();
      try {
        const detail = await goodsIssuesCoreApi.get(id);
        setEditing(detail);
        setForm(buildGiForm(detail));

        if (detail.salesOrderId) {
          salesOrdersCoreApi
            .get(detail.salesOrderId)
            .then((so) => {
              setSoOptions((prev) => {
                if (prev.some((o) => o.value === so.id)) return prev;
                return [
                  ...prev,
                  {
                    value: so.id,
                    label: `${so.soNo}${so.customerName ? ` - ${so.customerName}` : ""}`,
                  },
                ];
              });
            })
            .catch(() => {});
        }
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
        window.dispatchEvent(new CustomEvent("refresh_erp_data"));
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
    soOptions,
    customerSearch: "",
    setCustomerSearch: () => {},
    fetchNextCustomers: () => {},
    handleSoChange,
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

export type UseGiDrawerReturn = ReturnType<typeof useGiDrawer> & {
  unifiedContext?: {
    type: "receipt" | "issue" | "adjustment";
    setType: (t: "receipt" | "issue" | "adjustment") => void;
    mode: "create" | "view" | "edit";
  };
};
