import { useQuery } from "@tanstack/react-query";
import type { V2TableQuery } from "@/v2/shared/types/v2-table";
import type { InventoryMovementsApi } from "../inventoryMovementsApi.type";
import type { InventoryMovementsKeys } from "../inventoryMovementsKeys";

/** Truy vấn tối thiểu chỉ để lấy số đếm; không lọc, không sắp xếp, một dòng */
const COUNT_QUERY: V2TableQuery = {
  page: 1,
  pageSize: 1,
  sorts: [],
  columnFilters: {},
  columnSearch: {},
  columnOperators: {},
  dateRanges: {},
};

interface UseStockCountsQueryParams {
  api: InventoryMovementsApi;
  keys: InventoryMovementsKeys;
}

/**
 * Số phiếu theo từng loại (badge tab chứng từ). Không phụ thuộc tab đang mở nên mọi tab có số.
 * Khóa nằm dưới `keys.all`: ghi sổ hoặc hủy phiếu làm mới cùng danh sách.
 */
export function useStockVoucherTypeCountsQuery({
  api,
  keys,
}: UseStockCountsQueryParams): Record<string, number> {
  const result = useQuery({
    queryKey: keys.counts("vouchers"),
    queryFn: () => api.listVouchers(COUNT_QUERY),
    staleTime: 30_000,
  });
  return result.data?.typeCounts ?? {};
}

/** Số mã hàng theo từng tab tồn kho (bỏ qua lọc tab, khớp `extraData.tabCounts` của API) */
export function useStockTabCountsQuery({
  api,
  keys,
}: UseStockCountsQueryParams): Record<string, number> {
  const result = useQuery({
    queryKey: keys.counts("balances"),
    queryFn: () => api.listBalances(COUNT_QUERY, "ALL"),
    staleTime: 30_000,
  });
  return result.data?.extraData?.tabCounts ?? {};
}
