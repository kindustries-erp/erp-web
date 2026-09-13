import { ErpQueryKey, DEFAULT_STALE_TIME } from "@/shared/lib/queryKeys";
import {
  erpInvoicesCoreApi,
  type ErpInvoiceListParams,
  type ErpInvoiceItemListParams,
} from "../api/erpInvoicesCoreApi";
import {
  useErpInvoiceListStore,
  type Direction,
} from "./useErpInvoiceListStore";
import { useErpInvoiceItemsStore } from "./useErpInvoiceItemsStore";
import { getInitialTableState } from "@/shared/hooks/useTableColumnState";

const TAX_TAB_TO_STATUS: Record<string, string[]> = {
  all: [],
  new: ["1"],
  replacement: ["2", "4"],
  adjustment: ["3", "5"],
};

/**
 * Xây dựng Query Key và Query Function chuẩn cho Tab Header Hóa đơn (IN / OUT)
 */
export function getInvoiceHeaderQueryConfig(
  dir: "IN" | "OUT",
  instanceIndex: 1 | 2 = 1,
  partnerTaxCode?: string,
  isDrawer: boolean = false,
) {
  const listDir: Direction = isDrawer
    ? dir === "IN"
      ? "CHECKPOINT_IN"
      : "CHECKPOINT_OUT"
    : instanceIndex === 2
      ? dir === "IN"
        ? "IN_2"
        : "OUT_2"
      : dir;

  const state =
    useErpInvoiceListStore.getState().states[listDir] ||
    useErpInvoiceListStore.getState().states[dir] ||
    useErpInvoiceListStore.getState().states.IN;

  const tableId = `erp-invoices-table-${listDir}`;
  const tableState = getInitialTableState(tableId);

  const activeSort = tableState.sorts?.[0] || "";
  let sortBy = "invoiceDate";
  let sortOrder: "asc" | "desc" = "desc";
  if (activeSort.startsWith("-")) {
    sortBy = activeSort.substring(1);
    sortOrder = "desc";
  } else if (activeSort) {
    sortBy = activeSort;
    sortOrder = "asc";
  }

  const userSelectedStatus = tableState.columnFilters?.taxInvoiceStatus;
  const effectiveColumnFilters = {
    ...(tableState.columnFilters || {}),
  };
  if (userSelectedStatus && userSelectedStatus.length > 0) {
    effectiveColumnFilters.taxInvoiceStatus = userSelectedStatus;
  } else {
    const taxStatusList = TAX_TAB_TO_STATUS[state.activeTaxTab || "all"];
    if (taxStatusList && taxStatusList.length > 0) {
      effectiveColumnFilters.taxInvoiceStatus = taxStatusList;
    } else {
      delete effectiveColumnFilters.taxInvoiceStatus;
    }
  }

  const queryParams: ErpInvoiceListParams = {
    direction: dir,
    partner_tax_code: partnerTaxCode || undefined,
    search: state.search || undefined,
    seller_name: state.seller_name || undefined,
    buyer_name: state.buyer_name || undefined,
    date_from: state.dateFrom ? `${state.dateFrom}T00:00:00` : undefined,
    date_to: state.dateTo ? `${state.dateTo}T23:59:59` : undefined,
    status: state.status || undefined,
    tag_id: state.tag_id || undefined,
    page: state.page || 1,
    pageSize: state.pageSize || 50,
    sort_by: sortBy || undefined,
    sort_order: sortOrder || undefined,
    column_search: JSON.stringify(tableState.columnSearch || {}),
    column_filters: JSON.stringify(effectiveColumnFilters),
  };

  const queryKey = [
    ErpQueryKey.INVOICES_LIST,
    listDir,
    partnerTaxCode,
    state.activeTaxTab,
    state.search,
    state.seller_name,
    state.buyer_name,
    state.dateFrom,
    state.dateTo,
    state.status,
    state.tag_id,
    state.page,
    state.pageSize,
    sortBy,
    sortOrder,
    tableState.columnSearch || {},
    effectiveColumnFilters,
  ];

  return {
    queryKey,
    queryFn: () => erpInvoicesCoreApi.list(queryParams),
    staleTime: DEFAULT_STALE_TIME,
  };
}

/**
 * Xây dựng Query Key và Query Function chuẩn cho Tab Chi tiết dòng hàng Hóa đơn (IN / OUT)
 */
export function getInvoiceLinesQueryConfig(
  dir: "IN" | "OUT",
  instanceIndex: 1 | 2 = 1,
  partnerTaxCode?: string,
) {
  const storeDir: Direction =
    instanceIndex === 2 ? (dir === "IN" ? "IN_2" : "OUT_2") : dir;

  const state =
    useErpInvoiceItemsStore.getState().states[storeDir] ||
    useErpInvoiceItemsStore.getState().states[dir] ||
    useErpInvoiceItemsStore.getState().states.IN;

  const activeSort = state.sorts?.[0] || "";
  let sortBy: string | undefined = undefined;
  let sortOrder: "asc" | "desc" | undefined = undefined;
  if (activeSort.startsWith("-")) {
    sortBy = activeSort.substring(1);
    sortOrder = "desc";
  } else if (activeSort) {
    sortBy = activeSort;
    sortOrder = "asc";
  }

  const queryParams: ErpInvoiceItemListParams = {
    direction: dir,
    page: state.page || 1,
    pageSize: state.pageSize || 50,
    sort_by: sortBy,
    sort_order: sortOrder,
    date_from: state.dateFrom ? `${state.dateFrom}T00:00:00` : undefined,
    date_to: state.dateTo ? `${state.dateTo}T23:59:59` : undefined,
    search: state.search?.trim() || undefined,
    status: state.status || undefined,
    seller_name: state.sellerName?.trim() || undefined,
    buyer_name: state.buyerName?.trim() || undefined,
    tag_id: state.tagId || undefined,
    partner_tax_code: partnerTaxCode || undefined,
  };

  if (state.subcategoryFilter && state.subcategoryFilter !== "ALL") {
    queryParams.invoice_subcategory = state.subcategoryFilter;
  }
  if (state.columnFilters && Object.keys(state.columnFilters).length > 0) {
    queryParams.column_filters = JSON.stringify(state.columnFilters);
  }
  if (state.columnSearch && Object.keys(state.columnSearch).length > 0) {
    queryParams.column_search = JSON.stringify(state.columnSearch);
  }

  const queryKey = [
    ErpQueryKey.INVOICE_ITEMS_LIST,
    dir,
    instanceIndex,
    state.page || 1,
    state.pageSize || 50,
    state.sorts || [],
    state.dateFrom || "",
    state.dateTo || "",
    state.search || "",
    state.status || "",
    state.sellerName || "",
    state.buyerName || "",
    state.tagId || "",
    partnerTaxCode,
    state.subcategoryFilter || "ALL",
    state.columnFilters || {},
    state.columnSearch || {},
  ];

  return {
    queryKey,
    queryFn: () => erpInvoicesCoreApi.getItemsList(queryParams),
    staleTime: DEFAULT_STALE_TIME,
  };
}
