import { useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { garageApi } from "../../../api/garageApi";
import { useAppStore } from "@/core/config/appStore";
import { useDebounce } from "@/shared/hooks/useDebounce";
import { useHasPermission } from "@/shared/hooks/useHasPermission";

export const useGarageCaseCombobox = (propsBranchId?: string) => {
  const currentBranchId = useAppStore((state) => state.currentBranchId);
  const branchId = propsBranchId || currentBranchId;

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);

  const hasPermission = useHasPermission("garage", "read");

  const { data, isLoading, isFetchingNextPage, fetchNextPage, hasNextPage } =
    useInfiniteQuery({
      queryKey: ["garage-cases-infinite", branchId, debouncedSearch],
      queryFn: ({ pageParam = 1 }) =>
        garageApi.getCases(
          "", // Do not filter by ERP branch ID since Kgara uses external branch IDs
          pageParam,
          20, // pageSize
          debouncedSearch,
        ),
      initialPageParam: 1,
      getNextPageParam: (lastPage, allPages) => {
        if (lastPage?.data?.length === 20) {
          return allPages.length + 1;
        }
        return undefined;
      },
      enabled: hasPermission,
    });

  const options =
    data?.pages
      ?.flatMap((page) => page?.data || [])
      ?.map((item: any) => {
        const date =
          item.ngayPhatSinh || item.caseDate
            ? new Date(item.ngayPhatSinh || item.caseDate).toLocaleDateString(
                "vi-VN",
              )
            : "";
        const ref = item.soChungTu || item.id;
        const plate = item.bienSoXe || "Không BKS";

        // Phải thu (Receivable) = tienCoThue, Phải trả (Payable) = chiPhi
        const thu = Number(item.tienCoThue) || 0;
        const tra = Number(item.chiPhi) || 0;

        return {
          label: `[${date}] ${ref} - ${plate}`,
          code: `Thu: ${thu.toLocaleString("vi-VN")}đ`,
          subCode: `Chi: ${tra.toLocaleString("vi-VN")}đ`,
          subLabel: item.khachHangName || "Không có thông tin",
          value: item.id,
          originalName: item.khachHangName || "",
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
