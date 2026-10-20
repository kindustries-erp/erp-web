import React, { useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Eye } from "lucide-react";
import {
  erpInvoicesCoreApi,
  type ErpInvoiceItemRow,
} from "@/modules/erp-invoices-core/api/erpInvoicesCoreApi";
import { createColumnHeaderFilter } from "@/shared/components/DataTable";
import type { ErpInvoicePartnerLinesSectionProps } from "./ErpInvoicePartnerLinesSection.type";
import { useErpInvoicePartnerLinesFilter } from "./ErpInvoicePartnerLinesSection.filter.hook";
import { buildItemSummaryRow } from "./ErpInvoicePartnerLinesSection.summary";

export function useErpInvoicePartnerLinesSection({
  taxCode,
  direction = "IN",
  onPreviewInvoice,
}: ErpInvoicePartnerLinesSectionProps) {
  const { t } = useTranslation("erpInvoices");
  const filterHook = useErpInvoicePartnerLinesFilter();
  const {
    itemPage,
    itemPageSize,
    itemSorts,
    itemDateFrom,
    itemDateTo,
    itemColumnFilters,
    itemColumnSearch,
  } = filterHook;

  const activeItemSort = itemSorts[0] || "";
  const itemSortBy = activeItemSort.replace(/^-/, "") || "invoiceDate";
  const itemSortOrder: "asc" | "desc" =
    activeItemSort.startsWith("-") || !activeItemSort ? "desc" : "asc";

  const { data: itemLinesResponse, isLoading: isLoadingItems } = useQuery({
    queryKey: [
      "partner-items-list",
      taxCode,
      direction,
      itemPage,
      itemPageSize,
      itemSortBy,
      itemSortOrder,
      itemDateFrom,
      itemDateTo,
      itemColumnFilters,
      itemColumnSearch,
    ],
    queryFn: () =>
      erpInvoicesCoreApi.getItemsList({
        partner_tax_code: taxCode,
        direction,
        date_from: itemDateFrom ? `${itemDateFrom}T00:00:00` : undefined,
        date_to: itemDateTo ? `${itemDateTo}T23:59:59` : undefined,
        page: itemPage,
        pageSize: itemPageSize,
        sort_by: itemSortBy || undefined,
        sort_order: itemSortOrder || undefined,
        column_search: Object.keys(itemColumnSearch).length
          ? JSON.stringify(itemColumnSearch)
          : undefined,
        column_filters: Object.keys(itemColumnFilters).length
          ? JSON.stringify(itemColumnFilters)
          : undefined,
      }),
    enabled: !!taxCode,
  });

  const itemLines = useMemo(
    () => itemLinesResponse?.items || [],
    [itemLinesResponse],
  );
  const itemLinesTotal = itemLinesResponse?.total || 0;
  const itemLinesTotalPages = itemLinesResponse?.totalPages || 0;

  const fetchItemOptions = useCallback(
    async ({ columnKey, search, pageParam, filtersStr }: any) => {
      let mergedFilters: Record<string, any> = {};
      if (filtersStr) {
        try {
          mergedFilters = JSON.parse(filtersStr);
        } catch {
          // ignore
        }
      }
      if (taxCode) mergedFilters["taxCode"] = [taxCode];

      const res = await erpInvoicesCoreApi.getItemColumnOptions(
        columnKey,
        search,
        pageParam,
        20,
        JSON.stringify(mergedFilters),
        direction,
      );
      return {
        items: res.items.map((it: any) =>
          typeof it === "string" ? { label: it, value: it } : it,
        ),
        total: res.total,
        next: res.page < res.totalPages ? res.page + 1 : null,
      };
    },
    [taxCode, direction],
  );

  const itemListHookLike = useMemo(
    () => ({
      columnFilters: itemColumnFilters,
      columnSearch: itemColumnSearch,
      sorts: itemSorts,
      dateFrom: itemDateFrom,
      dateTo: itemDateTo,
      setSort: filterHook.setItemSort,
      setColumnFilter: filterHook.setItemColumnFilter,
      setColumnSearch: filterHook.setItemColumnSearch,
      setDateRange: filterHook.setItemDateRange,
    }),
    [
      itemColumnFilters,
      itemColumnSearch,
      itemSorts,
      itemDateFrom,
      itemDateTo,
      filterHook,
    ],
  );

  const itemHeaderFilter = useMemo(
    () =>
      createColumnHeaderFilter({
        listHook: itemListHookLike,
        queryKeyPrefix: `partner-items-options-${taxCode}`,
        fetchOptions: fetchItemOptions,
      }),
    [itemListHookLike, taxCode, fetchItemOptions],
  );

  const itemSummaryRow = useMemo(
    () => buildItemSummaryRow(itemLinesResponse?.summary, t),
    [itemLinesResponse?.summary, t],
  );

  const itemRowActions = useCallback(
    (row: ErpInvoiceItemRow) => [
      {
        groupLabel: "TRA CỨU",
        items: [
          {
            label: t("viewInvoiceDetail", "Xem chi tiết hóa đơn"),
            icon: React.createElement(Eye, { className: "w-3.5 h-3.5" }),
            onClick: () =>
              onPreviewInvoice?.({
                id: row.invoiceId,
                invoiceNo: row.invoiceNo,
                serialNo: row.serialNo,
              } as any),
          },
        ],
      },
    ],
    [t, onPreviewInvoice],
  );

  return {
    ...filterHook,
    itemLines,
    itemLinesTotal,
    itemLinesTotalPages,
    isLoadingItems,
    itemHeaderFilter,
    itemSummaryRow,
    itemRowActions,
  };
}
