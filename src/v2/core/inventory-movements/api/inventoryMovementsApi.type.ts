import type {
  V2FetchOptionsParams,
  V2FetchOptionsResult,
  V2TableQuery,
} from "@/v2/shared/types/v2-table";
import type {
  StockBalanceListResult,
  StockTab,
  StockTransactionListResult,
} from "../domain/stockBalance";
import type {
  StockVoucherDetail,
  StockVoucherListResult,
  StockVoucherTypeCode,
} from "../domain/stockVoucher";

/**
 * Hợp đồng API đọc chứng từ và tồn kho của một họ kho. Mỗi module cung cấp một đối tượng
 * đúng hợp đồng này (endpoint riêng), core chỉ gọi qua interface.
 */
export interface InventoryMovementsApi {
  listVouchers: (
    query: V2TableQuery,
    type?: StockVoucherTypeCode,
  ) => Promise<StockVoucherListResult>;
  voucherOptions: (
    params: V2FetchOptionsParams,
  ) => Promise<V2FetchOptionsResult>;
  /** Chi tiết chỉ đọc theo loại phiếu; loại không khai báo thì không mở được drawer xem */
  getVoucher: (
    type: StockVoucherTypeCode,
    id: string,
  ) => Promise<StockVoucherDetail>;
  listBalances: (
    query: V2TableQuery,
    stockTab: StockTab,
  ) => Promise<StockBalanceListResult>;
  listTransactions: (
    itemCode: string,
    page: number,
    pageSize: number,
  ) => Promise<StockTransactionListResult>;
}
