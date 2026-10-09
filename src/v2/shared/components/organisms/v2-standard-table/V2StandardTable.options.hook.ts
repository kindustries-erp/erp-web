import { useCallback, useMemo } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import type { V2FilterOptionsState } from "@/v2/shared/components/molecules/v2-column-header-filter";
import { V2_BLANK_VALUE } from "@/v2/shared/types/v2-table";
import type {
  V2FetchOptions,
  V2FetchOptionsResult,
} from "@/v2/shared/types/v2-table";

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

export const useV2ColumnOptions = ({
  columnKey,
  fetchOptions,
  search,
  filtersStr,
  showBlankOption,
  queryKeyPrefix,
}: UseV2ColumnOptionsParams): V2FilterOptionsState => {
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

  const { fetchNextPage } = query;
  const onLoadMore = useCallback(() => {
    void fetchNextPage();
  }, [fetchNextPage]);

  const status = !enabled
    ? "idle"
    : query.isError
      ? "error"
      : query.isPending
        ? "loading"
        : "ready";

  return {
    options,
    status,
    hasNextPage: Boolean(query.hasNextPage),
    isFetchingNextPage: query.isFetchingNextPage,
    onLoadMore,
  };
};
