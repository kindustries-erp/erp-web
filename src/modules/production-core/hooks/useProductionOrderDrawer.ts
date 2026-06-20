import { useState, useCallback, useEffect } from "react";
import { useUIStore } from "@/core/config/uiStore";
import {
  productionCoreApi,
  type ErpProductionOrder,
} from "@/modules/production-core/api/productionCoreApi";
import { useAppStore } from "@/core/config/appStore";
import { bomCoreApi } from "@/modules/bom-core/api/bomCoreApi";

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

  const [form, setForm] = useState(emptyForm());
  const [itemOptions, setItemOptions] = useState<
    Array<{ value: string; label: string }>
  >([]);
  const [bomLines, setBomLines] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showGeneralInfo, setShowGeneralInfo] = useState(true);

  const loadItems = useCallback(async () => {
    try {
      const res = await bomCoreApi.list({ pageSize: 500 });
      const uniqueFgs = new Map();
      res.items.forEach((bom: any) => {
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
        } as any)
        .then((res) => {
          const bom = res.items[0];
          if (bom) {
            bomCoreApi.get(bom.id).then((fullBom) => {
              setBomLines(fullBom.lines || []);
            });
          } else {
            setBomLines([]);
          }
        })
        .catch(() => setBomLines([]));
    } else if (editing && editing.lines) {
      // Use existing lines if editing (but we may want to map them similarly)
      setBomLines(editing.lines);
    } else {
      setBomLines([]);
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

  const handleSubmit = async () => {
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
    } catch (e: any) {
      setError(
        e?.response?.data?.message ||
          e?.message ||
          "Không thể lưu lệnh sản xuất",
      );
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
    navigate("erp-warehouse" as any);
  };

  return {
    form,
    setForm,
    itemOptions,
    saving,
    error,
    handleSubmit,
    onIssueMaterial,
    onReceiveFinishedGood,
    showGeneralInfo,
    setShowGeneralInfo,
    bomLines,
  };
}
