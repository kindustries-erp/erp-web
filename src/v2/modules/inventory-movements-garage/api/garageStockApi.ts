import { v2HttpClient } from "@/v2/shared/api/v2HttpClient";
import type { InventoryMovementsApi } from "@/v2/core/inventory-movements";
import type {
  V2FetchOptionsParams,
  V2FetchOptionsResult,
  V2TableQuery,
} from "@/v2/shared/types/v2-table";
import { toSummaryKeysParam } from "@/v2/shared/utils/toSummaryKeysParam";
import { toFetchOptionsResult } from "@/v2/shared/utils/v2FetchOptionsAdapter";

const VOUCHERS = "/api/v2/inventory-movements-garage-vouchers";
const LEDGER = "/api/v2/inventory-movements-garage-ledger";
/** Endpoint chi tiết theo loại phiếu; PURCHASE_RECEIPT dùng drawer đầy đủ của core goods-receipts nên không có ở đây */
const DETAIL_BASE: Record<string, string> = {
  OTHER_RECEIPT: "/api/v2/inventory-movements-garage-receipts",
  ISSUE: "/api/v2/inventory-movements-garage-issues",
  ADJUSTMENT: "/api/v2/inventory-movements-garage-adjustments",
};
const OPTIONS_PAGE_SIZE = 20;

const toSort = (query: V2TableQuery) =>
  query.sorts.length
    ? query.sorts
        .map((s) => (s.direction === "desc" ? `-${s.columnKey}` : s.columnKey))
        .join(",")
    : undefined;

const toColumnFilters = (query: V2TableQuery, skip?: string) => {
  const filters = Object.fromEntries(
    Object.entries(query.columnFilters).filter(([key]) => key !== skip),
  );
  return Object.keys(filters).length ? JSON.stringify(filters) : undefined;
};

/** Tham số danh sách chứng từ gộp; chỉ gửi những tham số API hỗ trợ (API từ chối tham số lạ) */
export const toGarageVoucherListParams = (
  query: V2TableQuery,
  type?: string,
) => ({
  page: query.page,
  pageSize: query.pageSize,
  search: query.search?.trim() || undefined,
  sort: toSort(query),
  type,
  dateFrom: query.dateRanges.voucherDate?.from || undefined,
  dateTo: query.dateRanges.voucherDate?.to || undefined,
  column_filters: toColumnFilters(query),
  summary_keys: toSummaryKeysParam(query),
});

/** Client API chứng từ kho và tồn kho Garage, đúng hợp đồng `InventoryMovementsApi` của core */
export const garageStockApi: InventoryMovementsApi = {
  listVouchers: async (query, type) => {
    const { data } = await v2HttpClient.get(VOUCHERS, {
      params: toGarageVoucherListParams(query, type),
    });
    return {
      items: data.items,
      total: data.pagination.total,
      summaries: data.summaries,
      typeCounts: data.extraData?.typeCounts,
    };
  },
  voucherOptions: async (
    params: V2FetchOptionsParams,
  ): Promise<V2FetchOptionsResult> => {
    const { data } = await v2HttpClient.get(`${VOUCHERS}/column-options`, {
      params: {
        column: params.columnKey,
        search: params.search,
        page: params.pageParam,
        pageSize: OPTIONS_PAGE_SIZE,
        filters: params.filtersStr,
      },
    });
    return toFetchOptionsResult(data);
  },
  getVoucher: async (type, id) => {
    const base = DETAIL_BASE[type];
    if (!base) throw new Error(`Loại phiếu không có chi tiết chỉ đọc: ${type}`);
    const { data } = await v2HttpClient.get(`${base}/${id}`);
    return data.data;
  },
  listBalances: async (query, stockTab) => {
    const { data } = await v2HttpClient.get(`${LEDGER}/balances`, {
      params: {
        page: query.page,
        pageSize: query.pageSize,
        search: query.search?.trim() || undefined,
        sort: toSort(query),
        stockTab,
      },
    });
    return {
      items: data.items,
      total: data.pagination.total,
      summaries: data.summaries,
      extraData: data.extraData,
    };
  },
  listTransactions: async (itemCode, page, pageSize) => {
    const { data } = await v2HttpClient.get(`${LEDGER}/transactions`, {
      params: { itemCode, page, pageSize },
    });
    return { items: data.items, total: data.pagination.total };
  },
};
