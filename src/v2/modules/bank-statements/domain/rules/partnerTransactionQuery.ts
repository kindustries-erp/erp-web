import type { V2TableQuery } from "@/v2/shared/types/v2-table";
import {
  getV2DateRange,
  getV2PrimarySort,
  toV2DayBounds,
} from "@/v2/shared/utils/v2TableQueryParams";
import type { CashTransactionDto } from "../../api/dtos/cashTransaction.dto";

/** Cột ngày dùng cho khoảng lọc của bảng kê đối tượng */
export const PARTNER_DATE_COLUMN = "transDate";

export interface PartnerKeys {
  correspondentAccount?: string;
  correspondentName?: string;
}

export interface PartnerTransactionParams extends PartnerKeys {
  page: number;
  pageSize: number;
  sortBy: string;
  sortOrder: "ASC" | "DESC";
  startDate?: string;
  endDate?: string;
  column_search?: string;
  column_filters?: string;
}

/** Bảng kê đối tượng: đổi trạng thái bảng (trang, sắp xếp, lọc cột, khoảng ngày) thành tham số API */
export function toPartnerTransactionParams(
  query: V2TableQuery,
  keys: PartnerKeys,
): PartnerTransactionParams {
  const sort = getV2PrimarySort(query);
  const bounds = toV2DayBounds(getV2DateRange(query, PARTNER_DATE_COLUMN));
  const filters = Object.fromEntries(
    Object.entries(query.columnFilters).filter(
      ([, values]) => values.length > 0,
    ),
  );
  return {
    page: query.page,
    pageSize: query.pageSize,
    sortBy: sort?.field ?? PARTNER_DATE_COLUMN,
    sortOrder: sort?.order === "asc" ? "ASC" : "DESC",
    startDate: bounds.from,
    endDate: bounds.to,
    column_search: query.search?.trim() || undefined,
    column_filters: Object.keys(filters).length
      ? JSON.stringify(filters)
      : undefined,
    ...keys,
  };
}

const round2 = (value: number): number => Math.round(value * 100) / 100;

/** Số còn lại của một giao dịch: số lớn hơn giữa Thu và Chi, trừ phần đã cấn trừ */
export const remainingOfTransaction = (tx: CashTransactionDto): number =>
  Math.max(
    0,
    round2(
      Math.max(Number(tx.creditAmount || 0), Number(tx.debitAmount || 0)) -
        Number(tx.netOffAmount ?? 0),
    ),
  );

/** Nguồn tiền hiển thị: tài khoản ngân hàng (tên - số) hoặc tên sổ quỹ */
export const sourceLabelOfTransaction = (tx: CashTransactionDto): string =>
  tx.sourceType === "BANK"
    ? [tx.bankAccount?.bankName, tx.bankAccount?.accountNumber]
        .filter(Boolean)
        .join(" - ") || "—"
    : tx.cashBook?.name || "—";
