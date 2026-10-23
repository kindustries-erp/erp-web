import { useState, useMemo } from "react";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { garageApi } from "../../../api/garageApi";
import { useDebounce } from "@/shared/hooks/useDebounce";
import { useHasPermission } from "@/shared/hooks/useHasPermission";
import {
  renderGarageCaseTooltipContent,
  formatCaseToOption,
} from "./GarageCaseCombobox.helper";

export { renderGarageCaseTooltipContent };

export interface UseGarageCaseComboboxParams {
  branchId?: string;
  customerCode?: string;
  licensePlate?: string;
  supplierId?: string;
  partnerName?: string;
}

const isUuid = (id?: string) =>
  Boolean(
    id &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id),
  );

export const useGarageCaseCombobox = (
  branchIdOrParams?: string | UseGarageCaseComboboxParams,
) => {
  const params: UseGarageCaseComboboxParams =
    typeof branchIdOrParams === "string"
      ? { branchId: branchIdOrParams }
      : branchIdOrParams || {};

  const { customerCode, licensePlate, supplierId } = params;
  const effectiveBranchId =
    params.branchId &&
    params.branchId !== "BRANCH_ALL" &&
    params.branchId !== "ALL" &&
    !isUuid(params.branchId)
      ? params.branchId
      : "";

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const hasPermission = useHasPermission("garage", "read");

  const hasCustomerContext = Boolean(
    customerCode && customerCode !== "UNKNOWN",
  );
  const hasSupplierContext = Boolean(supplierId);
  const hasPlateContext = Boolean(
    licensePlate && !hasCustomerContext && !hasSupplierContext,
  );
  const hasTargetContext = Boolean(
    hasCustomerContext || hasSupplierContext || hasPlateContext,
  );

  // 1. Fetch target-specific cases if context is provided
  const { data: targetCases = [], isLoading: isLoadingTarget } = useQuery({
    queryKey: [
      "garage-target-cases",
      effectiveBranchId,
      customerCode,
      supplierId,
      licensePlate,
    ],
    queryFn: async () => {
      if (hasCustomerContext && customerCode) {
        return (
          (await garageApi.getCasesByCustomer(
            effectiveBranchId,
            customerCode,
            licensePlate,
          )) || []
        );
      }
      if (hasSupplierContext && supplierId) {
        return (
          (await garageApi.getCasesBySupplier(effectiveBranchId, supplierId)) ||
          []
        );
      }
      if (hasPlateContext && licensePlate) {
        const res = await garageApi.getCases(
          effectiveBranchId,
          1,
          50,
          licensePlate,
        );
        return res?.data || [];
      }
      return [];
    },
    enabled: Boolean(hasPermission && hasTargetContext),
    staleTime: 60000,
  });

  // 2. Fetch general cases ONLY when NO target context is present
  const { data, isLoading, isFetchingNextPage, fetchNextPage, hasNextPage } =
    useInfiniteQuery({
      queryKey: ["garage-cases-infinite", effectiveBranchId, debouncedSearch],
      queryFn: ({ pageParam = 1 }) =>
        garageApi.getCases("", pageParam, 20, debouncedSearch),
      initialPageParam: 1,
      getNextPageParam: (lastPage, allPages) => {
        if (lastPage?.data?.length === 20) {
          return allPages.length + 1;
        }
        return undefined;
      },
      enabled: Boolean(hasPermission && !hasTargetContext),
    });

  // 3. Map & strictly isolate options:
  // If target context is present, NEVER append unrelated general cases.
  const options = useMemo(() => {
    if (hasTargetContext) {
      const list = Array.isArray(targetCases) ? targetCases : [];
      const term = debouncedSearch.trim().toLowerCase();
      const filtered = term
        ? list.filter((item: any) => {
            const plate = (item.bienSoXe || "").toLowerCase();
            const code = (item.soChungTu || item.id || "").toLowerCase();
            const name = (item.khachHangName || "").toLowerCase();
            return (
              plate.includes(term) || code.includes(term) || name.includes(term)
            );
          })
        : list;

      return filtered.map((item: any) => formatCaseToOption(item, true));
    }

    const generalList = data?.pages?.flatMap((page) => page?.data || []) || [];
    return generalList.map((item: any) => formatCaseToOption(item, false));
  }, [hasTargetContext, targetCases, debouncedSearch, data]);

  return {
    options,
    isLoading: hasTargetContext ? isLoadingTarget : isLoading,
    isFetchingNextPage: hasTargetContext ? false : isFetchingNextPage,
    fetchNextPage: () => {
      if (!hasTargetContext && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    setSearch,
  };
};
