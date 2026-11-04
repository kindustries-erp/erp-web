import {
  CheckCheck,
  Eye,
  Pencil,
  Trash2,
  Ban,
  ShieldCheck,
} from "lucide-react";
import type { V2RowActionGroup } from "@/v2/shared/types/v2-table";
import type { PurchaseOrderRecord } from "../../../domain/purchaseOrder";
import {
  canApprovePurchaseOrder,
  canCancelPurchaseOrder,
  canConfirmPurchaseOrder,
  canDeletePurchaseOrder,
  canEditPurchaseOrder,
} from "../../../domain/purchaseOrderRules";

type Translate = (key: string, fallback?: string) => string;

export interface BuildPurchaseOrderRowActionsParams {
  t: Translate;
  canUpdate: boolean;
  canDelete: boolean;
  open: (id: string, mode: "view" | "edit") => void;
  /** Lưu đơn nháp = duyệt đơn (NHÁP → ĐÃ DUYỆT) */
  onApprove: (row: PurchaseOrderRecord) => void;
  onConfirm: (row: PurchaseOrderRecord) => void;
  onCancel: (row: PurchaseOrderRecord) => void;
  onDelete: (row: PurchaseOrderRecord) => void;
}

/**
 * Menu dòng chia nhóm như bảng Hóa đơn: TRA CỨU (xem) và THAO TÁC (sửa, lưu, xác nhận, hủy, xóa).
 * Mỗi mục hiện theo quyền và trạng thái; nhóm rỗng bị bỏ. Mục đầu của THAO TÁC là Chỉnh sửa
 * để nút nhanh khi hover vẫn là Xem + Chỉnh sửa. API vẫn là chốt chặn cuối cùng.
 */
export const buildPurchaseOrderRowActions =
  ({
    t,
    canUpdate,
    canDelete,
    open,
    onApprove,
    onConfirm,
    onCancel,
    onDelete,
  }: BuildPurchaseOrderRowActionsParams) =>
  (row: PurchaseOrderRecord): V2RowActionGroup[] => {
    const lookup: V2RowActionGroup = {
      groupLabel: t("v2.purchaseOrders.actionGroups.lookup", "Tra cứu"),
      items: [
        {
          label: t("v2.purchaseOrders.actions.view", "Xem chi tiết"),
          icon: <Eye className="h-3.5 w-3.5" />,
          onClick: () => open(row.id, "view"),
        },
      ],
    };

    const operate: V2RowActionGroup = {
      groupLabel: t("v2.purchaseOrders.actionGroups.operate", "Thao tác"),
      items: [],
    };
    if (canUpdate && canEditPurchaseOrder(row.status))
      operate.items.push({
        label: t("v2.purchaseOrders.actions.edit", "Chỉnh sửa"),
        icon: <Pencil className="h-3.5 w-3.5" />,
        onClick: () => open(row.id, "edit"),
      });
    if (canUpdate && canApprovePurchaseOrder(row.status))
      operate.items.push({
        label: t("v2.purchaseOrders.actions.save", "Lưu"),
        icon: <CheckCheck className="h-3.5 w-3.5" />,
        onClick: () => onApprove(row),
      });
    if (canUpdate && canConfirmPurchaseOrder(row.status))
      operate.items.push({
        label: t("v2.purchaseOrders.actions.confirm", "Xác nhận đơn"),
        icon: <ShieldCheck className="h-3.5 w-3.5" />,
        onClick: () => onConfirm(row),
      });
    if (canUpdate && canCancelPurchaseOrder(row.status))
      operate.items.push({
        label: t("v2.purchaseOrders.actions.cancel", "Hủy đơn"),
        icon: <Ban className="h-3.5 w-3.5" />,
        onClick: () => onCancel(row),
      });
    if (canDelete && canDeletePurchaseOrder(row.status))
      operate.items.push({
        label: t("v2.purchaseOrders.actions.delete", "Xóa"),
        icon: <Trash2 className="h-3.5 w-3.5" />,
        variant: "danger",
        onClick: () => onDelete(row),
      });

    return operate.items.length > 0 ? [lookup, operate] : [lookup];
  };
