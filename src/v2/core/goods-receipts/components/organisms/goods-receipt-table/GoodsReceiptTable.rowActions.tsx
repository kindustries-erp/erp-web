import { Eye, Pencil, Trash2 } from "lucide-react";
import type { V2RowAction, V2RowActionGroup } from "@/v2/shared/types/v2-table";
import {
  GoodsReceiptStatus,
  type GoodsReceiptRecord,
} from "../../../domain/goodsReceipt";

type Translate = (key: string, fallback?: string) => string;

export interface BuildGoodsReceiptRowActionsParams {
  t: Translate;
  canUpdate: boolean;
  canDelete: boolean;
  open: (id: string, mode: "view" | "edit") => void;
  onDelete: (row: GoodsReceiptRecord) => void;
}

/**
 * Menu dòng: TRA CỨU chỉ có Xem chi tiết; THAO TÁC có Chỉnh sửa đứng đầu (để nút nhanh
 * khi hover là Xem + Chỉnh sửa) rồi Xóa. Chỉnh sửa luôn hiện khi có quyền nhưng chỉ bật cho
 * phiếu nháp; Xóa chỉ cho phiếu nháp, khớp drawer.
 */
export const buildGoodsReceiptRowActions =
  ({
    t,
    canUpdate,
    canDelete,
    open,
    onDelete,
  }: BuildGoodsReceiptRowActionsParams) =>
  (row: GoodsReceiptRecord): V2RowActionGroup[] => {
    const isDraft = row.status === GoodsReceiptStatus.DRAFT;
    const lookup: V2RowAction = {
      label: t("v2.goodsReceipts.actions.view", "Xem chi tiết"),
      icon: <Eye className="h-3.5 w-3.5" />,
      onClick: () => open(row.id, "view"),
    };
    const operate: V2RowAction[] = [];
    // Luôn hiện Chỉnh sửa khi có quyền (khớp bảng hóa đơn); không phải nháp thì mờ kèm lý do
    if (canUpdate)
      operate.push({
        label: t("v2.goodsReceipts.actions.edit", "Chỉnh sửa"),
        icon: <Pencil className="h-3.5 w-3.5" />,
        disabled: !isDraft,
        disabledReason: t(
          "v2.goodsReceipts.actions.editDisabledReason",
          "Chỉ sửa được khi còn nháp",
        ),
        onClick: () => open(row.id, "edit"),
      });
    if (canDelete && isDraft)
      operate.push({
        label: t("v2.goodsReceipts.actions.delete", "Xóa"),
        icon: <Trash2 className="h-3.5 w-3.5" />,
        variant: "danger",
        onClick: () => onDelete(row),
      });
    return [
      {
        groupLabel: t("v2.goodsReceipts.actionGroups.lookup", "Tra cứu"),
        items: [lookup],
      },
      ...(operate.length
        ? [
            {
              groupLabel: t(
                "v2.goodsReceipts.actionGroups.operate",
                "Thao tác",
              ),
              items: operate,
            },
          ]
        : []),
    ];
  };
