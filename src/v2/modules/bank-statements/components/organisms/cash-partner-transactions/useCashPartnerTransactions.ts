import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import type { V2TableQuery } from "@/v2/shared/types/v2-table";
import { cashTransactionApi } from "../../../api/cashTransactionApi";
import {
  toPartnerTransactionParams,
  type PartnerKeys,
} from "../../../domain/rules/partnerTransactionQuery";

/** Trạng thái bảng ban đầu: trang 1, 20 dòng, chưa sắp xếp, chưa lọc */
export const INITIAL_PARTNER_QUERY: V2TableQuery = {
  page: 1,
  pageSize: 20,
  sorts: [],
  columnFilters: {},
  columnSearch: {},
  columnOperators: {},
  dateRanges: {},
};

/** Dữ liệu bảng kê đối tượng ở chế độ server: đổi trang, sắp xếp, lọc là tải lại từ API */
export function useCashPartnerTransactions(
  keys: PartnerKeys,
  enabled: boolean,
) {
  const [query, setQuery] = React.useState<V2TableQuery>(INITIAL_PARTNER_QUERY);
  const params = toPartnerTransactionParams(query, keys);
  const result = useQuery({
    queryKey: ["partner-bank-transactions", params],
    queryFn: () => cashTransactionApi.listTransactions(params),
    enabled,
    placeholderData: (previous) => previous,
  });
  return {
    query,
    setQuery,
    items: result.data?.items ?? [],
    total: result.data?.total ?? 0,
    loading: result.isFetching,
  };
}
