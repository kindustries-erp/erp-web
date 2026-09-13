import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  getVinfastPartsDashboardQueryConfig,
  getVinfastPartsStockQueryConfig,
} from "./useVinfastPartsStockQueryConfigs";
import type { VinfastPartsStockTab } from "../VinfastPartsStockPage";

export interface UseVinfastPartsParallelPrefetchOptions {
  activeTab: VinfastPartsStockTab;
  delayMs?: number;
  enabled?: boolean;
}

const ALL_VINFAST_TABS: VinfastPartsStockTab[] = ["dashboard", "oto", "xemay"];

export function useVinfastPartsParallelPrefetch({
  activeTab,
  delayMs = 50,
  enabled = true,
}: UseVinfastPartsParallelPrefetchOptions) {
  const queryClient = useQueryClient();
  const prefetchedTabsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!enabled) return;

    if (activeTab) {
      prefetchedTabsRef.current.add(activeTab);
    }

    const timer = setTimeout(() => {
      const remainingTabs = ALL_VINFAST_TABS.filter(
        (tab) => tab !== activeTab && !prefetchedTabsRef.current.has(tab),
      );

      remainingTabs.forEach((tab) => {
        prefetchedTabsRef.current.add(tab);

        if (tab === "dashboard") {
          const config = getVinfastPartsDashboardQueryConfig();
          const existingData = queryClient.getQueryData(config.queryKey);
          if (!existingData) {
            queryClient.prefetchQuery({
              queryKey: config.queryKey,
              queryFn: config.queryFn,
              staleTime: config.staleTime,
            });
          }
        } else if (tab === "oto" || tab === "xemay") {
          const config = getVinfastPartsStockQueryConfig(tab);
          const existingData = queryClient.getQueryData(config.queryKey);
          if (!existingData) {
            queryClient.prefetchQuery({
              queryKey: config.queryKey,
              queryFn: config.queryFn,
              staleTime: config.staleTime,
            });
          }
        }
      });
    }, delayMs);

    return () => {
      clearTimeout(timer);
    };
  }, [activeTab, delayMs, enabled, queryClient]);
}
