import {
  createGoodsReceiptKeys,
  goodsReceiptViewVisibility,
} from "@/v2/core/goods-receipts";
import type { GoodsReceiptModuleConfig } from "@/v2/core/goods-receipts";
import { garageGoodsReceiptsV2Api } from "./api/garageGoodsReceiptsApi";
import { garageSourceOrderLoader } from "./api/garageGoodsReceiptSourceOrder";

/** Cấu hình ghép core cho màn Nhập kho Garage: API, khóa cache, bảng và quyền riêng của garage */
export const garageGoodsReceiptsConfig: GoodsReceiptModuleConfig = {
  api: garageGoodsReceiptsV2Api,
  // Giữ nguyên khóa cache cũ để không làm mất dữ liệu đang có trong bộ nhớ đệm
  keys: createGoodsReceiptKeys(["v2-garage-goods-receipts"]),
  tableId: "erp-garage-goods-receipts-table",
  permissionCollection: "garage_goods_receipts",
  requiredFields: ["receiptDate"],
  viewVisibility: goodsReceiptViewVisibility,
  // Lập phiếu nhập từ đơn mua garage đã phát hành (?fromOrder=<id>)
  sourceOrder: garageSourceOrderLoader,
};
