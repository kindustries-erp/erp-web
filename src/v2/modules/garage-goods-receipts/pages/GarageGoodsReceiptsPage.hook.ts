import { useGoodsReceiptListController } from "@/v2/core/goods-receipts";
import { garageGoodsReceiptsConfig } from "../garageGoodsReceipts.config";

/** Trạng thái màn Nhập kho Garage: toàn bộ logic nằm ở core, module chỉ truyền cấu hình */
export function useGarageGoodsReceiptsPage() {
  return useGoodsReceiptListController(garageGoodsReceiptsConfig);
}

export type GarageGoodsReceiptsPageState = ReturnType<
  typeof useGarageGoodsReceiptsPage
>;
