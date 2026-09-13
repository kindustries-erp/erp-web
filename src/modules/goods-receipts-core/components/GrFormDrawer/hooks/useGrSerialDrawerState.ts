import { useState } from "react";
import type { GrForm } from "@/modules/goods-receipts-core/hooks/useGrDrawer";
import type { GrSerialDrawerState } from "../types";

export function useGrSerialDrawerState(
  form: GrForm,
  setForm: React.Dispatch<React.SetStateAction<GrForm>>,
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
  ) => {
    setSerialDrawerState({
      open: true,
      lineIndex,
      line,
      itemId: line?.itemId || item?.id,
      itemSku: item?.sku || line?.itemCode || "",
      itemName: item?.itemName || line?.itemName || "",
      trackingPolicyCode: item?.trackingPolicy?.code || "SERIAL",
      trackingPolicyName: item?.trackingPolicy?.name || "Theo Serial Number",
      requiredQty: qty,
      receiptDate: form.receiptDate,
      initialSerials: line?.declaredSerials || [],
      viewOnly: isViewOnly,
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
