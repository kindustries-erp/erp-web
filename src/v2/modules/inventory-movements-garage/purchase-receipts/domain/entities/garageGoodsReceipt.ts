/**
 * Tên riêng của garage cho kiểu dữ liệu họ phiếu nhập (định nghĩa ở core).
 * Không thêm logic nghiệp vụ ở đây; rule và form nằm ở core.
 */
export type {
  GoodsReceiptRecord as GarageGoodsReceipt,
  GoodsReceiptRecordLine as GarageGoodsReceiptLine,
  GoodsReceiptFormValue as GarageGoodsReceiptFormValue,
  GoodsReceiptStatusType as GarageGoodsReceiptStatusType,
} from "@/v2/core/goods-receipts";
