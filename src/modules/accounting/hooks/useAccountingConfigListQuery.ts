import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { accountingApi } from "../api/accountingApi";

export function useAccountingConfigListQuery({
  page,
  pageSize,
  search,
}: {
  page: number;
  pageSize: number;
  search?: string;
}) {
  return useQuery({
    queryKey: ["accounting-configs", { page, pageSize, search }],
    queryFn: async () => {
      return accountingApi.getConfigs({
        page,
        pageSize,
        search,
      });
    },
    placeholderData: keepPreviousData,
  });
}
