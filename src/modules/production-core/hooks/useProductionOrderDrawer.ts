import { useState, useCallback, useEffect } from "react";
import { useUIStore } from "@/core/config/uiStore";
import {
  productionCoreApi,
  type ErpProductionOrder,
} from "@/modules/production-core/api/productionCoreApi";
import { useAppStore } from "@/core/config/appStore";
import { bomCoreApi } from "@/modules/bom-core/api/bomCoreApi";
import { inventoryCoreApi } from "@/modules/inventory-core/api/inventoryCoreApi";

type ProductionDrawerForm = ReturnType<typeof emptyForm>;

export interface BomLikeLine {
  id?: string;
  itemId?: string;
  itemName?: string | null;
  qtyRequired?: string | null;
  qtyIssued?: string | null;
  uom?: string | null;
}

interface BomLikeItem {
  id?: string;
  finishedGoodItemId?: string | null;
  finishedGoodItemName?: string | null;
  lines?: BomLikeLine[];
}

function getErrorMessage(error: unknown, fallback: string) {
  if (error && typeof error === "object") {
    const maybe = error as {
      message?: string;
      response?: { data?: { message?: string } };
    };
    return maybe.response?.data?.message || maybe.message || fallback;
  }
  return fallback;
}

export interface UseProductionOrderDrawerProps {
  open: boolean;
  editing: ErpProductionOrder | null;
  onClose: () => void;
  onSaved: () => Promise<void> | void;
}

const emptyForm = () => ({
  finishedGoodItemId: "",
  qtyToProduce: "1",
  warehouseCode: "",
  referenceNo: "",
  plannedStartDate: "",
  plannedEndDate: "",
});

