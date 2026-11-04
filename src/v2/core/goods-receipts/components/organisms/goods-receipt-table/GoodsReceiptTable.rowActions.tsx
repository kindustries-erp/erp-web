import { Eye, Pencil, Trash2 } from "lucide-react";
import type { V2RowActionGroup } from "@/v2/shared/types/v2-table";
import type { GoodsReceiptRecord } from "../../../domain/goodsReceipt";

type Translate = (key: string, fallback?: string) => string;

export interface BuildGoodsReceiptRowActionsParams {
  t: Translate;
  canUpdate: boolean;
  canDelete: boolean;
  open: (id: string, mode: "view" | "edit") => void;
  onDelete: (row: GoodsReceiptRecord) => void;
}

/** Nhóm thao tác dòng: xem luôn có; sửa và xóa theo quyền */
export const buildGoodsReceiptRowActions =
  ({
    t,
    canUpdate,
    canDelete,
    open,
    onDelete,
  }: BuildGoodsReceiptRowActionsParams) =>
  (row: GoodsReceiptRecord): V2RowActionGroup[] => {
    const items: V2RowActionGroup["items"] = [
      {
        label: t("v2.goodsReceipts.actions.view", "Xem chi tiết"),
        icon: <Eye className="h-3.5 w-3.5" />,
        onClick: () => open(row.id, "view"),
      },
    ];
    if (canUpdate)
      items.push({
        label: t("v2.goodsReceipts.actions.edit", "Chỉnh sửa"),
        icon: <Pencil className="h-3.5 w-3.5" />,
        onClick: () => open(row.id, "edit"),
      });
    if (canDelete)
      items.push({
        label: t("v2.goodsReceipts.actions.delete", "Xóa"),
        icon: <Trash2 className="h-3.5 w-3.5" />,
        variant: "danger",
        onClick: () => onDelete(row),
      });
    return [{ items }];
  };
