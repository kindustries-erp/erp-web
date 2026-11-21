import { useEffect, useMemo, useState } from "react";

interface UseCategoryFilterArgs {
  initialCategoryFilter?: string;
  showProfitMetrics: boolean;
  isFunnelMode: boolean;
}

/** Tab lọc giai đoạn/phân loại; đồng bộ lại khi `initialCategoryFilter` đổi. */
export function useCategoryFilter({
  initialCategoryFilter,
  showProfitMetrics,
  isFunnelMode,
}: UseCategoryFilterArgs) {
  const normalizedInitial = useMemo(() => {
    if (!initialCategoryFilter) return showProfitMetrics ? "ALL" : "all";
    return isFunnelMode
      ? initialCategoryFilter.toUpperCase()
      : initialCategoryFilter;
  }, [initialCategoryFilter, showProfitMetrics, isFunnelMode]);

  const [categoryFilter, setCategoryFilter] =
    useState<string>(normalizedInitial);

  useEffect(() => {
    if (initialCategoryFilter) {
      setCategoryFilter(
        isFunnelMode
          ? initialCategoryFilter.toUpperCase()
          : initialCategoryFilter,
      );
    }
  }, [initialCategoryFilter, isFunnelMode]);

  return { categoryFilter, setCategoryFilter };
}
