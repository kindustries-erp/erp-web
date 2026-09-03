import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  getInvoiceHeaderQueryConfig,
  getInvoiceLinesQueryConfig,
} from "./useErpInvoicesQueryConfigs";

export interface UseErpInvoicesParallelPrefetchOptions {
  activeTabKey: string;
  instanceIndex?: 1 | 2;
  partnerTaxCode?: string;
  isDrawer?: boolean;
  delayMs?: number;
  enabled?: boolean;
}

const ALL_INVOICE_TABS = ["in", "in-lines", "out", "out-lines"] as const;

export function useErpInvoicesParallelPrefetch({
  activeTabKey,
  instanceIndex = 1,
  partnerTaxCode,
  isDrawer = false,
  delayMs = 50,
  enabled = true,
}: UseErpInvoicesParallelPrefetchOptions) {
  const queryClient = useQueryClient();
  const prefetchedTabsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    // Không chạy prefetch nếu bị disable hoặc ở trong drawer
    if (!enabled || isDrawer) return;

    // Đánh dấu activeTabKey hiện tại đã được nạp
    if (activeTabKey) {
      prefetchedTabsRef.current.add(activeTabKey);
    }

    const timer = setTimeout(() => {
      const remainingTabs = ALL_INVOICE_TABS.filter(
        (tab) => tab !== activeTabKey && !prefetchedTabsRef.current.has(tab),
      );

      remainingTabs.forEach((tab) => {
        prefetchedTabsRef.current.add(tab);

        if (tab === "in" || tab === "out") {
          const dir = tab === "in" ? "IN" : "OUT";
          const config = getInvoiceHeaderQueryConfig(
            dir,
            instanceIndex,
            partnerTaxCode,
            isDrawer,
          );
          const existingData = queryClient.getQueryData(config.queryKey);
          if (!existingData) {
            queryClient.prefetchQuery({
              queryKey: config.queryKey,
              queryFn: config.queryFn,
              staleTime: config.staleTime,
            });
          }
        } else if (tab === "in-lines" || tab === "out-lines") {
          const dir = tab === "in-lines" ? "IN" : "OUT";
          const config = getInvoiceLinesQueryConfig(
            dir,
            instanceIndex,
            partnerTaxCode,
          );
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
  }, [
    activeTabKey,
    instanceIndex,
    partnerTaxCode,
    isDrawer,
    delayMs,
    enabled,
    queryClient,
  ]);
}
