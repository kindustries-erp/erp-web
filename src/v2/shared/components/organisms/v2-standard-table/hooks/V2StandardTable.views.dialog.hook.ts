import * as React from "react";
import type { V2ViewModeItem } from "@/v2/shared/components/molecules/v2-view-mode-combobox";
import type { V2ViewPreset } from "../toolbar/V2StandardTable.toolbar.type";

export type V2ViewDialogState =
  | { mode: "create" }
  | { mode: "edit"; view: V2ViewPreset };

/** Trạng thái mở hộp thoại tạo/sửa và xác nhận xóa chế độ xem */
export function useV2ViewDialogState(items: V2ViewModeItem[]) {
  const [dialog, setDialog] = React.useState<V2ViewDialogState | null>(null);
  const [pendingDeleteKey, setPendingDeleteKey] = React.useState<string | null>(
    null,
  );
  const pendingItem = items.find((i) => i.key === pendingDeleteKey);

  return {
    dialog,
    setDialog,
    closeDialog: () => setDialog(null),
    pendingDeleteKey,
    requestDelete: setPendingDeleteKey,
    clearDelete: () => setPendingDeleteKey(null),
    pendingDelete: pendingItem
      ? { key: pendingItem.key, label: pendingItem.label }
      : null,
  };
}
