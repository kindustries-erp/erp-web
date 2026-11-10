import { useCallback, useMemo } from "react";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import type { V2FilterOptionsState } from "@/v2/shared/components/molecules/v2-column-header-filter";
import { V2_BLANK_VALUE } from "@/v2/shared/types/v2-table";
import type {
  V2FetchOptions,
  V2FetchOptionsResult,
} from "@/v2/shared/types/v2-table";
import { isForbiddenError } from "@/v2/shared/utils/v2ApiError";

const STALE_TIME_MS = 90_000;
const EMPTY_PAGE: V2FetchOptionsResult = { items: [], total: 0, next: null };

interface UseV2ColumnOptionsParams {
  /** Cột đang mở popup; null thì không truy vấn */
  columnKey: string | null;
  fetchOptions?: V2FetchOptions;
  search: string;
  filtersStr?: string;
  showBlankOption?: boolean;
  queryKeyPrefix: string;
}

/** Giữ nguyên quyết định retry của QueryClient (mặc định của React Query là 3 lần) */
const useClientRetryPolicy = () => {
  const clientRetry = useQueryClient().getDefaultOptions().queries?.retry;
  return (failureCount: number, error: unknown): boolean => {
    if (typeof clientRetry === "function") {
      return clientRetry(failureCount, error as Error);
    }
    if (typeof clientRetry === "number") return failureCount < clientRetry;
    return clientRetry ?? failureCount < 3;
  };
};

export const useV2ColumnOptions = ({
  columnKey,
  fetchOptions,
  search,
  filtersStr,
  showBlankOption,
  queryKeyPrefix,
}: UseV2ColumnOptionsParams): V2FilterOptionsState => {
  const shouldRetryByClientDefault = useClientRetryPolicy();
  const enabled = columnKey !== null && fetchOptions !== undefined;
  const query = useInfiniteQuery({
    queryKey: [queryKeyPrefix, columnKey, search, filtersStr ?? ""],
    queryFn: ({ pageParam }) =>
      fetchOptions && columnKey !== null
        ? fetchOptions({ columnKey, search, pageParam, filtersStr })
        : Promise.resolve(EMPTY_PAGE),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.next ?? undefined,
    enabled,
    staleTime: STALE_TIME_MS,
    // 403 là quyền, thử lại vô ích; lỗi khác theo cấu hình retry của QueryClient
    retry: (failureCount, error) =>
      !isForbiddenError(error) &&
      shouldRetryByClientDefault(failureCount, error),
    // Giữ danh sách cũ khi gõ tìm kiếm để không nháy, nhưng không dùng dữ liệu của cột khác
    placeholderData: (previous, previousQuery) =>
      previousQuery?.queryKey[1] === columnKey ? previous : undefined,
  });

  const options = useMemo(() => {
    const items = (query.data?.pages ?? [])
      .flatMap((page) => page.items)
      .filter((item) => item.value !== V2_BLANK_VALUE);
    return showBlankOption && search.trim() === ""
      ? [{ value: V2_BLANK_VALUE, label: V2_BLANK_VALUE }, ...items]
      : items;
  }, [query.data, showBlankOption, search]);

  const { fetchNextPage, refetch } = query;
  const onLoadMore = useCallback(() => {
    void fetchNextPage();
  }, [fetchNextPage]);
  const onRetry = useCallback(() => {
    void refetch();
  }, [refetch]);

  const status = !enabled
    ? "idle"
    : query.isError
      ? isForbiddenError(query.error)
        ? "forbidden"
        : "error"
      : query.isPending
        ? "loading"
        : "ready";

  return {
    options,
    status,
    hasNextPage: Boolean(query.hasNextPage),
    isFetchingNextPage: query.isFetchingNextPage,
    onLoadMore,
    onRetry,
  };
};
