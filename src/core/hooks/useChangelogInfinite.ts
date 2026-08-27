import { useInfiniteQuery } from "@tanstack/react-query";
import {
  getChangelogApi,
  PaginatedChangelogResponse,
} from "../api/appConfigApi";

export interface UseChangelogInfiniteOptions {
  search?: string;
  limit?: number;
  enabled?: boolean;
}

export function useChangelogInfinite({
  search = "",
  limit = 6,
  enabled = true,
}: UseChangelogInfiniteOptions = {}) {
  return useInfiniteQuery<PaginatedChangelogResponse>({
    queryKey: ["app-changelog-infinite", { search: search.trim(), limit }],
    queryFn: async ({ pageParam = 1 }) => {
      return getChangelogApi({
        page: pageParam as number,
        limit,
        search: search.trim() || undefined,
      });
    },
    enabled,
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage?.meta?.hasNextPage) {
        return lastPage.meta.page + 1;
      }
      return undefined;
    },
    staleTime: 5 * 60 * 1000,
  });
}
