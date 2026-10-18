import { useCallback, useRef } from "react";
import { clearV2TablePrefix } from "@/v2/shared/utils/v2TableUrl";
import { updateV2SearchParams } from "@/v2/shared/utils/v2Url";
import { useV2SearchParams } from "./useV2SearchParams";

export interface UseV2ModuleTabStateOptions {
  tabKeys: string[];
  /** Tab mở khi URL không có tab hợp lệ; mặc định là tab đầu tiên */
  defaultTab?: string;
  /** Tên tham số URL giữ tab đang mở */
  paramName?: string;
}

type StashedParams = Array<[string, string]>;

/**
 * Tab đang mở nằm trên URL. Mỗi tab sở hữu các khóa bắt đầu bằng `<tabKey>.`
 * (xem `useV2TableUrlState`). Đổi tab thì URL chỉ còn khóa của tab đích,
 * khóa của tab cũ được cất đi và trả lại khi quay về.
 */
export function useV2ModuleTabState({
  tabKeys,
  defaultTab,
  paramName = "tab",
}: UseV2ModuleTabStateOptions) {
  const params = useV2SearchParams();
  const fromUrl = params.get(paramName);
  const fallback =
    defaultTab && tabKeys.includes(defaultTab)
      ? defaultTab
      : (tabKeys[0] ?? "");
  const activeTab = fromUrl && tabKeys.includes(fromUrl) ? fromUrl : fallback;

  const activeRef = useRef(activeTab);
  activeRef.current = activeTab;
  const stash = useRef<Record<string, StashedParams>>({});

  const setActiveTab = useCallback(
    (next: string) => {
      const current = activeRef.current;
      if (next === current) return;
      updateV2SearchParams((search) => {
        const owned = `${current}.`;
        stash.current[current] = [...search.entries()].filter(([key]) =>
          key.startsWith(owned),
        );
        clearV2TablePrefix(search, current);
        search.set(paramName, next);
        (stash.current[next] ?? []).forEach(([key, value]) =>
          search.set(key, value),
        );
      }, "push");
    },
    [paramName],
  );

  return { activeTab, setActiveTab };
}
