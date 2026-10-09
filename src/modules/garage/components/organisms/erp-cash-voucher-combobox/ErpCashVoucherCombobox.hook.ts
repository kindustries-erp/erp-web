import { useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { bankStatementApi } from "@/modules/bank-statements/api/bankStatementApi";
import { useAppStore } from "@/core/config/appStore";
import { useDebounce } from "@/shared/hooks/useDebounce";
import { useHasPermission } from "@/shared/hooks/useHasPermission";

export const useErpCashVoucherCombobox = (propsBranchId?: string) => {
  const currentBranchId = useAppStore((state) => state.currentBranchId);
  const branchId = propsBranchId || currentBranchId;

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);

  const hasPermission = useHasPermission("cash_statements", "read");

  const { data, isLoading, isFetchingNextPage, fetchNextPage, hasNextPage } =
    useInfiniteQuery({
      queryKey: ["cash-vouchers-combobox", branchId, debouncedSearch],
      queryFn: ({ pageParam = 1 }) =>
        bankStatementApi.getTransactions({
          branchId: undefined, // Do not filter by branchId because Kgara branch ID != ERP branch ID
          page: pageParam,
          pageSize: 20,
          search: debouncedSearch || undefined,
          sourceType: "CASH",
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
      ?.map((item: any) => {
        const date = item.transDate
          ? new Date(item.transDate).toLocaleDateString("vi-VN")
          : "";
        const ref = item.referenceNumber || item.seqNo || item.id;
        const source =
          item.cashBook?.name || item.correspondentName || "Tiền mặt";
        const amount =
          (Number(item.creditAmount) || 0) + (Number(item.debitAmount) || 0);

        return {
          label: `[${date}] ${ref} - ${source}`,
          code: `${amount.toLocaleString("vi-VN")}đ`,
          subLabel: item.description || "",
          value: item.id,
        };
      }) || [];

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
