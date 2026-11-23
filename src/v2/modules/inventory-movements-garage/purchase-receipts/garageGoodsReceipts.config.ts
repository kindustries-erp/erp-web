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
  // Dùng chung tiền tố với khóa chứng từ và tồn kho: ghi sổ hoặc hủy phiếu nhập làm mới danh sách gộp và số dư
  keys: createGoodsReceiptKeys(["v2-garage-stock"]),
  tableId: "inventory-movements-receipts-garage-table",
  permissionCollection: "garage_goods_receipts",
  requiredFields: ["receiptDate", "sourceOrderId"],
  viewVisibility: goodsReceiptViewVisibility,
  // Lập phiếu nhập từ đơn mua garage đã phát hành (?fromOrder=<id>)
  sourceOrder: garageSourceOrderLoader,
};
