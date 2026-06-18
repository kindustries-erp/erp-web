import { useInfiniteQuery } from "@tanstack/react-query";
import { basicMastersApi } from "../api/basicMastersApi";

export const useBasicMasterInfinite = ({
  search = "",
  limit = 50,
  entities = "",
  enabled = true,
}: {
  search?: string;
  limit?: number;
  entities?: string; // e.g., "customers,suppliers"
  enabled?: boolean;
}) => {
  return useInfiniteQuery({
    queryKey: ["basic-masters-infinite", { search, limit, entities }],
    queryFn: async ({ pageParam = 1 }) => {
      const data = await basicMastersApi.list({
        search,
        limit,
        page: pageParam,
        entities,
      });
      return data;
    },
    enabled,
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const currentLimit = lastPage.meta.limit;
      const currentPage = lastPage.meta.page;

      const hasMoreCustomers =
        (lastPage.items.customers?.length || 0) === currentLimit;
      const hasMoreSuppliers =
        (lastPage.items.suppliers?.length || 0) === currentLimit;
      const hasMoreInventoryItems =
        (lastPage.items.inventoryItems?.length || 0) === currentLimit;
      const hasMoreUoms = (lastPage.items.uoms?.length || 0) === currentLimit;
      const hasMoreItemTypes =
        (lastPage.items.itemTypes?.length || 0) === currentLimit;
      const hasMoreEmployees =
        (lastPage.items.employees?.length || 0) === currentLimit;
      const hasMoreErpInvoices =
        (lastPage.items.erpInvoices?.length || 0) === currentLimit;

      const hasNextPage =
        hasMoreCustomers ||
        hasMoreSuppliers ||
        hasMoreInventoryItems ||
        hasMoreUoms ||
        hasMoreItemTypes ||
        hasMoreEmployees ||
        hasMoreErpInvoices;

      return hasNextPage ? currentPage + 1 : undefined;
    },
  });
};
