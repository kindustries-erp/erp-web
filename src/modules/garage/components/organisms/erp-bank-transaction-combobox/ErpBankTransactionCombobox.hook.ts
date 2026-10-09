import { useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { bankStatementApi } from "@/modules/bank-statements/api/bankStatementApi";
import { useAppStore } from "@/core/config/appStore";
import { useDebounce } from "@/shared/hooks/useDebounce";
import { useHasPermission } from "@/shared/hooks/useHasPermission";

export const useErpBankTransactionCombobox = (propsBranchId?: string) => {
  const currentBranchId = useAppStore((state) => state.currentBranchId);
  const branchId = propsBranchId || currentBranchId;

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);

  const hasPermission = useHasPermission("bank_statements", "read");

  const { data, isLoading, isFetchingNextPage, fetchNextPage, hasNextPage } =
    useInfiniteQuery({
      queryKey: ["bank-transactions-combobox", branchId, debouncedSearch],
      queryFn: ({ pageParam = 1 }) =>
        bankStatementApi.getTransactions({
          branchId: branchId || undefined,
          page: pageParam,
          pageSize: 20,
          search: debouncedSearch || undefined,
          sourceType: "BANK",
        }),
      initialPageParam: 1,
      getNextPageParam: (lastPage, allPages) => {
        if (lastPage?.items?.length === 20) {
          return allPages.length + 1;
        }
        return undefined;
      },
      enabled: hasPermission,
    });

  const options =
    data?.pages
      ?.flatMap((page) => page?.items || [])
      ?.map((item: any) => ({
        label: `${item.transactionCode || item.id} - ${item.amount?.toLocaleString("vi-VN") || 0}đ`,
        value: item.id,
      })) || [];

  return {
    options,
    isLoading,
    isFetchingNextPage,
    fetchNextPage: () => {
      if (hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    setSearch,
  };
};
