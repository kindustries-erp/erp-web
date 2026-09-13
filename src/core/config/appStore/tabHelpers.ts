import { PageKey, TabInstance } from "@/shared/types";
import { pageToPath } from "@/shared/utils/pageUrl";
import { useTableColumnStore } from "@/shared/hooks/useTableColumnState";
import { useErpInvoiceListStore } from "@/modules/erp-invoices-core/hooks/useErpInvoiceListStore";

export function getPathWithPreservedSearch(
  pageKey: PageKey,
  instanceIndex: 1 | 2,
): string {
  const currentSearch = new URLSearchParams(window.location.search);
  if (instanceIndex === 1) {
    currentSearch.delete("_i");
  } else if (instanceIndex === 2) {
    currentSearch.set("_i", "2");
  }
  const searchStr = currentSearch.toString();
  const basePath = pageToPath(pageKey);
  return `${basePath}${searchStr ? `?${searchStr}` : ""}`;
}

export function normalizeTabInstances(
  tabs: TabInstance[],
  currentInstanceId: string,
): { normalizedTabs: TabInstance[]; nextCurrentId: string } {
  let nextCurrentId = currentInstanceId;
  const normalizedTabs = tabs.map((tab) => {
    if (tab.instanceIndex === 2) {
      const hasInstance1 = tabs.some(
        (t) => t.pageKey === tab.pageKey && t.instanceIndex === 1,
      );
      if (!hasInstance1) {
        if (nextCurrentId === tab.instanceId) {
          nextCurrentId = tab.pageKey;
        }
        // Migrate table column states & invoice states if any
        try {
          useTableColumnStore
            .getState()
            .migrateTableState(`${tab.pageKey}__2`, tab.pageKey);
          useTableColumnStore
            .getState()
            .migrateTableState(
              `erp-invoices-table-IN_2`,
              `erp-invoices-table-IN`,
            );
          useTableColumnStore
            .getState()
            .migrateTableState(
              `erp-invoices-table-OUT_2`,
              `erp-invoices-table-OUT`,
            );
          useErpInvoiceListStore.getState().migrateState("IN_2", "IN");
          useErpInvoiceListStore.getState().migrateState("OUT_2", "OUT");
        } catch {
          // ignore
        }
        return {
          ...tab,
          instanceId: tab.pageKey,
          instanceIndex: 1 as const,
        };
      }
    }
    return tab;
  });
  return { normalizedTabs, nextCurrentId };
}
