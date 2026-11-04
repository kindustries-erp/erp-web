import { Eye, Pencil, Trash2 } from "lucide-react";
import type { V2RowActionGroup } from "@/v2/shared/types/v2-table";
import type { PurchaseOrderRecord } from "../../../domain/purchaseOrder";
import {
  canDeletePurchaseOrder,
  canEditPurchaseOrder,
} from "../../../domain/purchaseOrderRules";

type Translate = (key: string, fallback?: string) => string;

export interface BuildPurchaseOrderRowActionsParams {
  t: Translate;
  canUpdate: boolean;
  canDelete: boolean;
  open: (id: string, mode: "view" | "edit") => void;
  onDelete: (row: PurchaseOrderRecord) => void;
}

/**
 * Nhóm thao tác dòng: xem luôn có; sửa theo quyền và trạng thái; xóa theo quyền
 * và chỉ khi còn là nháp. API vẫn là chốt chặn cuối cùng.
 */
export const buildPurchaseOrderRowActions =
  ({
    t,
    canUpdate,
    canDelete,
    open,
    onDelete,
  }: BuildPurchaseOrderRowActionsParams) =>
  (row: PurchaseOrderRecord): V2RowActionGroup[] => {
    const items: V2RowActionGroup["items"] = [
      {
        label: t("v2.purchaseOrders.actions.view", "Xem chi tiết"),
        icon: <Eye className="h-3.5 w-3.5" />,
        onClick: () => open(row.id, "view"),
      },
    ];
    if (canUpdate && canEditPurchaseOrder(row.status))
      items.push({
        label: t("v2.purchaseOrders.actions.edit", "Chỉnh sửa"),
        icon: <Pencil className="h-3.5 w-3.5" />,
        onClick: () => open(row.id, "edit"),
      });
    if (canDelete && canDeletePurchaseOrder(row.status))
      items.push({
        label: t("v2.purchaseOrders.actions.delete", "Xóa"),
        icon: <Trash2 className="h-3.5 w-3.5" />,
        variant: "danger",
        onClick: () => onDelete(row),
      });
    return [{ items }];
  };
