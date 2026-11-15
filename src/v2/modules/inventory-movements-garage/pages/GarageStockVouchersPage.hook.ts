import * as React from "react";
import { Eye } from "lucide-react";
import { useGoodsReceiptListController } from "@/v2/core/goods-receipts";
import { useStockVoucherListController } from "@/v2/core/inventory-movements";
import type { StockVoucherRow } from "@/v2/core/inventory-movements";
import type { V2RowActionGroup } from "@/v2/shared/types/v2-table";
import { garageGoodsReceiptsConfig } from "../purchase-receipts/garageGoodsReceipts.config";
import {
  GARAGE_PURCHASE_RECEIPT_TYPE,
  inventoryMovementsGarageConfig,
} from "../inventoryMovementsGarage.config";

export interface StockVoucherDetailTarget {
  type: string;
  id: string;
}

/**
 * Trạng thái trang Chứng từ kho Garage. Phiếu nhập mua hàng dùng bộ điều khiển đầy đủ của core
 * goods-receipts (drawer sửa, ghi sổ, hủy, xóa, `?fromOrder=`, `?receipt=`); ba loại còn lại chỉ xem.
 */
export function useGarageStockVouchersPage() {
  const receipt = useGoodsReceiptListController(garageGoodsReceiptsConfig);
  const [detail, setDetail] = React.useState<StockVoucherDetailTarget | null>(
    null,
  );
  const { open: openReceipt } = receipt;

  const onOpen = React.useCallback(
    (row: StockVoucherRow) =>
      row.type === GARAGE_PURCHASE_RECEIPT_TYPE
        ? openReceipt(row.id, "view")
        : setDetail({ type: row.type, id: row.id }),
    [openReceipt],
  );
  const list = useStockVoucherListController(
    inventoryMovementsGarageConfig,
    onOpen,
  );

  const rowActions = React.useCallback(
    (row: StockVoucherRow): V2RowActionGroup[] => {
      if (row.type === GARAGE_PURCHASE_RECEIPT_TYPE) {
        return receipt.rowActions({
          id: row.id,
          receiptNo: row.voucherNo,
          receiptDate: row.voucherDate,
          status: row.status,
        });
      }
      return [
        {
          groupLabel: list.t("v2.goodsReceipts.actionGroups.lookup", "Tra cứu"),
          items: [
            {
              label: list.t("v2.goodsReceipts.actions.view", "Xem chi tiết"),
              icon: React.createElement(Eye, { className: "h-3.5 w-3.5" }),
              onClick: () => onOpen(row),
            },
          ],
        },
      ];
    },
    [receipt, list, onOpen],
  );

  return {
    ...list,
    receipt,
    rowActions,
    detail,
    closeDetail: () => setDetail(null),
  };
}

export type GarageStockVouchersPageState = ReturnType<
  typeof useGarageStockVouchersPage
>;