export function useProductionOrderDrawer({
  open,
  editing,
  onClose,
  onSaved,
}: UseProductionOrderDrawerProps) {
  const showToast = useUIStore((s) => s.showToast);
  const navigate = useAppStore((s) => s.navigate);

  const [form, setForm] = useState<ProductionDrawerForm>(emptyForm());
  const [itemOptions, setItemOptions] = useState<
    Array<{ value: string; label: string }>
  >([]);
  const [bomLines, setBomLines] = useState<BomLikeLine[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showGeneralInfo, setShowGeneralInfo] = useState(true);
  const [balances, setBalances] = useState<
    Record<
      string,
      { qtyOnHand: number; qtyReserved: number; availableQty: number }
    >
  >({});
  const [localSearch, setLocalSearch] = useState("");

  const loadItems = useCallback(async () => {
    try {
      const res = await bomCoreApi.list({ pageSize: 500 });
      const uniqueFgs = new Map<string, { value: string; label: string }>();
      res.items.forEach((bom: BomLikeItem) => {
        if (bom.finishedGoodItemId) {
          uniqueFgs.set(bom.finishedGoodItemId, {
            value: bom.finishedGoodItemId,
            label: bom.finishedGoodItemName || bom.finishedGoodItemId,
          });
        }
      });
      setItemOptions(Array.from(uniqueFgs.values()));
    } catch {
      setItemOptions([]);
    }
  }, []);

  useEffect(() => {
    if (form.finishedGoodItemId && !editing) {
      // Load BOM lines for the selected FG
      bomCoreApi
        .list({
          pageSize: 1,
          finishedGoodItemId: form.finishedGoodItemId,
        })
        .then((res) => {
          const bom = res.items[0] as BomLikeItem | undefined;
          if (bom?.id) {
            bomCoreApi.get(bom.id).then((fullBom) => {
              const lines = fullBom.lines || [];
              setBomLines(lines);
              const itemIds = lines
                .map((l: BomLikeLine) => l.itemId)
                .filter(Boolean) as string[];
              if (itemIds.length) {
                inventoryCoreApi.getBalances(itemIds).then(setBalances);
              } else {
                setBalances({});
              }
            });
          } else {
            setBomLines([]);
            setBalances({});
          }
        })
        .catch(() => {
          setBomLines([]);
          setBalances({});
        });
    } else if (editing && editing.lines) {
      // Use existing lines if editing (but we may want to map them similarly)
      setBomLines(editing.lines);
      const itemIds = editing.lines
        .map((l: BomLikeLine) => l.itemId)
        .filter(Boolean) as string[];
      if (itemIds.length) {
        inventoryCoreApi.getBalances(itemIds).then(setBalances);
      } else {
        setBalances({});
      }
    } else {
      setBomLines([]);
      setBalances({});
    }
  }, [form.finishedGoodItemId, editing]);

  useEffect(() => {
    if (open) {
      loadItems();
      if (editing) {
        setForm({
          finishedGoodItemId: editing.finishedGoodItemId || "",
          qtyToProduce: editing.qtyToProduce || "1",
          warehouseCode: editing.warehouseCode || "",
          referenceNo: editing.referenceNo || "",
          plannedStartDate: editing.plannedStartDate
            ? editing.plannedStartDate.slice(0, 10)
            : "",
          plannedEndDate: editing.plannedEndDate
            ? editing.plannedEndDate.slice(0, 10)
            : "",
        });
      } else {
        setForm(emptyForm());
      }
      setError(null);
    }
  }, [open, editing, loadItems]);

  const handleSubmit = async (status: string = "CONFIRMED") => {
    if (!form.finishedGoodItemId) {
      setError("Vui lòng chọn thành phẩm");
      return;
    }
    if (!form.qtyToProduce.trim() || Number(form.qtyToProduce) <= 0) {
      setError("Số lượng sản xuất phải lớn hơn 0");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const payload = {
        finishedGoodItemId: form.finishedGoodItemId,
        qtyToProduce: form.qtyToProduce,
        ...(form.warehouseCode.trim()
          ? { warehouseCode: form.warehouseCode.trim() }
          : {}),
        ...(form.referenceNo.trim()
          ? { referenceNo: form.referenceNo.trim() }
          : {}),
        ...(form.plannedStartDate
          ? { plannedStartDate: form.plannedStartDate }
          : {}),
        ...(form.plannedEndDate ? { plannedEndDate: form.plannedEndDate } : {}),
        status,
      };

      if (!editing) {
        await productionCoreApi.execute(payload);
        showToast({
          title: "Tạo lệnh sản xuất thành công",
          variant: "success",
        });
      } else {
        // Edit is currently not fully supported by API for existing fields, we only create.
        // But if needed we can call an update API if exists.
        showToast({
          title: "Cập nhật không khả dụng cho MO đã tạo",
          variant: "default",
        });
      }

      await onSaved();
      onClose();
    } catch (e: unknown) {
      setError(getErrorMessage(e, "Không thể lưu lệnh sản xuất"));
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmOrder = async () => {
    if (!editing?.id) return;
    setSaving(true);
    setError(null);
    try {
      await productionCoreApi.confirm(editing.id);
      showToast({
        title: "Xác nhận lệnh sản xuất thành công",
        variant: "success",
      });
      await onSaved();
      onClose();
    } catch (e: unknown) {
      setError(getErrorMessage(e, "Không thể xác nhận lệnh sản xuất"));
    } finally {
      setSaving(false);
    }
  };

  const onIssueMaterial = () => {
    if (!editing?.id) return;
    // Set query params or session storage so the GI page knows to prefill for this MO
    window.sessionStorage.setItem("gi_prefill_mo", editing.id);
    navigate("erp-goods-issues");
  };

  const onReceiveFinishedGood = () => {
    if (!editing?.id) return;
    // Set query params or session storage so the GR page knows to prefill for this MO
    window.sessionStorage.setItem("gr_prefill_mo", editing.id);
    navigate("erp-warehouse");
  };

  return {
    form,
    setForm,
    itemOptions,
    saving,
    error,
    handleSubmit,
    handleConfirmOrder,
    onIssueMaterial,
    onReceiveFinishedGood,
    showGeneralInfo,
    setShowGeneralInfo,
    bomLines,
    balances,
    localSearch,
    setLocalSearch,
  };
}

export type UseProductionOrderDrawerReturn = ReturnType<
  typeof useProductionOrderDrawer
>;
