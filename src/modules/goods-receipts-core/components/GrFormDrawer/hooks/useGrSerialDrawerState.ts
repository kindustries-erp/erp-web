import { useState } from "react";
import type { GrForm } from "@/modules/goods-receipts-core/hooks/useGrDrawer";
import type { GrSerialDrawerState } from "../types";

export function useGrSerialDrawerState(
  form: GrForm,
  setForm: React.Dispatch<React.SetStateAction<GrForm>>,
  extraContext?: {
    receiptNo?: string;
    purchaseOrderNo?: string;
    vendorName?: string;
    warehouseName?: string;
  },
) {
  const [serialDrawerState, setSerialDrawerState] =
    useState<GrSerialDrawerState>({
      open: false,
      lineIndex: -1,
      line: null,
      requiredQty: 0,
      viewOnly: false,
    });

  const handleOpenSerialDrawer = (
    line: any,
    lineIndex: number,
    item: any,
    qty: number,
    isViewOnly = false,
    isSystemAuto = false,
  ) => {
    setSerialDrawerState({
      open: true,
      lineIndex,
      line,
      lineId: line?.id || line?.receiptLineId || "",
      itemId: line?.itemId || item?.id,
      itemSku: item?.sku || line?.itemCode || "",
      itemName: item?.itemName || line?.itemName || "",
      trackingPolicyCode: isSystemAuto
        ? "SYSTEM_AUTO"
        : item?.trackingPolicy?.code || "SERIAL",
      trackingPolicyName: isSystemAuto
        ? "Mã Định Danh Hệ Thống (System Serial)"
        : item?.trackingPolicy?.name || "Theo Serial Number",
      requiredQty: qty,
      receiptDate: form.receiptDate,
      receiptNo: extraContext?.receiptNo || form.receiptNo || "",
      purchaseOrderNo:
        extraContext?.purchaseOrderNo || form.purchaseOrderId || "",
      vendorName: extraContext?.vendorName || "",
      warehouseName: extraContext?.warehouseName || "",
      initialSerials: line?.declaredSerials || [],
      viewOnly: isViewOnly,
      isSystemAuto,
    });
  };

  const handleCloseSerialDrawer = () => {
    setSerialDrawerState((s) => ({ ...s, open: false, lineIndex: -1 }));
  };

  const handleSaveSerialsForLine = (serials: any[]) => {
    setForm((f) => {
      const lines = [...f.lines];
      let targetIdx = serialDrawerState.lineIndex;
      if (serialDrawerState.line?.purchaseOrderLineId) {
        const found = lines.findIndex(
          (l) =>
            l.purchaseOrderLineId ===
            serialDrawerState.line?.purchaseOrderLineId,
        );
        if (found >= 0) targetIdx = found;
      } else if (targetIdx < 0 || targetIdx >= lines.length) {
        const found = lines.findIndex(
          (l) => l.itemId === serialDrawerState.itemId,
        );
        if (found >= 0) targetIdx = found;
      }

      if (targetIdx >= 0 && lines[targetIdx]) {
        lines[targetIdx] = {
          ...lines[targetIdx],
          declaredSerials: serials,
        };
      }
      return { ...f, lines };
    });
  };

  return {
    serialDrawerState,
    handleOpenSerialDrawer,
    handleCloseSerialDrawer,
    handleSaveSerialsForLine,
  };
}
