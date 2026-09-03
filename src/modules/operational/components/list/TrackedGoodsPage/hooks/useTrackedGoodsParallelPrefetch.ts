import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getTrackedGoodsQueryConfig } from "./useTrackedGoodsQueryConfigs";
import type { TabStateRecord } from "../types";

export interface UseTrackedGoodsParallelPrefetchOptions {
  currentTab: string;
  fixedTrackingPolicy?: string;
  tabStatesRef?: React.MutableRefObject<Record<string, TabStateRecord>>;
  delayMs?: number;
  enabled?: boolean;
}

const ALL_TRACKED_GOODS_TABS = ["parts", "lot", "custom"] as const;

export function useTrackedGoodsParallelPrefetch({
  currentTab,
  fixedTrackingPolicy,
  tabStatesRef,
  delayMs = 50,
  enabled = true,
}: UseTrackedGoodsParallelPrefetchOptions) {
  const queryClient = useQueryClient();
  const prefetchedTabsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    // Không prefetch nếu bị cố định policy hoặc disabled
    if (!enabled || fixedTrackingPolicy) return;

    if (currentTab) {
      prefetchedTabsRef.current.add(currentTab);
    }

    const timer = setTimeout(() => {
      const remainingTabs = ALL_TRACKED_GOODS_TABS.filter(
        (tab) => tab !== currentTab && !prefetchedTabsRef.current.has(tab),
      );

      remainingTabs.forEach((tab) => {
        prefetchedTabsRef.current.add(tab);
        const tabState = tabStatesRef?.current?.[tab];
        const config = getTrackedGoodsQueryConfig(tab, tabState);

        const existingData = queryClient.getQueryData(config.queryKey);
        if (!existingData) {
          queryClient.prefetchQuery({
            queryKey: config.queryKey,
            queryFn: config.queryFn,
            staleTime: config.staleTime,
          });
        }
      });
    }, delayMs);

    return () => {
      clearTimeout(timer);
    };
  }, [
    currentTab,
    fixedTrackingPolicy,
    tabStatesRef,
    delayMs,
    enabled,
    queryClient,
  ]);
}
