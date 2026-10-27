import { useQuery } from "@tanstack/react-query";
import { accountingLookupApi } from "../accountingLookupApi";

/** Khóa `chart-of-accounts` trùng V1 để dùng chung cache khi cả hai cùng mở */
export function useChartOfAccountsQuery(enabled = true) {
  return useQuery({
    queryKey: ["chart-of-accounts"],
    queryFn: () => accountingLookupApi.listChartOfAccounts(),
    enabled,
    staleTime: 5 * 60 * 1000,
  });
}
