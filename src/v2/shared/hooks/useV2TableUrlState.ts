import { useCallback, useState } from "react";
import type { V2TableQuery } from "@/v2/shared/types/v2-table";
import {
  parseV2TableQuery,
  writeV2TableQuery,
} from "@/v2/shared/utils/v2TableUrl";
import {
  readV2SearchParams,
  updateV2SearchParams,
} from "@/v2/shared/utils/v2Url";

export interface UseV2TableUrlStateOptions {
  /** Query mặc định đầy đủ (thường là `createInitialQuery(...)`), URL ghi đè lên đây */
  base: V2TableQuery;
  /** Tiền tố khóa URL, dùng khi một trang có nhiều bảng (thường là khóa tab) */
  prefix?: string;
}

/**
 * Giữ query của một bảng và đồng bộ với URL.
 * Bảng là uncontrolled: truyền `initialQuery` và `onQueryChange={setQuery}` vào `V2StandardTable`.
 */
export function useV2TableUrlState({
  base,
  prefix,
}: UseV2TableUrlStateOptions) {
  const [initialQuery] = useState<V2TableQuery>(() => ({
    ...base,
    ...parseV2TableQuery(readV2SearchParams(), prefix),
  }));
  const [query, setQueryState] = useState(initialQuery);

  const setQuery = useCallback(
    (next: V2TableQuery) => {
      setQueryState(next);
      updateV2SearchParams((params) => writeV2TableQuery(params, next, prefix));
    },
    [prefix],
  );

  return { query, initialQuery, setQuery };
}
